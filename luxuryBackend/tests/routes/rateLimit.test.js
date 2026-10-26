import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import app from "../../src/app.js";
import * as staffRepository from "../../src/repositories/staffRepository.js";

vi.mock("../../src/repositories/staffRepository.js");

describe("rate limit del login", () => {
  it("bloquea con 429 tras 10 intentos fallidos desde la misma IP", async () => {
    vi.mocked(staffRepository.findByEmailWithPassword).mockResolvedValue(null);
    const attempt = () => request(app).post("/api/users/login").send({ email: "x@clinica.test", password: "Mala1234" });

    for (let i = 0; i < 10; i += 1) expect((await attempt()).status).toBe(401);
    const blocked = await attempt();

    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe("TOO_MANY_REQUESTS");
  });
});
