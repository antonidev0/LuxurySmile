import { describe, expect, it } from "vitest";
import { isAvailableAt, parseAvailability } from "../../src/lib/availability.js";

const MONDAY = new Date("2026-10-26T00:00:00.000Z");
const TUESDAY = new Date("2026-10-27T00:00:00.000Z");

describe("availability", () => {
  it("limpia un horario válido e ignora los días vacíos", () => {
    expect(parseAvailability({ 1: { start: "08:00", end: "12:00" }, 2: null })).toEqual({
      1: { start: "08:00", end: "12:00" },
    });
  });

  it.each([
    [{ 0: { start: "08:00", end: "12:00" } }, "La clínica no abre los domingos"],
    [{ 1: { start: "8:00", end: "12:00" } }, "Las horas deben tener el formato HH:MM"],
    [{ 1: { start: "07:00", end: "12:00" } }, "El horario debe estar entre las 8:00 a.m. y las 5:00 p.m."],
    [{ 1: { start: "12:00", end: "09:00" } }, "La hora de inicio debe ser anterior a la de fin"],
    [{}, "Marca al menos un día de atención"],
  ])("rechaza %j", (input, message) => {
    expect(() => parseAvailability(input)).toThrow(message);
  });

  it("sin horario guardado el doctor atiende en el horario de la clínica", () => {
    expect(isAvailableAt(null, MONDAY, "10:00")).toBe(true);
  });

  it("comprueba el día de la semana y el rango de horas", () => {
    const availability = { 1: { start: "08:00", end: "12:00" } };
    expect(isAvailableAt(availability, MONDAY, "11:00")).toBe(true);
    expect(isAvailableAt(availability, MONDAY, "13:00")).toBe(false);
    expect(isAvailableAt(availability, TUESDAY, "09:00")).toBe(false);
  });
});
