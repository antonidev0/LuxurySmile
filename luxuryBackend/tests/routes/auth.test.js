import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";
import app from "../../src/app.js";
import { sendMail } from "../../src/lib/mailer.js";
import { hashPassword } from "../../src/lib/password.js";
import { signVerificationToken } from "../../src/lib/tokens.js";
import * as staffRepository from "../../src/repositories/staffRepository.js";
import { bearer, staffMember } from "../helpers.js";

vi.mock("../../src/repositories/staffRepository.js");
vi.mock("../../src/lib/mailer.js", async (importOriginal) => ({ ...(await importOriginal()), sendMail: vi.fn() }));

const PASSWORD = "Secreta123";
const admin = staffMember({ id: "admin-1", role: "admin", email: "admin@clinica.test" });
let passwordHash;

beforeAll(async () => {
  passwordHash = await hashPassword(PASSWORD);
});

const loginAs = (email, password = PASSWORD) => request(app).post("/api/users/login").send({ email, password });

describe("POST /api/users/login", () => {
  it("devuelve el token de sesión con credenciales correctas", async () => {
    vi.mocked(staffRepository.findByEmailWithPassword).mockResolvedValue({ ...admin, passwordHash });

    const res = await loginAs("  ADMIN@clinica.test ");

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ role: "admin", name: "Ana" });
    expect(staffRepository.findByEmailWithPassword).toHaveBeenCalledWith("admin@clinica.test");
    expect(JSON.stringify(res.body)).not.toContain(passwordHash);
  });

  it("responde 401 con el formato de error común si la contraseña no coincide", async () => {
    vi.mocked(staffRepository.findByEmailWithPassword).mockResolvedValue({ ...admin, passwordHash });

    const res = await loginAs(admin.email, "Incorrecta1");

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      message: "Correo o contraseña incorrectos",
      error: { message: "Correo o contraseña incorrectos", code: "INVALID_CREDENTIALS" },
    });
  });

  it("da el mismo error si el correo no existe", async () => {
    vi.mocked(staffRepository.findByEmailWithPassword).mockResolvedValue(null);

    const res = await loginAs("nadie@clinica.test");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("responde 403 si la cuenta no verificó su correo", async () => {
    vi.mocked(staffRepository.findByEmailWithPassword).mockResolvedValue({ ...admin, verified: false, passwordHash });

    const res = await loginAs(admin.email);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("EMAIL_NOT_VERIFIED");
  });

  it("valida el cuerpo antes de consultar la base de datos", async () => {
    const res = await request(app).post("/api/users/login").send({ email: "no-es-correo" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR", field: "email" });
    expect(staffRepository.findByEmailWithPassword).not.toHaveBeenCalled();
  });
});

describe("GET /api/auth/me", () => {
  it("devuelve el usuario de la sesión", async () => {
    vi.mocked(staffRepository.findSessionById).mockResolvedValue({ id: admin.id, role: "admin", deactivatedAt: null });
    vi.mocked(staffRepository.findById).mockResolvedValue(admin);

    const res = await request(app).get("/api/auth/me").set("Authorization", bearer(admin.id));

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(admin.email);
  });

  it("no acepta el enlace de verificación del correo como sesión", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${signVerificationToken(admin.id)}`);

    expect(res.status).toBe(401);
    expect(staffRepository.findSessionById).not.toHaveBeenCalled();
  });

  it("rechaza la sesión de una cuenta dada de baja", async () => {
    vi.mocked(staffRepository.findSessionById).mockResolvedValue({
      id: admin.id,
      role: "admin",
      deactivatedAt: new Date(),
    });

    const res = await request(app).get("/api/auth/me").set("Authorization", bearer(admin.id));

    expect(res.status).toBe(401);
  });

  it("exige token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Token no proporcionado");
  });
});

describe("POST /api/users/register", () => {
  const newDoctor = {
    role: "doctor",
    name: "María",
    lastName: "Rodríguez",
    numberId: "87654321",
    address: "Av. Principal 1",
    numberPhone: "+584241234567",
    birthday: "1990-05-10",
    sex: "mujer",
    specialty: "Endodoncia",
    email: "maria@clinica.test",
    password: "Segura123",
    verified: false,
  };

  const asAdmin = () => {
    vi.mocked(staffRepository.findSessionById).mockResolvedValue({ id: admin.id, role: "admin", deactivatedAt: null });
    return request(app).post("/api/users/register").set("Authorization", bearer(admin.id));
  };

  it("crea al doctor con la contraseña hasheada y envía el correo de verificación", async () => {
    vi.mocked(staffRepository.findOwnerOf).mockResolvedValue(null);
    vi.mocked(staffRepository.create).mockImplementation(async (data) => ({ id: "doc-9", ...data }));

    const res = await asAdmin().send(newDoctor);

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({
      id: "doc-9",
      email: newDoctor.email,
      role: "doctor",
      verified: false,
      emailSent: true,
    });
    const saved = vi.mocked(staffRepository.create).mock.calls[0][0];
    expect(saved).not.toHaveProperty("password");
    expect(saved.passwordHash).toMatch(/^\$2b\$/);
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it("escapa el nombre en el HTML del correo", async () => {
    vi.mocked(staffRepository.findOwnerOf).mockResolvedValue(null);
    vi.mocked(staffRepository.create).mockImplementation(async (data) => ({
      id: "doc-9",
      ...data,
      name: "<img src=x>",
    }));

    await asAdmin().send(newDoctor);

    expect(vi.mocked(sendMail).mock.calls[0][0].html).toContain("&lt;img src=x&gt;");
  });

  it("indica el campo en conflicto si el correo ya existe", async () => {
    vi.mocked(staffRepository.findOwnerOf).mockImplementation(async (field) => (field === "email" ? "otro" : null));

    const res = await asAdmin().send(newDoctor);

    expect(res.status).toBe(409);
    expect(res.body.error).toMatchObject({ field: "email", code: "CONFLICT" });
    expect(staffRepository.create).not.toHaveBeenCalled();
  });

  it("rechaza contraseñas débiles", async () => {
    const res = await asAdmin().send({ ...newDoctor, password: "corta" });

    expect(res.status).toBe(400);
    expect(res.body.error.field).toBe("password");
  });

  it("solo lo puede hacer un administrador", async () => {
    vi.mocked(staffRepository.findSessionById).mockResolvedValue({ id: "doc-1", role: "doctor", deactivatedAt: null });

    const res = await request(app).post("/api/users/register").set("Authorization", bearer("doc-1")).send(newDoctor);

    expect(res.status).toBe(403);
  });
});

describe("GET /api/users/verify/:id/:token", () => {
  it("activa la cuenta con un enlace válido", async () => {
    vi.mocked(staffRepository.findById).mockResolvedValue(staffMember({ verified: false }));

    const res = await request(app).get(`/api/users/verify/doc-1/${signVerificationToken("doc-1")}`);

    expect(res.status).toBe(200);
    expect(staffRepository.update).toHaveBeenCalledWith("doc-1", { verified: true });
  });

  it("rechaza un enlace emitido para otra cuenta", async () => {
    const res = await request(app).get(`/api/users/verify/doc-1/${signVerificationToken("doc-2")}`);

    expect(res.status).toBe(401);
    expect(staffRepository.update).not.toHaveBeenCalled();
  });
});

describe("POST /api/users/resend-verification", () => {
  it("responde igual exista o no la cuenta, sin enviar correo si no existe", async () => {
    vi.mocked(staffRepository.findByEmail).mockResolvedValueOnce(null);
    const unknown = await request(app).post("/api/users/resend-verification").send({ email: "nadie@clinica.test" });

    vi.mocked(staffRepository.findByEmail).mockResolvedValueOnce(staffMember({ verified: false }));
    const pending = await request(app).post("/api/users/resend-verification").send({ email: "ana@clinica.test" });

    expect(unknown.status).toBe(200);
    expect(unknown.body).toEqual(pending.body);
    expect(sendMail).toHaveBeenCalledOnce();
  });
});
