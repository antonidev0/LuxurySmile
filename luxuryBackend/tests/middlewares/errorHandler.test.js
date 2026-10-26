import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { AppError } from "../../src/lib/AppError.js";
import { errorHandler } from "../../src/middlewares/errorHandler.js";

const appThrowing = (error) => {
  const app = express();
  app.get("/", () => {
    throw error;
  });
  app.use(errorHandler);
  return app;
};

describe("errorHandler", () => {
  it("devuelve los errores esperados con { error: { message, code } }", async () => {
    const res = await request(appThrowing(new AppError("Cita no encontrada", 404))).get("/");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      message: "Cita no encontrada",
      error: { message: "Cita no encontrada", code: "NOT_FOUND" },
    });
  });

  it("no filtra mensajes internos ni trazas en los errores inesperados", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const internal = new Error("Invalid `prisma.appointment.findMany()` invocation: email luis@paciente.test");

    const res = await request(appThrowing(internal)).get("/");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      message: "Error del servidor",
      error: { message: "Error del servidor", code: "INTERNAL_ERROR" },
    });
    expect(res.text).not.toContain("prisma");
  });

  it("traduce una violación de unicidad de Prisma a 409 sin exponer su detalle", async () => {
    const prismaError = Object.assign(new Error("Unique constraint failed on the fields: (`email`)"), {
      name: "PrismaClientKnownRequestError",
      code: "P2002",
    });

    const res = await request(appThrowing(prismaError)).get("/");

    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe("Ya existe un registro con esos datos");
  });
});

describe("compatibilidad con el front actual", () => {
  it("repite message y field en la raíz, que es donde los lee el front", async () => {
    const res = await request(
      appThrowing(new AppError("El correo ya se encuentra en uso", 409, { field: "email" })),
    ).get("/");

    expect(res.body).toMatchObject({ message: "El correo ya se encuentra en uso", field: "email" });
    expect(res.body.error).toMatchObject({ code: "CONFLICT", field: "email" });
  });
});
