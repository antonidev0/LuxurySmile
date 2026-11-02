import jwt from "jsonwebtoken";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../src/app.js";
import * as appointmentRepository from "../../src/repositories/appointmentRepository.js";
import * as staffRepository from "../../src/repositories/staffRepository.js";
import { inScheduleTransaction } from "../../src/repositories/transaction.js";
import { appointment, bearer, freezeClock } from "../helpers.js";

vi.mock("../../src/repositories/appointmentRepository.js");
vi.mock("../../src/repositories/staffRepository.js");
vi.mock("../../src/repositories/transaction.js");

// Solo la administración crea citas: cualquier otra petición se rechaza sin llegar a la base de datos
const NEW_APPOINTMENT = {
  firstName: "Luis",
  lastName: "Gómez",
  ci: "V123",
  email: "luis@paciente.test",
  date: "2026-10-28",
  time: "10:00",
  doctorIds: [],
};

const create = (authorization) => {
  const req = request(app).post("/api/admin/appointments");
  if (authorization) req.set("Authorization", authorization);
  return req.send(NEW_APPOINTMENT);
};

const sessionAs = (role, { id = `${role}-1`, deactivatedAt = null } = {}) => {
  vi.mocked(staffRepository.findSessionById).mockResolvedValue({ id, role, deactivatedAt });
  return bearer(id);
};

const expectNothingCreated = () => {
  expect(appointmentRepository.create).not.toHaveBeenCalled();
  expect(appointmentRepository.createEvent).not.toHaveBeenCalled();
};

beforeEach(() => {
  freezeClock();
  vi.mocked(inScheduleTransaction).mockImplementation((fn) => fn({}));
});

afterEach(() => vi.useRealTimers());

describe("POST /api/admin/appointments: quién puede crear citas", () => {
  it("el admin crea la cita", async () => {
    sessionAs("admin");
    vi.mocked(staffRepository.findActorById).mockResolvedValue({ name: "Ana", lastName: "Pérez", role: "admin" });
    vi.mocked(appointmentRepository.findActiveOnDay).mockResolvedValue([]);
    vi.mocked(appointmentRepository.create).mockResolvedValue({ id: "apt-1" });
    vi.mocked(appointmentRepository.findForAdmin).mockResolvedValue(appointment());

    const res = await create(bearer("admin-1"));

    expect(res.status).toBe(201);
    expect(appointmentRepository.create).toHaveBeenCalledOnce();
  });

  it("un doctor no puede crear citas", async () => {
    const res = await create(sessionAs("doctor"));

    expect(res.status).toBe(403);
    expectNothingCreated();
  });

  it("el rol se lee de la base de datos: un admin que pasó a doctor ya no crea citas con su sesión anterior", async () => {
    const res = await create(sessionAs("doctor", { id: "admin-1" }));

    expect(res.status).toBe(403);
    expectNothingCreated();
  });

  it("sin sesión no se pueden crear citas", async () => {
    const res = await create();

    expect(res.status).toBe(401);
    expect(staffRepository.findSessionById).not.toHaveBeenCalled();
    expectNothingCreated();
  });

  it.each([
    ["malformado", "Token abc"],
    ["sin token", "Bearer "],
    ["firmado con otra clave", `Bearer ${jwt.sign({}, "otra-clave", { subject: "admin-1", audience: "session" })}`],
    ["caducado", `Bearer ${jwt.sign({ exp: 1 }, "test-secret", { subject: "admin-1", audience: "session" })}`],
    [
      "de verificación de correo",
      `Bearer ${jwt.sign({}, "test-secret", { subject: "admin-1", audience: "email-verification" })}`,
    ],
    [
      "sin firma (alg none)",
      `Bearer ${jwt.sign({}, null, { subject: "admin-1", audience: "session", algorithm: "none" })}`,
    ],
  ])("rechaza un token %s", async (_, authorization) => {
    vi.mocked(staffRepository.findSessionById).mockResolvedValue({ id: "admin-1", role: "admin", deactivatedAt: null });

    const res = await create(authorization);

    expect(res.status).toBe(401);
    expectNothingCreated();
  });

  it("un admin dado de baja no puede crear citas", async () => {
    const res = await create(sessionAs("admin", { deactivatedAt: new Date() }));

    expect(res.status).toBe(401);
    expectNothingCreated();
  });

  it("una cuenta borrada no puede crear citas", async () => {
    vi.mocked(staffRepository.findSessionById).mockResolvedValue(null);

    const res = await create(bearer("admin-1"));

    expect(res.status).toBe(401);
    expectNothingCreated();
  });

  it("no existe ninguna otra ruta para crear citas", async () => {
    const doctor = sessionAs("doctor");
    const attempts = await Promise.all([
      request(app).post("/api/doctor/appointments").set("Authorization", doctor).send(NEW_APPOINTMENT),
      request(app).post("/api/appointment").send(NEW_APPOINTMENT),
      request(app).post("/api/appointments").send(NEW_APPOINTMENT),
    ]);

    expect(attempts.map((res) => res.status)).toEqual([404, 404, 404]);
    expectNothingCreated();
  });
});
