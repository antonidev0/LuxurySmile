import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  hasDayArrived,
  isPast,
  parseSlot,
  toDay,
  transitionError,
  TRANSITIONS,
} from "../../src/lib/appointmentRules.js";
import { freezeClock } from "../helpers.js";

describe("appointmentRules", () => {
  beforeEach(freezeClock);
  afterEach(() => vi.useRealTimers());

  describe("parseSlot", () => {
    it("acepta un horario futuro dentro del horario de la clínica", () => {
      expect(parseSlot("2026-10-27", "09:30")).toEqual({ day: "2026-10-27", date: toDay("2026-10-27"), time: "09:30" });
    });

    it.each([
      ["2026-13-01", "09:00", "Fecha inválida"],
      ["2026-10-27", "9:00", "Hora inválida"],
      ["2026-11-01", "09:00", "La clínica no abre los domingos"],
      ["2026-10-27", "18:00", "Horario laboral: 8:00 a.m. a 5:00 p.m."],
      ["2026-10-26", "08:00", "Esa fecha y hora ya pasaron. Elige un horario futuro."],
    ])("rechaza %s %s", (date, time, message) => {
      expect(() => parseSlot(date, time)).toThrow(message);
    });
  });

  it("calcula el pasado en la zona horaria de la clínica y no en UTC", () => {
    // 12:00 UTC son las 08:00 en Caracas: las 09:00 de hoy aún no han pasado
    expect(isPast("2026-10-26", "09:00")).toBe(false);
    expect(isPast("2026-10-26", "07:59")).toBe(true);
    expect(hasDayArrived(toDay("2026-10-26"))).toBe(true);
    expect(hasDayArrived(toDay("2026-10-27"))).toBe(false);
  });

  it("los estados finales no admiten más cambios", () => {
    expect(TRANSITIONS.completada).toEqual([]);
    expect(TRANSITIONS.cancelada).toEqual([]);
    expect(transitionError("cancelada", "confirmada")).toMatch(/crea una nueva cita/);
  });
});
