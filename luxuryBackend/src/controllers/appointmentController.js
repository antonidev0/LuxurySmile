// controllers/appointmentController.js
import Appointment from "../models/appointment.js";

// Formatos que envia el formulario de citas
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;              // 2025-07-29
const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/;        // 08:30
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OPENING_MINUTES = 8 * 60;  // 08:00
const CLOSING_MINUTES = 17 * 60; // 17:00
const MIN_GAP_MINUTES = 40;

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// La fecha "YYYY-MM-DD" se guarda como medianoche UTC; buscamos todo ese dia en UTC
const dayRange = (date) => {
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { $gte: start, $lt: end };
};

// Las citas canceladas no ocupan horario
const ACTIVE_STATUS = { $ne: "cancelada" };

export const createAppointment = async (request, response) => {
  const { firstName, lastName, ci, email, time } = request.body;
  // Aceptamos "YYYY-MM-DD" o una fecha ISO completa y nos quedamos con el dia
  const date = typeof request.body.date === "string" ? request.body.date.slice(0, 10) : "";

  if (!firstName || !lastName || !ci || !email || !date || !time) {
    return response.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  if (!DATE_FORMAT.test(date) || isNaN(new Date(date).getTime())) {
    return response.status(400).json({ message: "Fecha inválida" });
  }

  if (!TIME_FORMAT.test(time)) {
    return response.status(400).json({ message: "Hora inválida" });
  }

  const minutes = toMinutes(time);
  if (minutes < OPENING_MINUTES || minutes > CLOSING_MINUTES) {
    return response.status(400).json({ message: "Horario laboral: 8:00 a.m. a 5:00 p.m." });
  }

  if (!EMAIL_FORMAT.test(email)) {
    return response.status(400).json({ message: "Correo electrónico inválido" });
  }

  try {
    // Paso 1: Buscar citas activas del mismo día
    const sameDayAppointments = await Appointment.find({
      date: dayRange(date),
      status: ACTIVE_STATUS,
    });

    // Paso 2: Verificar conflictos de horario (±40 minutos)
    const hasConflict = sameDayAppointments.some(
      (appt) => Math.abs(toMinutes(appt.time) - minutes) < MIN_GAP_MINUTES
    );

    if (hasConflict) {
      return response.status(409).json({
        message: "Ya existe una cita en un horario cercano. Debe haber al menos 40 minutos entre citas.",
      });
    }

    const newAppointment = new Appointment({
      firstName,
      lastName,
      ci,
      email,
      date,
      time,
      status: "pendiente"
    });

    await newAppointment.save();

    // Notificar por correo al admin y al paciente (opcional)
    // await sendEmailNotification(email, 'Cita solicitada', 'Tu cita ha sido registrada...');

    response.status(201).json({ message: "Cita registrada exitosamente", appointment: newAppointment });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Error al registrar la cita" });
  }
};

// GET /api/appointment/occupied?date=2025-07-29
// Devuelve solo las horas ocupadas (sin datos de pacientes)
export const getOccupiedAppointments = async (request, response) => {
  const { date } = request.query;

  if (!date || !DATE_FORMAT.test(date)) {
    return response.status(400).json({ message: "Fecha requerida (YYYY-MM-DD)" });
  }

  try {
    const appointments = await Appointment.find(
      { date: dayRange(date), status: ACTIVE_STATUS },
      "time"
    );

    const occupiedTimes = appointments.map((a) => a.time);

    return response.json({ occupiedTimes });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Error al obtener horarios ocupados" });
  }
};
