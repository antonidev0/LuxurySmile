import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import app from "../../src/app.js";
import * as appointmentRepository from "../../src/repositories/appointmentRepository.js";
import * as staffRepository from "../../src/repositories/staffRepository.js";
import { appointment, bearer } from "../helpers.js";

vi.mock("../../src/repositories/appointmentRepository.js");
vi.mock("../../src/repositories/staffRepository.js");

const sessionAs = (role, id = `${role}-1`) => {
  vi.mocked(staffRepository.findSessionById).mockResolvedValue({ id, role, deactivatedAt: null });
  return bearer(id);
};

describe("privacidad entre doctores", () => {
  it("de los otros doctores de una cita solo se envía el nombre", async () => {
    vi.mocked(appointmentRepository.findAssignedTo).mockResolvedValue([
      appointment({
        status: "completada",
        completedBy: [{ name: "Juan Ruiz", ci: "V1", email: "j@c.test", specialty: "X" }],
      }),
    ]);

    const res = await request(app).get("/api/doctor/appointments").set("Authorization", sessionAs("doctor"));

    expect(res.status).toBe(200);
    expect(res.body[0].completedBy).toEqual([{ name: "Juan Ruiz" }]);
  });
});

describe("lo que el doctor no puede hacer", () => {
  const doctorSession = () => sessionAs("doctor");

  it("no crea citas", async () => {
    const res = await request(app)
      .post("/api/doctor/appointments")
      .set("Authorization", doctorSession())
      .send({ firstName: "Luis", lastName: "Gómez", ci: "V1", email: "l@p.test", date: "2026-11-03", time: "09:00" });

    expect(res.status).toBe(404);
    expect(appointmentRepository.create).not.toHaveBeenCalled();
  });

  it("no crea citas por la ruta de la administración", async () => {
    const res = await request(app)
      .post("/api/admin/appointments")
      .set("Authorization", doctorSession())
      .send({ firstName: "Luis", lastName: "Gómez", ci: "V1", email: "l@p.test", date: "2026-11-03", time: "09:00" });

    expect(res.status).toBe(403);
    expect(appointmentRepository.create).not.toHaveBeenCalled();
  });

  it("no cancela ni confirma sus citas", async () => {
    vi.mocked(staffRepository.findActorById).mockResolvedValue({ name: "Ana", lastName: "Pérez", role: "doctor" });

    for (const status of ["cancelada", "confirmada"]) {
      const res = await request(app)
        .patch("/api/admin/apt-1/updateStatus")
        .set("Authorization", doctorSession())
        .send({ status, reason: "No puedo" });

      expect(res.status).toBe(403);
    }
    expect(appointmentRepository.update).not.toHaveBeenCalled();
  });

  it("no reprograma citas ni cambia horarios", async () => {
    const reschedule = await request(app)
      .patch("/api/admin/apt-1/reschedule")
      .set("Authorization", doctorSession())
      .send({ date: "2026-11-03", time: "09:00" });
    const availability = await request(app)
      .put("/api/doctor/availability")
      .set("Authorization", doctorSession())
      .send({ availability: { 1: { start: "08:00", end: "12:00" } } });
    const othersAvailability = await request(app)
      .put("/api/admin/staff/doctor-2/availability")
      .set("Authorization", doctorSession())
      .send({ availability: { 1: { start: "08:00", end: "12:00" } } });

    expect(reschedule.status).toBe(403);
    expect(availability.status).toBe(404);
    expect(othersAvailability.status).toBe(403);
    expect(staffRepository.update).not.toHaveBeenCalled();
  });

  it("no ve la lista del personal ni la agenda de otros doctores", async () => {
    const staff = await request(app).get("/api/admin/getDoctors").set("Authorization", doctorSession());
    const all = await request(app).get("/api/admin/Allappointments").set("Authorization", doctorSession());

    expect(staff.status).toBe(403);
    expect(all.status).toBe(403);
    expect(staffRepository.findAll).not.toHaveBeenCalled();
  });

  it("no ve el historial administrativo de una cita", async () => {
    const res = await request(app).get("/api/admin/apt-1/history").set("Authorization", doctorSession());
    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/auth/me", () => {
  it("ignora los campos que solo cambia la administración", async () => {
    vi.mocked(staffRepository.findOwnerOf).mockResolvedValue(null);
    vi.mocked(staffRepository.update).mockResolvedValue({ id: "doctor-1" });

    const res = await request(app)
      .patch("/api/auth/me")
      .set("Authorization", sessionAs("doctor"))
      .send({ numberPhone: "+584241234567", address: "Calle 1", email: "otro@c.test", role: "admin", specialty: "X" });

    expect(res.status).toBe(200);
    expect(staffRepository.update).toHaveBeenCalledWith("doctor-1", {
      numberPhone: "+584241234567",
      address: "Calle 1",
    });
  });

  it("valida la nueva contraseña antes de llegar al service", async () => {
    const res = await request(app)
      .patch("/api/auth/me/password")
      .set("Authorization", sessionAs("doctor"))
      .send({ currentPassword: "Actual123", newPassword: "corta" });

    expect(res.status).toBe(400);
    expect(res.body.error.field).toBe("newPassword");
    expect(staffRepository.findPasswordHashById).not.toHaveBeenCalled();
  });
});
