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

describe("PUT /api/doctor/availability", () => {
  it("el doctor guarda su propio horario, nunca el de otro", async () => {
    vi.mocked(appointmentRepository.findOpenAssignedTo).mockResolvedValue([]);
    vi.mocked(staffRepository.update).mockResolvedValue({ id: "doctor-1" });

    const res = await request(app)
      .put("/api/doctor/availability")
      .set("Authorization", sessionAs("doctor"))
      .send({ availability: { 2: { start: "09:00", end: "13:00" } }, id: "doctor-2" });

    expect(res.status).toBe(200);
    expect(staffRepository.update).toHaveBeenCalledWith("doctor-1", {
      availability: { 2: { start: "09:00", end: "13:00" } },
    });
  });

  it("un admin no usa esta ruta", async () => {
    const res = await request(app).put("/api/doctor/availability").set("Authorization", sessionAs("admin")).send({});
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
