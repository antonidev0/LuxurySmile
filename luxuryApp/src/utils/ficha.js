// Ficha clínica oficial de la clínica. Las claves de las preguntas (L0..L19, R0..R17) son las
// filas del PDF de la ficha y deben coincidir con FICHA_QUESTIONS en luxuryBackend/src/utils/ficha.js.
import { fromDayKey, todayKey } from "./dates";

// Preguntas Sí/No en el orden de la ficha. sub: opción de la pregunta anterior (se muestra sangrada)
export const QUESTION_COLUMNS = [
  [
    ["L0", "¿Está usted bajo tratamiento médico?"],
    ["L1", "¿Toma actualmente algún medicamento?"],
    ["L2", "¿Le han practicado alguna intervención quirúrgica?"],
    ["L3", "¿Ha recibido alguna transfusión sanguínea?"],
    ["L4", "¿Ha consumido o consume drogas?"],
    ["L5", "¿Ha presentado reacción alérgica?"],
    ["L6", "Penicilina", true],
    ["L7", "Anestesia", true],
    ["L8", "Aspirina, Yodo", true],
    ["L9", "Merthiolate, otros", true],
    ["L10", "¿Sufre de tensión arterial?"],
    ["L11", "Alta", true],
    ["L12", "Baja", true],
    ["L13", "¿Sangra excesivamente al cortarse?"],
    ["L14", "¿Padece o ha padecido algún problema sanguíneo?"],
    ["L15", "Anemia, Leucemia, Hemofilia, Déficit vit. K", true],
    ["L16", "¿Es usted V.I.H.+?"],
    ["L17", "¿Toma algún medicamento retroviral?"],
    ["L18", "¿Está usted embarazada?"],
    ["L19", "¿Toma actualmente pastillas anticonceptivas?"],
  ],
  [
    ["R0", "Fechas de ciclo menstrual"],
    ["R1", "¿Sufre o ha sufrido de alguna enfermedad?"],
    ["R2", "Enfermedades venéreas", true],
    ["R3", "Problemas del corazón", true],
    ["R4", "Marcapasos o prótesis auricular", true],
    ["R5", "Hepatitis", true],
    ["R6", "Fiebre reumática", true],
    ["R7", "Asma", true],
    ["R8", "Diabetes", true],
    ["R9", "Úlcera gástrica", true],
    ["R10", "Hígado graso", true],
    ["R11", "Tiroides", true],
    ["R12", "Respiración bucal", true],
    ["R13", "¿Sufre de herpes o aftas recurrentes?"],
    ["R14", "¿Presenta alguno de los siguientes hábitos?"],
    ["R15", "Morderse las uñas o labios", true],
    ["R16", "Fumar", true],
    ["R17", "¿Tiene rutina de skin care?"],
  ],
];

export const BIOTIPOS = ["Eudérmica", "Grasa", "Alípica", "Hidrolítica (acné)", "Mixta"];
export const FOTOTIPOS = ["I", "II", "III", "IV", "V", "VI"];

export const EMPTY_FICHA = {
  fecha: "",
  nombre: "",
  edad: "",
  sexo: "",
  ci: "",
  direccion: "",
  lugarNacimiento: "",
  fechaNacimiento: "",
  celular: "",
  antecedentes: "",
  motivo: "",
  dolor: "",
  control: "",
  enfermedadActual: "",
  alergiaOtros: "",
  fechaCiclo: "",
  cigarrillosDiarios: "",
  firma: "",
  diagnostico: "",
  respuestas: {},
  biotipo: null,
  fototipo: null,
};

// Completa una ficha guardada con los campos que falten
export const toFicha = (data) => ({ ...EMPTY_FICHA, ...data, respuestas: { ...(data?.respuestas ?? {}) } });

// Edad en años cumplidos a partir de la fecha de nacimiento ("YYYY-MM-DD")
export const ageFrom = (birthKey) => {
  if (!birthKey) return "";
  const birth = fromDayKey(birthKey);
  const today = fromDayKey(todayKey());
  let age = today.getFullYear() - birth.getFullYear();
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1;
  return age >= 0 && age < 150 ? String(age) : "";
};
