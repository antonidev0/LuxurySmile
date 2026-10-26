import { z } from "zod";
import { email, id, personName, phone, requiredText } from "./common.js";

const ID_NUMBER = /^[0-9]{5,15}$/;
const PASSWORD_POLICY = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export const PASSWORD_POLICY_MESSAGE =
  "La contraseña necesita mínimo 8 caracteres, con una mayúscula, una minúscula y un número";
export const isStrongPassword = (password) => PASSWORD_POLICY.test(password);

const ageOn = (birthday, today = new Date()) => {
  const [y, m, d] = birthday.split("-").map(Number);
  const hadBirthday = today.getMonth() + 1 > m || (today.getMonth() + 1 === m && today.getDate() >= d);
  return today.getFullYear() - y - (hadBirthday ? 0 : 1);
};

export const loginBody = z.object({
  email,
  // Sin reglas de formato: solo se compara con el hash. El máximo evita hashear cadenas enormes.
  password: z.string("La contraseña es obligatoria").min(1, "La contraseña es obligatoria").max(200),
});

export const registerBody = z.object({
  role: z.enum(["doctor", "admin"], "Rol inválido").default("doctor"),
  name: personName("El nombre"),
  lastName: personName("El apellido"),
  numberId: z.string("La cédula es obligatoria").trim().regex(ID_NUMBER, "Cédula inválida: entre 5 y 15 dígitos"),
  address: requiredText("La dirección", 200),
  numberPhone: phone,
  birthday: z
    .string("La fecha de nacimiento es obligatoria")
    .regex(ISO_DAY, "La fecha de nacimiento es obligatoria")
    .refine((value) => ageOn(value) >= 18, "Debe ser mayor de edad (18 años o más)")
    .refine((value) => ageOn(value) < 100, "Revisa la fecha de nacimiento"),
  sex: z.enum(["hombre", "mujer"], "Sexo inválido"),
  specialty: requiredText("La especialidad o cargo", 100),
  email,
  password: z.string(PASSWORD_POLICY_MESSAGE).max(200).regex(PASSWORD_POLICY, PASSWORD_POLICY_MESSAGE),
  // true: el admin activa la cuenta sin esperar al correo de verificación
  verified: z.boolean().default(false),
});

export const resendVerificationBody = z.object({ email });

export const verifyParams = z.object({
  id,
  token: z.string().min(1).max(2048),
});
