import { prisma } from "../config/db.js";
import { DATE_FORMAT, FREE_STATUSES, toDay } from "../utils/appointmentRules.js";
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

// GET /api/doctor/occupied?date=2025-07-29
// Horas ocupadas por citas activas de toda la clinica ese dia. Solo las horas: el doctor
// no ve los pacientes de agendas ajenas, pero sí qué horarios no puede proponer.
export const getOccupiedTimes = async (request, response) => {
  const { date } = request.query;

  if (!date || !DATE_FORMAT.test(date)) {
    return response.status(400).json({ message: "Fecha requerida (YYYY-MM-DD)" });
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where: { date: toDay(date), status: { notIn: FREE_STATUSES } },
      select: { time: true },
    });

    response.json({ occupiedTimes: appointments.map((a) => a.time) });
  } catch (error) {
    console.error("Error al obtener horarios ocupados:", error);
    response.status(500).json({ message: "Error al obtener horarios ocupados" });
  }
};
