import { z } from 'zod';

// Expresiones regulares
const VALIDATION_NAME = /^[A-ZÑ][a-zA-Z-ÿáéíóúñÑ]+(\s*[A-ZÑ][a-zA-Z-ÿáéíóúñÑ\s]*)$/;
const VALIDATION_EMAIL = /^([\w.\-_]+)?\w+@[\w-_]+(\.\w+){1,}$/;
const ID_NUMBER = /^[0-9]{5,15}$/;
const VALIDATION_PASSWORD = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

// Función auxiliar para calcular la edad
const isAdult = (date) => {
  const today = new Date();
  const birthDate = new Date(date);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 18;
};


export const staffSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'El nombre es obligatorio' })
    .regex(VALIDATION_NAME, { message: 'Ambos nombres deben empezar con mayuscula. Ejemplo: Michelle Alejandra' }),

  lastName: z
    .string()
    .min(1, { message: 'El apellido es obligatorio' })
    .regex(VALIDATION_NAME, { message: 'Ambos apellidos deben empezar con mayuscula. Ejemplo: Rodriguez Diaz' }),

  numberId: z
    .string()
    .min(1, { message: 'El número de identificación es obligatorio' })
    .regex(ID_NUMBER, { message: 'Número de identificación inválido' }),

  address: z
    .string()
    .min(1, { message: 'La dirección es obligatoria' }),

  numberPhone: z
    .string()
    .min(1, { message: 'El número de teléfono es obligatorio' })
    .regex(/^\+?\d{7,15}$/, { message: 'Número de teléfono inválido' }),

  birthday: z
    .preprocess((arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
    }, z.date({ required_error: 'La fecha de nacimiento es obligatoria' })
        .refine((date) => isAdult(date), {
        message: "Debes ser mayor de edad (18 años o más)",
      })
    ),

  sex: z
    .enum(['hombre', 'mujer'], { required_error: 'El sexo es obligatorio' }),

  specialty: z
    .string()
    .min(1, { message: 'La especialidad es obligatoria' }),

  email: z
    .string()
    .min(1, { message: 'El correo electrónico es obligatorio' })
    .regex(VALIDATION_EMAIL, { message: 'Correo electrónico inválido. Ejemplo example@example.com' }),

  password: z
    .string()
    .min(1, { message: 'La contraseña es obligatoria' })
    .regex(VALIDATION_PASSWORD, {
      message:
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número',
    }),
    confirmPassword: z.string().min(1, { message: 'Confirma tu contraseña' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });