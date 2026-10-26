import { z } from "zod";

// Mensajes por defecto en español para los casos que no llevan uno propio
z.config(z.locales.es());

// Mismas reglas que el formulario del front
const NAME_PART = "[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñü'-]+";
const NAME_FORMAT = new RegExp(`^${NAME_PART}(\\s${NAME_PART})*$`);
const PHONE_FORMAT = /^\+?\d{7,15}$/;

export const id = z
  .string("Identificador inválido")
  .trim()
  .min(1, "Identificador inválido")
  .max(64, "Identificador inválido");

// El front envía null o nada cuando no hay valor
export const optionalId = id.nullish().transform((value) => value ?? undefined);

export const idParams = z.object({ id });

export const requiredText = (label, max) =>
  z
    .string(`${label} es obligatorio`)
    .trim()
    .min(1, `${label} es obligatorio`)
    .max(max, `${label} admite como máximo ${max} caracteres`);

// Texto libre opcional (motivos y notas); vacío equivale a no enviarlo
export const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .nullish()
    .transform((value) => value || "");

export const email = z
  .string("El correo es obligatorio")
  .trim()
  .toLowerCase()
  .pipe(z.email("Correo electrónico inválido").max(200, "Correo electrónico inválido"));

export const personName = (label) =>
  requiredText(label, 100).regex(NAME_FORMAT, `${label} inválido: cada palabra debe empezar con mayúscula`);

export const phone = z.string("El teléfono es obligatorio").trim().regex(PHONE_FORMAT, "Teléfono inválido");

// Lista de ids de doctores, sin repetidos
export const doctorIds = z
  .array(id, "Lista de doctores inválida")
  .max(10, "Demasiados doctores")
  .transform((ids) => [...new Set(ids)]);

// El formato exacto y las reglas de la agenda (horario, días, pasado) los comprueba parseSlot
export const slotFields = {
  date: z.string("Fecha inválida"),
  time: z.string("Hora inválida"),
};
