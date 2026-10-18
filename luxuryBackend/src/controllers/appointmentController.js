// controllers/appointmentController.js
import Appointment from "../models/appointment.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { parse, differenceInMinutes, isSameDay, startOfDay, endOfDay } from "date-fns";
import Staff from "../models/staff.js";

// import { sendEmailNotification } from "../utils/emailService.js"; // si tienes una función para enviar correos

export const createAppointment = async (request, response) => {
  const { firstName, lastName, ci, email, date, time } = request.body;

  if (!firstName || !lastName || !ci || !email || !date || !time) {
    return response.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    // Paso 1: Buscar citas del mismo día
    const appointmentDate = new Date(date); // El campo date ya es una fecha
    const sameDayAppointments = await Appointment.find({
      date: {
        $gte: startOfDay(appointmentDate),
        $lte: endOfDay(appointmentDate)
      }
    });

    // Paso 2: Verificar conflictos de horario (±40 minutos)
    const requestedTime = parse(time, "HH:mm", new Date());

    const hasConflict = sameDayAppointments.some((appt) => {
      const existingTime = parse(appt.time, "HH:mm", new Date());
      const diff = Math.abs(differenceInMinutes(existingTime, requestedTime));
      return diff < 40; // ⚠️ Conflicto si menos de 40 minutos
    });

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
    // await sendEmailNotification(ADMIN_EMAIL, 'Nueva cita solicitada', `El paciente ${firstName} ${lastName}...`);

    response.status(201).json({ message: "Cita registrada exitosamente", appointment: newAppointment });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Error al registrar la cita" });
  }
};

// GET /api/appointments/occupied?date=2025-07-29

export const getOccupiedAppointments = async (request, response) => {
  const { date } = request.query;

  if (!date) return response.status(400).json({ message: "Fecha requerida" });

  try {
    const appointments = await Appointment.find({ date });

    const occupiedTimes = appointments.map((a) => a.time);

    return response.json({ occupiedTimes });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Error al obtener horarios ocupados" });
  }
};
