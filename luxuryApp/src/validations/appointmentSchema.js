import { z } from 'zod';

// Expresiones regulares
const VALIDATION_NAME = /^[A-ZÑ][a-zA-Z-ÿáéíóúñÑ]+(\s*[A-ZÑ][a-zA-Z-ÿáéíóúñÑ\s]*)$/; 
const ID_NUMBER = /^[VE][0-9]{5,20}$/;
const TIME_12H_FORMAT = /^(0[8-9]|1[0-7]):[0-5][0-9]$/;

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

  date: z.preprocess((arg) => {
    // Convierte el input a Date (maneja strings o Date objects)
    const date = new Date(arg);
    return isNaN(date.getTime()) ? undefined : date;
  }, 
  z.date()
    .refine((date) => {
      // Permite hoy o fechas futuras, pero no domingos
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normaliza la fecha de hoy

      const isSunday = date.getDay() === 0;
      const isTodayOrFuture = date >= today;

      return isTodayOrFuture && !isSunday;
    }, {
      message: "La cita debe ser hoy o en el futuro (excepto domingos)",
    })
  ),


time: z.string()
    .regex(TIME_12H_FORMAT, "Horario laboral: 8:00a.m. a 5:00p.m")
    .refine(time => {
      const [hour] = time.split(':');
      const h = parseInt(hour);
      return h >= 8 && h <= 17; // 8am - 5pm
    }, "Horario laboral: 8:00a.m. a 5:00p.m."),


  email: z
    .string()
    .min(1, { message: 'El correo electrónico es obligatorio' })
    .email("Formato inválido (ej: usuario@gmail.com)") // Validador nativo
    .endsWith(".com", "Solo dominios .com permitidos"),
  });