import { prisma } from "../config/db.js";
import { DOCTOR_PUBLIC_FIELDS, forDoctor } from "../utils/staffPrivacy.js";

// Citas asignadas al doctor que ha iniciado sesion
export const getMyAppointments = async (request, response) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { assignedDoctors: { some: { id: request.user.id } } },
      include: { assignedDoctors: { select: DOCTOR_PUBLIC_FIELDS } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    response.status(200).json(appointments.map(forDoctor));
  } catch (error) {
    console.error("Error al obtener las citas del doctor:", error);
    response.status(500).json({ message: "Error interno del servidor" });
  }
};
