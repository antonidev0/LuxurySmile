import { z } from 'zod';
import { phoneField, VALIDATION_PASSWORD } from './staffSchema';

// Datos de contacto que cada miembro del personal puede cambiar en «Mi perfil»
export const contactSchema = z.object({
  numberPhone: phoneField,
  address: z.string().trim().min(1, { message: 'La dirección es obligatoria' }).max(200, { message: 'Máximo 200 caracteres' }),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Escribe tu contraseña actual' }),
    newPassword: z.string().regex(VALIDATION_PASSWORD, {
      message: 'Mínimo 8 caracteres, con una mayúscula, una minúscula y un número',
    }),
    confirmPassword: z.string().min(1, { message: 'Confirma la nueva contraseña' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ['newPassword'],
    message: 'La nueva contraseña debe ser distinta de la actual',
  });
