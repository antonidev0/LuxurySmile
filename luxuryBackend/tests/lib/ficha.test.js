import { describe, expect, it } from "vitest";
import { sanitizeFicha } from "../../src/lib/ficha.js";

describe("sanitizeFicha", () => {
  it("se queda solo con los campos conocidos y normaliza fechas y respuestas", () => {
    const ficha = sanitizeFicha({
      nombre: "  Luis   Gómez ",
      fecha: "26/10/2026",
      respuestas: { L0: "si", L1: "quizá", X9: "si" },
      biotipo: "1",
      campoInventado: "<script>",
    });

    expect(ficha.nombre).toBe("Luis Gómez");
    expect(ficha.fecha).toBe("2026-10-26");
    expect(ficha.respuestas).toEqual({ L0: "si" });
    expect(ficha.biotipo).toBe(1);
    expect(ficha).not.toHaveProperty("campoInventado");
  });

  it("exige el nombre del paciente", () => {
    expect(() => sanitizeFicha({ nombre: " " })).toThrow("El nombre del paciente es obligatorio");
  });

  it("rechaza fechas imposibles indicando qué fecha está mal", () => {
    expect(() => sanitizeFicha({ nombre: "Luis", fechaNacimiento: "31/02/1990" })).toThrow(/La fecha de nacimiento/);
  });

  it("rechaza opciones fuera de la lista", () => {
    expect(() => sanitizeFicha({ nombre: "Luis", fototipo: 9 })).toThrow("Opción de la ficha inválida");
  });
});
