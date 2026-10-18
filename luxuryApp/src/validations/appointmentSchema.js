import { z } from 'zod';

// Expresiones regulares
const VALIDATION_NAME = /^[A-ZÑ][a-zA-Z-ÿáéíóúñÑ]+(\s*[A-ZÑ][a-zA-Z-ÿáéíóúñÑ\s]*)$/; 
const ID_NUMBER = /^[VE][0-9]{5,20}$/;
// 08:00 a 16:59, o exactamente 17:00
const TIME_WORK_HOURS = /^((0[89]|1[0-6]):[0-5][0-9]|17:00)$/;

// Convierte "YYYY-MM-DD" en una fecha LOCAL (new Date("YYYY-MM-DD") la toma en UTC
// y en Venezuela eso cae en el día anterior, rompiendo la regla de domingos y de "hoy")
const parseLocalDate = (value) => {
  const [y, m, d] = String(value).split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const appointmentSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: 'El nombre es obligatorio' })
    .regex(VALIDATION_NAME, { message: 'Ambos nombres deben empezar con mayuscula. Ejemplo: Michelle Alejandra' }),

  lastName: z
    .string()
    .min(1, { message: 'El apellido es obligatorio' })
    .regex(VALIDATION_NAME, { message: 'Ambos apellidos deben empezar con mayuscula. Ejemplo: Rodriguez Diaz' }),

  ci: z
    .string()
    .min(1, { message: 'El número de identificación es obligatorio Ejemplo: V12345 o si es extranjero E12345' })
    .regex(ID_NUMBER, { message: 'Número de identificación inválido Ejemplo: V12345 o si es extranjero E12345' }),

  // Se valida como fecha local pero se envía al backend como texto "YYYY-MM-DD"
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha es obligatoria' })
    .refine((value) => {
      // Permite hoy o fechas futuras, pero no domingos
      const date = parseLocalDate(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normaliza la fecha de hoy

      const isSunday = date.getDay() === 0;
      const isTodayOrFuture = date >= today;

      return isTodayOrFuture && !isSunday;
    }, {
      message: "La cita debe ser hoy o en el futuro (excepto domingos)",
    }),


time: z.string()
    .regex(TIME_WORK_HOURS, "Horario laboral: 8:00a.m. a 5:00p.m."),


  email: z
    .string()
    .min(1, { message: 'El correo electrónico es obligatorio' })
    .email("Formato inválido (ej: usuario@gmail.com)") // Validador nativo
    .endsWith(".com", "Solo dominios .com permitidos"),
  });