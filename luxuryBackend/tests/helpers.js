import { vi } from "vitest";
import { signSessionToken } from "../src/lib/tokens.js";

// Lunes 26/10/2026 a las 08:00 en Caracas: los tests de agenda no dependen del día en que se ejecutan
export const NOW = new Date("2026-10-26T12:00:00.000Z");
export const freezeClock = () => vi.useFakeTimers({ now: NOW, toFake: ["Date"] });

export const bearer = (userId) => `Bearer ${signSessionToken(userId)}`;

export const staffMember = (overrides = {}) => ({
  id: "doc-1",
  name: "Ana",
  lastName: "Pérez",
  numberId: "12345678",
  email: "ana@clinica.test",
  specialty: "Ortodoncia",
  role: "doctor",
  verified: true,
  deactivatedAt: null,
  availability: null,
  ...overrides,
});

export const appointment = (overrides = {}) => ({
  id: "apt-1",
  firstName: "Luis",
  lastName: "Gómez",
  ci: "V123",
  email: "luis@paciente.test",
  date: new Date("2026-10-28T00:00:00.000Z"),
  time: "10:00",
  status: "pendiente",
  historialPDF: null,
  medicalRecordId: null,
  assignedDoctors: [],
  ...overrides,
});
