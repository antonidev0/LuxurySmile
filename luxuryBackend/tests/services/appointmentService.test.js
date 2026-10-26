import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as appointmentRepository from "../../src/repositories/appointmentRepository.js";
import * as staffRepository from "../../src/repositories/staffRepository.js";
import { inScheduleTransaction } from "../../src/repositories/transaction.js";
import * as appointmentService from "../../src/services/appointmentService.js";
import { appointment, freezeClock, staffMember } from "../helpers.js";

vi.mock("../../src/repositories/appointmentRepository.js");
vi.mock("../../src/repositories/staffRepository.js");
vi.mock("../../src/repositories/transaction.js");

const admin = { id: "admin-1", role: "admin" };
const doctorUser = { id: "doc-1", role: "doctor" };
const doctor = staffMember();
const TX = {};

beforeEach(() => {
  freezeClock();
  vi.mocked(inScheduleTransaction).mockImplementation((fn) => fn(TX));
  vi.mocked(staffRepository.findActorById).mockResolvedValue({ name: "Admin", lastName: "Clínica", role: "admin" });
  vi.mocked(appointmentRepository.findActiveOnDay).mockResolvedValue([]);
  vi.mocked(appointmentRepository.findForAdmin).mockResolvedValue({ id: "apt-1" });
});
afterEach(() => vi.useRealTimers());

describe("changeStatus", () => {
  it("confirma una cita con doctor y deja constancia en el historial", async () => {
    vi.mocked(appointmentRepository.findWithDoctors).mockResolvedValue(appointment({ assignedDoctors: [doctor] }));
    vi.mocked(staffRepository.findForScheduling).mockResolvedValue([doctor]);

    await appointmentService.changeStatus("apt-1", { status: "confirmada", reason: "" }, admin);

    expect(appointmentRepository.update).toHaveBeenCalledWith("apt-1", { status: "confirmada" }, TX);
    expect(appointmentRepository.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "estado", fromStatus: "pendiente", toStatus: "confirmada", actorId: "admin-1" }),
      TX,
    );
  });

  it("un doctor no puede cerrar citas que no tiene asignadas", async () => {
    vi.mocked(appointmentRepository.findWithDoctors).mockResolvedValue(
      appointment({ assignedDoctors: [staffMember({ id: "doc-2" })] }),
    );

    await expect(appointmentService.changeStatus("apt-1", { status: "no_asistio" }, doctorUser)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(appointmentRepository.update).not.toHaveBeenCalled();
  });

  it("un doctor no puede confirmar ni cancelar", async () => {
    await expect(appointmentService.changeStatus("apt-1", { status: "cancelada" }, doctorUser)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(appointmentRepository.findWithDoctors).not.toHaveBeenCalled();
  });

  it("exige el motivo para cancelar", async () => {
    vi.mocked(appointmentRepository.findWithDoctors).mockResolvedValue(appointment());

    await expect(appointmentService.changeStatus("apt-1", { status: "cancelada", reason: "" }, admin)).rejects.toThrow(
      "Indica el motivo de la cancelación",
    );
  });

  it("al completar guarda una copia de los doctores que atendieron", async () => {
    vi.mocked(appointmentRepository.findWithDoctors).mockResolvedValue(
      appointment({ status: "confirmada", date: new Date("2026-10-26T00:00:00Z"), assignedDoctors: [doctor] }),
    );

    await appointmentService.changeStatus("apt-1", { status: "completada" }, admin);

    expect(appointmentRepository.update).toHaveBeenCalledWith(
      "apt-1",
      {
        status: "completada",
        completedBy: [{ name: "Ana Pérez", ci: "V12345678", email: doctor.email, specialty: "Ortodoncia" }],
      },
      TX,
    );
  });
});

describe("assignDoctor", () => {
  it("rechaza al doctor si ya tiene otra cita que se solapa", async () => {
    vi.mocked(appointmentRepository.findWithDoctors).mockResolvedValue(appointment());
    vi.mocked(appointmentRepository.findActiveOnDay).mockResolvedValue([
      { id: "apt-2", time: "10:20", firstName: "Eva", lastName: "Ruiz", assignedDoctors: [{ id: "doc-1" }] },
    ]);
    vi.mocked(staffRepository.findForScheduling).mockResolvedValue([doctor]);

    await expect(appointmentService.assignDoctor("apt-1", { doctorId: "doc-1" }, admin)).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining("ya tiene otra cita a las 10:20"),
    });
    expect(appointmentRepository.update).not.toHaveBeenCalled();
  });

  it("no asigna doctores dados de baja", async () => {
    vi.mocked(appointmentRepository.findWithDoctors).mockResolvedValue(appointment());
    vi.mocked(staffRepository.findForScheduling).mockResolvedValue([staffMember({ deactivatedAt: new Date() })]);

    await expect(appointmentService.assignDoctor("apt-1", { doctorId: "doc-1" }, admin)).rejects.toThrow(
      /dado de baja/,
    );
  });
});

describe("createForDoctor", () => {
  const patient = { firstName: "Luis", lastName: "Gómez", ci: "V123", email: "luis@paciente.test", reason: "" };

  it("asigna siempre la cita al doctor de la sesión", async () => {
    vi.mocked(staffRepository.findForScheduling).mockResolvedValue([doctor]);
    vi.mocked(appointmentRepository.create).mockResolvedValue({ id: "apt-9" });
    vi.mocked(appointmentRepository.findForDoctor).mockResolvedValue(appointment({ id: "apt-9" }));

    await appointmentService.createForDoctor(
      { ...patient, date: "2026-10-27", time: "09:00", doctorIds: [] },
      doctorUser,
    );

    expect(appointmentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: "confirmada", assignedDoctors: { connect: [{ id: "doc-1" }] } }),
      TX,
    );
  });

  it("no permite crear citas en la agenda de otro doctor", async () => {
    await expect(
      appointmentService.createForDoctor(
        { ...patient, date: "2026-10-27", time: "09:00", doctorIds: ["doc-2"] },
        doctorUser,
      ),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(appointmentRepository.create).not.toHaveBeenCalled();
  });
});

describe("rebook", () => {
  it("solo reagenda citas canceladas o a las que el paciente no asistió", async () => {
    vi.mocked(appointmentRepository.findById).mockResolvedValue(appointment({ status: "confirmada" }));

    await expect(
      appointmentService.rebook("apt-1", { date: "2026-10-27", time: "09:00", doctorIds: [] }, admin),
    ).rejects.toThrow(/usa Reprogramar/);
  });
});
