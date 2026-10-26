import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import {
  signSessionToken,
  signVerificationToken,
  verifySessionToken,
  verifyVerificationToken,
} from "../../src/lib/tokens.js";

describe("tokens", () => {
  it("devuelve el id del usuario de un token de sesión válido", () => {
    expect(verifySessionToken(signSessionToken("user-1"))).toBe("user-1");
  });

  it("no acepta el token de verificación del correo como sesión", () => {
    expect(() => verifySessionToken(signVerificationToken("user-1"))).toThrow(/audience/);
  });

  it("no acepta un token de sesión como enlace de verificación", () => {
    expect(() => verifyVerificationToken(signSessionToken("user-1"))).toThrow(/audience/);
  });

  it("rechaza los tokens antiguos sin propósito declarado", () => {
    const legacy = jwt.sign({ id: "user-1", role: "admin" }, "test-secret", { expiresIn: "1h" });
    expect(() => verifySessionToken(legacy)).toThrow();
  });

  it("rechaza tokens firmados con otro secreto", () => {
    const forged = jwt.sign({}, "otro-secreto", { subject: "user-1", audience: "session" });
    expect(() => verifySessionToken(forged)).toThrow(/signature/);
  });
});
