import { describe, expect, it, vi } from "vitest";
import * as appointmentRepository from "../../src/repositories/appointmentRepository.js";
import * as staffRepository from "../../src/repositories/staffRepository.js";
import * as staffService from "../../src/services/staffService.js";
import { staffMember } from "../helpers.js";

vi.mock("../../src/repositories/appointmentRepository.js");
vi.mock("../../src/repositories/staffRepository.js");

describe("deactivateStaff", () => {
  it("da de baja a un doctor sin citas abiertas", async () => {
    vi.mocked(staffRepository.findById).mockResolvedValue(staffMember());
    vi.mocked(appointmentRepository.findOpenAssignedTo).mockResolvedValue([]);

    await staffService.deactivateStaff("doc-1", "admin-1");

    expect(staffRepository.update).toHaveBeenCalledWith("doc-1", { deactivatedAt: expect.any(Date) });
  });

  it("no da de baja a un doctor con citas abiertas e indica cuáles", async () => {
    vi.mocked(staffRepository.findById).mockResolvedValue(staffMember());
    vi.mocked(appointmentRepository.findOpenAssignedTo).mockResolvedValue([{ id: "apt-1" }]);

    await expect(staffService.deactivateStaff("doc-1", "admin-1")).rejects.toMatchObject({
      statusCode: 409,
      details: { appointments: [{ id: "apt-1" }] },
    });
    expect(staffRepository.update).not.toHaveBeenCalled();
  });

  it("siempre deja al menos un administrador activo", async () => {
    vi.mocked(staffRepository.findById).mockResolvedValue(staffMember({ id: "admin-2", role: "admin" }));
    vi.mocked(staffRepository.countActiveAdmins).mockResolvedValue(1);

    await expect(staffService.deactivateStaff("admin-2", "admin-1")).rejects.toThrow(/al menos un administrador/);
  });

  it("nadie puede darse de baja a sí mismo", async () => {
    vi.mocked(staffRepository.findById).mockResolvedValue(staffMember({ id: "admin-1", role: "admin" }));

    await expect(staffService.deactivateStaff("admin-1", "admin-1")).rejects.toThrow(/tu propia cuenta/);
  });
});

describe("updateStaff", () => {
  const changes = { name: "Ana", lastName: "Pérez", email: "nuevo@clinica.test", numberPhone: "+584241234567" };

  it("indica el campo si el correo ya lo usa otra persona", async () => {
    vi.mocked(staffRepository.findById).mockResolvedValue(staffMember());
    vi.mocked(staffRepository.findOwnerOf).mockImplementation(async (field) => (field === "email" ? "doc-2" : null));

    await expect(staffService.updateStaff("doc-1", { ...changes, specialty: "Ortodoncia" })).rejects.toMatchObject({
      statusCode: 409,
      field: "email",
    });
  });

  it("permite conservar su propio correo", async () => {
    vi.mocked(staffRepository.findById).mockResolvedValue(staffMember());
    vi.mocked(staffRepository.findOwnerOf).mockResolvedValue("doc-1");

    await staffService.updateStaff("doc-1", { ...changes, specialty: "Ortodoncia" });

    expect(staffRepository.update).toHaveBeenCalledWith("doc-1", { ...changes, specialty: "Ortodoncia" });
  });

  it("exige la especialidad a los doctores", async () => {
    vi.mocked(staffRepository.findById).mockResolvedValue(staffMember());

    await expect(staffService.updateStaff("doc-1", { ...changes, specialty: "" })).rejects.toMatchObject({
      field: "specialty",
    });
  });
});
