import { z } from "zod";
import { phone, requiredText } from "./common.js";
import { strongPassword } from "./authSchemas.js";

// Lo único que el personal cambia de su propia ficha. Nombre, cédula, correo, especialidad
// y rol solo los cambia la administración.
export const updateProfileBody = z.object({
  numberPhone: phone,
  address: requiredText("La dirección", 200),
});

export const changePasswordBody = z
  .object({
    // Sin reglas de formato: solo se compara con el hash
    currentPassword: z.string("Escribe tu contraseña actual").min(1, "Escribe tu contraseña actual").max(200),
    newPassword: strongPassword,
  })
  .refine((body) => body.currentPassword !== body.newPassword, {
    message: "La nueva contraseña debe ser distinta de la actual",
    path: ["newPassword"],
  });
