import { z } from 'zod';

// Expresiones regulares
const NAME_PART = "[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñü'-]+";
const VALIDATION_NAME = new RegExp(`^${NAME_PART}(\\s${NAME_PART})*$`);
const ID_NUMBER = /^[0-9]{5,15}$/;
const PHONE = /^\+?\d{7,15}$/;
const VALIDATION_PASSWORD = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

// Edad cumplida a partir de "YYYY-MM-DD"
const ageFrom = (value) => {
  const [y, m, d] = value.split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
  return age;
};

export const STAFF_ROLES = ['doctor', 'admin'];

export const staffSchema = z
  .object({
    role: z.enum(STAFF_ROLES, { errorMap: () => ({ message: 'Elige el rol' }) }),

    name: z
      .string()
      .trim()
      .min(1, { message: 'El nombre es obligatorio' })
      .regex(VALIDATION_NAME, { message: 'Cada nombre debe empezar con mayúscula. Ej: Michelle Alejandra' }),

    lastName: z
      .string()
      .trim()
      .min(1, { message: 'El apellido es obligatorio' })
      .regex(VALIDATION_NAME, { message: 'Cada apellido debe empezar con mayúscula. Ej: Rodríguez Díaz' }),

    numberId: z
      .string()
      .trim()
      .min(1, { message: 'La cédula es obligatoria' })
      .regex(ID_NUMBER, { message: 'Solo números, entre 5 y 15 dígitos' }),

    address: z.string().trim().min(1, { message: 'La dirección es obligatoria' }),

    numberPhone: z
      .string()
      .trim()
      .min(1, { message: 'El teléfono es obligatorio' })
      .regex(PHONE, { message: 'Entre 7 y 15 dígitos, puede empezar con +. Ej: +584241234567' }),

    // Se envía al backend como "YYYY-MM-DD"
    birthday: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha de nacimiento es obligatoria' })
      .refine((value) => ageFrom(value) >= 18, { message: 'Debe ser mayor de edad (18 años o más)' })
      .refine((value) => ageFrom(value) < 100, { message: 'Revisa la fecha de nacimiento' }),

    sex: z.enum(['hombre', 'mujer'], { errorMap: () => ({ message: 'Elige una opción' }) }),

    specialty: z.string().trim().min(1, { message: 'La especialidad o cargo es obligatorio' }),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, { message: 'El correo es obligatorio' })
      .email({ message: 'Correo inválido. Ej: nombre@gmail.com' }),

    password: z
      .string()
      .regex(VALIDATION_PASSWORD, {
        message: 'Mínimo 8 caracteres, con una mayúscula, una minúscula y un número',
      }),

    confirmPassword: z.string().min(1, { message: 'Confirma la contraseña' }),

    // true: la cuenta queda activa sin esperar al correo de verificación
    verified: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });
