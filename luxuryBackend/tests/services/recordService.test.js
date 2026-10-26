import { beforeEach, describe, expect, it, vi } from "vitest";
import { removePdf, savePdf } from "../../src/lib/pdfStorage.js";
import * as appointmentRepository from "../../src/repositories/appointmentRepository.js";
import * as medicalRecordRepository from "../../src/repositories/medicalRecordRepository.js";
import * as staffRepository from "../../src/repositories/staffRepository.js";
import { inTransaction } from "../../src/repositories/transaction.js";
import * as recordService from "../../src/services/recordService.js";
import { appointment, staffMember } from "../helpers.js";

vi.mock("../../src/repositories/appointmentRepository.js");
vi.mock("../../src/repositories/medicalRecordRepository.js");
vi.mock("../../src/repositories/staffRepository.js");
vi.mock("../../src/repositories/transaction.js");
vi.mock("../../src/lib/pdfStorage.js");
vi.mock("../../src/lib/ficha.js", async (importOriginal) => ({
  ...(await importOriginal()),
  renderFichaPDF: vi.fn(async () => new Uint8Array([1])),
}));

const doctorUser = { id: "doc-1", role: "doctor" };
const ownAppointment = appointment({ ci: "v 123", assignedDoctors: [staffMember()] });
const TX = {};

beforeEach(() => {
  vi.mocked(inTransaction).mockImplementation((fn) => fn(TX));
  vi.mocked(staffRepository.findActorById).mockResolvedValue({ name: "Ana", lastName: "Pérez", role: "doctor" });
  vi.mocked(savePdf).mockResolvedValue("/uploads/pdf/ficha-nueva.pdf");
});

describe("saveRecord", () => {
  it("crea una ficha nueva agrupada por la cédula normalizada del paciente", async () => {
    vi.mocked(appointmentRepository.findWithDoctors).mockResolvedValue(ownAppointment);
    vi.mocked(medicalRecordRepository.create).mockResolvedValue({ id: "rec-1" });
    vi.mocked(medicalRecordRepository.findById).mockResolvedValue({ id: "rec-1" });

    const result = await recordService.saveRecord("apt-1", { data: { nombre: "Luis" } }, doctorUser);

    expect(result).toMatchObject({ created: true, historialPDF: "/uploads/pdf/ficha-nueva.pdf" });
    expect(medicalRecordRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ patientCi: "V123", appointmentId: "apt-1", createdById: "doc-1" }),
      TX,
    );
  });

  it("un doctor no accede a la historia clínica de citas que no tiene asignadas", async () => {
    vi.mocked(appointmentRepository.findWithDoctors).mockResolvedValue(appointment({ assignedDoctors: [] }));

    await expect(recordService.saveRecord("apt-1", { data: { nombre: "Luis" } }, doctorUser)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(savePdf).not.toHaveBeenCalled();
  });

  it("no permite editar la ficha de otro paciente", async () => {
    vi.mocked(appointmentRepository.findWithDoctors).mockResolvedValue(ownAppointment);
    vi.mocked(medicalRecordRepository.findOwnership).mockResolvedValue({ id: "rec-9", patientCi: "V999" });

    await expect(
      recordService.saveRecord("apt-1", { recordId: "rec-9", data: { nombre: "Luis" } }, doctorUser),
    ).rejects.toThrow("La ficha no pertenece a este paciente");
  });

  it("borra el PDF generado si falla el guardado", async () => {
    vi.mocked(appointmentRepository.findWithDoctors).mockResolvedValue(ownAppointment);
    vi.mocked(inTransaction).mockRejectedValue(new Error("db caída"));

    await expect(recordService.saveRecord("apt-1", { data: { nombre: "Luis" } }, doctorUser)).rejects.toThrow(
      "db caída",
    );
    expect(removePdf).toHaveBeenCalledWith("/uploads/pdf/ficha-nueva.pdf");
  });
});

describe("attachUploadedPdf", () => {
  it("borra el archivo subido si el doctor no tiene asignada la cita", async () => {
    vi.mocked(appointmentRepository.findWithDoctors).mockResolvedValue(appointment({ assignedDoctors: [] }));
    vi.mocked(removePdf).mockResolvedValue();

    await expect(recordService.attachUploadedPdf("apt-1", { filename: "pdf-x.pdf" }, doctorUser)).rejects.toMatchObject(
      { statusCode: 403 },
    );
    expect(appointmentRepository.update).not.toHaveBeenCalled();
    expect(removePdf).toHaveBeenCalled();
  });
});
