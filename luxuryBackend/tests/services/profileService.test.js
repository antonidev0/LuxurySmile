import { describe, expect, it, vi } from "vitest";
import { hashPassword, verifyPassword } from "../../src/lib/password.js";
import * as appointmentRepository from "../../src/repositories/appointmentRepository.js";
import * as staffRepository from "../../src/repositories/staffRepository.js";
import * as profileService from "../../src/services/profileService.js";
import { freezeClock } from "../helpers.js";

vi.mock("../../src/repositories/appointmentRepository.js");
vi.mock("../../src/repositories/staffRepository.js");

describe("updateOwnProfile", () => {
  it("guarda solo el teléfono y la dirección", async () => {
    vi.mocked(staffRepository.findOwnerOf).mockResolvedValue(null);

    await profileService.updateOwnProfile("doc-1", { numberPhone: "+584241234567", address: "Calle 1" });

    expect(staffRepository.update).toHaveBeenCalledWith("doc-1", { numberPhone: "+584241234567", address: "Calle 1" });
  });

  it("indica el campo si el teléfono ya lo usa otra persona", async () => {
    vi.mocked(staffRepository.findOwnerOf).mockResolvedValue("doc-2");

    await expect(
      profileService.updateOwnProfile("doc-1", { numberPhone: "+584241234567", address: "Calle 1" }),
    ).rejects.toMatchObject({ statusCode: 409, field: "numberPhone" });
  });
});

describe("changeOwnPassword", () => {
  it("cambia la contraseña si la actual es correcta", async () => {
    vi.mocked(staffRepository.findPasswordHashById).mockResolvedValue({
      id: "doc-1",
      passwordHash: await hashPassword("Actual123"),
    });

    await profileService.changeOwnPassword("doc-1", { currentPassword: "Actual123", newPassword: "Nueva1234" });

    const [, { passwordHash }] = vi.mocked(staffRepository.update).mock.calls.at(-1);
    expect(await verifyPassword("Nueva1234", passwordHash)).toBe(true);
  });

  it("rechaza el cambio si la contraseña actual no coincide", async () => {
    vi.mocked(staffRepository.findPasswordHashById).mockResolvedValue({
      id: "doc-1",
      passwordHash: await hashPassword("Actual123"),
    });
    vi.mocked(staffRepository.update).mockClear();

    await expect(
      profileService.changeOwnPassword("doc-1", { currentPassword: "Otra1234", newPassword: "Nueva1234" }),
    ).rejects.toMatchObject({ statusCode: 400, field: "currentPassword" });
    expect(staffRepository.update).not.toHaveBeenCalled();
  });
});

describe("updateOwnAvailability", () => {
  const mondayMorning = { 1: { start: "08:00", end: "12:00" } };

  it("guarda el horario si ninguna cita futura queda fuera", async () => {
    freezeClock();
    vi.mocked(appointmentRepository.findOpenAssignedTo).mockResolvedValue([
      { id: "apt-1", date: new Date("2026-11-02T00:00:00.000Z"), time: "09:00" },
    ]);

    await profileService.updateOwnAvailability("doc-1", mondayMorning);

    expect(staffRepository.update).toHaveBeenCalledWith("doc-1", { availability: mondayMorning });
    vi.useRealTimers();
  });

  it("no lo guarda si deja fuera citas abiertas e indica cuáles", async () => {
    freezeClock();
    vi.mocked(staffRepository.update).mockClear();
    const outside = { id: "apt-2", date: new Date("2026-11-03T00:00:00.000Z"), time: "10:00" };
    vi.mocked(appointmentRepository.findOpenAssignedTo).mockResolvedValue([outside]);

    await expect(profileService.updateOwnAvailability("doc-1", mondayMorning)).rejects.toMatchObject({
      statusCode: 409,
      details: { appointments: [outside] },
    });
    expect(staffRepository.update).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
