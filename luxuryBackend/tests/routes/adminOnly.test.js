import jwt from "jsonwebtoken";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import app from "../../src/app.js";
import * as appointmentRepository from "../../src/repositories/appointmentRepository.js";
import * as medicalRecordRepository from "../../src/repositories/medicalRecordRepository.js";
import * as staffRepository from "../../src/repositories/staffRepository.js";
import { bearer } from "../helpers.js";

vi.mock("../../src/repositories/appointmentRepository.js");
vi.mock("../../src/repositories/medicalRecordRepository.js");
vi.mock("../../src/repositories/staffRepository.js");

const PATIENT = { firstName: "Luis", lastName: "Gómez", ci: "V123", email: "luis@paciente.test" };
const SLOT = { date: "2026-12-01", time: "10:00" };
const STAFF = {
  name: "Ana",
  lastName: "Pérez",
  email: "ana@clinica.test",
  numberPhone: "+584241234567",
  specialty: "Ortodoncia",
};

// Todo lo que solo puede hacer la administración, con cuerpos válidos: si faltara la comprobación del rol,
// la petición llegaría a la base de datos y el test lo detectaría
const ADMIN_ONLY = [
  ["ver todas las citas", "get", "/api/admin/Allappointments"],
  ["crear una cita", "post", "/api/admin/appointments", { ...PATIENT, ...SLOT, doctorIds: [] }],
  ["asignar un doctor", "put", "/api/admin/apt-1/assign-doctor", { doctorId: "doc-2" }],
  ["quitar un doctor", "delete", "/api/admin/apt-1/assign-doctor/doc-2"],
  ["reprogramar una cita", "patch", "/api/admin/apt-1/reschedule", SLOT],
  ["crear una cita a partir de otra", "post", "/api/admin/apt-1/rebook", { ...SLOT, doctorIds: [] }],
  ["ver el historial de una cita", "get", "/api/admin/apt-1/history"],
  ["añadir una nota", "post", "/api/admin/apt-1/notes", { note: "Nota" }],
  ["ver el personal", "get", "/api/admin/getDoctors"],
  ["activar una cuenta", "patch", "/api/admin/staff/doc-2/verify"],
  ["editar los datos de un miembro del personal", "patch", "/api/admin/staff/doc-2", STAFF],
  [
    "cambiar el horario de un doctor",
    "put",
    "/api/admin/staff/doc-2/availability",
    { availability: { 1: { start: "08:00", end: "12:00" } } },
  ],
  ["dar de baja", "patch", "/api/admin/staff/doc-2/deactivate"],
  ["reactivar", "patch", "/api/admin/staff/doc-2/reactivate"],
  ["cambiar el rol", "patch", "/api/admin/staff/doc-2/role", { role: "admin", specialty: "" }],
  [
    "registrar personal",
    "post",
    "/api/users/register",
    {
      ...STAFF,
      role: "admin",
      numberId: "12345678",
      address: "Calle 1",
      birthday: "1990-01-01",
      sex: "mujer",
      password: "Segura123",
    },
  ],
];

// Rutas que exigen sesión de cualquier miembro del personal
const STAFF_ONLY = [
  ["ver su perfil", "get", "/api/auth/me"],
  ["editar su perfil", "patch", "/api/auth/me", { numberPhone: "+584241234567", address: "Calle 1" }],
  [
    "cambiar su contraseña",
    "patch",
    "/api/auth/me/password",
    { currentPassword: "Actual123", newPassword: "Nueva1234" },
  ],
  ["cerrar una cita", "patch", "/api/admin/apt-1/updateStatus", { status: "completada" }],
  ["descargar un historial", "get", "/api/admin/apt-1/pdf"],
  ["ver la ficha clínica", "get", "/api/pdf/appointments/apt-1/ficha"],
  ["guardar la ficha clínica", "post", "/api/pdf/appointments/apt-1/ficha", { data: { nombre: "Luis" } }],
  ["ver la historia del paciente", "get", "/api/pdf/appointments/apt-1/records"],
  ["descargar una ficha", "get", "/api/pdf/records/rec-1/pdf"],
  ["ver sus citas (doctor)", "get", "/api/doctor/appointments"],
];

const send = ([, method, path, body], authorization) => {
  const req = request(app)[method](path);
  if (authorization) req.set("Authorization", authorization);
  return body ? req.send(body) : req;
};

// Ninguna consulta ni escritura salvo, como mucho, la lectura de la sesión
const expectDatabaseUntouched = () => {
  for (const repository of [appointmentRepository, medicalRecordRepository, staffRepository]) {
    for (const [name, fn] of Object.entries(repository)) {
      if (name === "findSessionById" || !vi.isMockFunction(fn)) continue;
      expect(fn, name).not.toHaveBeenCalled();
    }
  }
};

const sessionAs = (session) => {
  vi.mocked(staffRepository.findSessionById).mockResolvedValue(session);
  return bearer(session?.id ?? "admin-1");
};

const forged = (secret, options = {}) =>
  `Bearer ${jwt.sign({}, secret, { subject: "admin-1", audience: "session", ...options })}`;

const INTRUDERS = [
  ["un doctor", () => sessionAs({ id: "doc-1", role: "doctor", deactivatedAt: null }), 403],
  [
    "un admin que pasó a doctor (rol leído de la base de datos)",
    () => sessionAs({ id: "admin-1", role: "doctor", deactivatedAt: null }),
    403,
  ],
  ["un admin dado de baja", () => sessionAs({ id: "admin-1", role: "admin", deactivatedAt: new Date() }), 401],
  ["una cuenta borrada", () => sessionAs(null), 401],
  ["alguien sin sesión", () => undefined, 401],
  ["un token malformado", () => "Token abc", 401],
  ["un token firmado con otra clave", () => forged("otra-clave"), 401],
  [
    "un token caducado",
    () => `Bearer ${jwt.sign({ exp: 1 }, "test-secret", { subject: "admin-1", audience: "session" })}`,
    401,
  ],
  ["un enlace de verificación usado como sesión", () => forged("test-secret", { audience: "email-verification" }), 401],
  ["un token sin firma (alg none)", () => forged(null, { algorithm: "none" }), 401],
];

describe.each(INTRUDERS)("acciones de administración con %s", (_, authorize, status) => {
  it.each(ADMIN_ONLY)(`no puede %s (${status})`, async (...route) => {
    vi.mocked(staffRepository.findSessionById).mockResolvedValue({ id: "admin-1", role: "admin", deactivatedAt: null });
    const res = await send(route, authorize());

    expect(res.status).toBe(status);
    expectDatabaseUntouched();
  });
});

describe.each(INTRUDERS.filter(([, , status]) => status === 401))("rutas del personal con %s", (_, authorize) => {
  it.each(STAFF_ONLY)("no puede %s (401)", async (...route) => {
    vi.mocked(staffRepository.findSessionById).mockResolvedValue({ id: "admin-1", role: "admin", deactivatedAt: null });
    const res = await send(route, authorize());

    expect(res.status).toBe(401);
    expectDatabaseUntouched();
  });
});
