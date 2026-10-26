import fs from "fs";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../src/app.js";
import { resolvePdf } from "../../src/lib/pdfStorage.js";
import * as appointmentRepository from "../../src/repositories/appointmentRepository.js";
import * as staffRepository from "../../src/repositories/staffRepository.js";
import { appointment, bearer, staffMember } from "../helpers.js";

vi.mock("../../src/repositories/appointmentRepository.js");
vi.mock("../../src/repositories/staffRepository.js");

const sessionAs = (role, id = `${role}-1`) => {
  vi.mocked(staffRepository.findSessionById).mockResolvedValue({ id, role, deactivatedAt: null });
  return bearer(id);
};

describe("autorización por rol", () => {
  it("un doctor no puede ver la agenda completa de la clínica", async () => {
    const res = await request(app).get("/api/admin/Allappointments").set("Authorization", sessionAs("doctor"));

    expect(res.status).toBe(403);
    expect(appointmentRepository.findAllForAdmin).not.toHaveBeenCalled();
  });

  it("el admin ve la agenda completa", async () => {
    vi.mocked(appointmentRepository.findAllForAdmin).mockResolvedValue([appointment()]);

    const res = await request(app).get("/api/admin/Allappointments").set("Authorization", sessionAs("admin"));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("las rutas del doctor no las usa un admin", async () => {
    const res = await request(app).get("/api/doctor/appointments").set("Authorization", sessionAs("admin"));
    expect(res.status).toBe(403);
  });
});

describe("validación en el borde", () => {
  it("rechaza estados de cita desconocidos sin llegar al service", async () => {
    const res = await request(app)
      .patch("/api/admin/apt-1/updateStatus")
      .set("Authorization", sessionAs("admin"))
      .send({ status: "borrada" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR", field: "status" });
    expect(appointmentRepository.findWithDoctors).not.toHaveBeenCalled();
  });

  it("exige los datos del paciente al crear una cita", async () => {
    const res = await request(app)
      .post("/api/admin/appointments")
      .set("Authorization", sessionAs("admin"))
      .send({ firstName: "Luis", date: "2026-10-27", time: "09:00" });

    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.field)).toEqual(expect.arrayContaining(["lastName", "ci", "email"]));
  });

  it("valida la fecha de las horas ocupadas", async () => {
    const res = await request(app)
      .get("/api/doctor/occupied")
      .query({ date: "mañana" })
      .set("Authorization", sessionAs("doctor"));

    expect(res.status).toBe(400);
  });

  it("los datos del personal se validan antes de guardarse", async () => {
    const res = await request(app)
      .patch("/api/admin/staff/doc-1")
      .set("Authorization", sessionAs("admin"))
      .send({ name: "ana", lastName: "Pérez", email: "ana@clinica.test", numberPhone: "123" });

    expect(res.status).toBe(400);
    expect(res.body.error.field).toBe("name");
  });
});

describe("PATCH /api/admin/:id/upload-pdf", () => {
  let storedPath;
  afterEach(() => storedPath && fs.rmSync(resolvePdf(storedPath), { force: true }));

  beforeEach(() => {
    storedPath = null;
    vi.mocked(appointmentRepository.findWithDoctors).mockResolvedValue(
      appointment({ assignedDoctors: [staffMember()] }),
    );
  });

  it("rechaza un archivo que dice ser PDF pero no lo es", async () => {
    const res = await request(app)
      .patch("/api/admin/apt-1/upload-pdf")
      .set("Authorization", sessionAs("doctor", "doc-1"))
      .attach("pdf", Buffer.from("MZ ejecutable"), { filename: "historia.pdf", contentType: "application/pdf" });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("El archivo no es un PDF válido");
    expect(appointmentRepository.update).not.toHaveBeenCalled();
  });

  it("guarda un PDF real con nombre no adivinable", async () => {
    const res = await request(app)
      .patch("/api/admin/apt-1/upload-pdf")
      .set("Authorization", sessionAs("doctor", "doc-1"))
      .attach("pdf", Buffer.from("%PDF-1.7\n"), { filename: "historia.pdf", contentType: "application/pdf" });

    storedPath = res.body.historialPDF;
    expect(res.status).toBe(200);
    expect(storedPath).toMatch(/^\/uploads\/pdf\/pdf-[0-9a-f-]{36}\.pdf$/);
    expect(appointmentRepository.update).toHaveBeenCalledWith("apt-1", {
      historialPDF: storedPath,
      medicalRecordId: null,
    });
  });
});
