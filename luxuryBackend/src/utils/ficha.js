// Ficha clínica oficial de la clínica (assets/ficha-luxury-smile.pdf).
// El PDF es un formulario rellenable: aquí se validan los datos de la ficha y se escriben
// en sus campos, así el documento generado es exactamente la ficha de la clínica.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { AppError } from "./AppError.js";

const TEMPLATE_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../assets/ficha-luxury-smile.pdf");

// Preguntas Sí/No de la ficha. La clave es el nombre de la fila en el formulario del PDF
// (L = columna izquierda, R = columna derecha). El frontend usa la misma lista.
export const FICHA_QUESTIONS = {
  L0: "¿Está usted bajo tratamiento médico?",
  L1: "¿Toma actualmente algún medicamento?",
  L2: "¿Le han practicado alguna intervención quirúrgica?",
  L3: "¿Ha recibido alguna transfusión sanguínea?",
  L4: "¿Ha consumido o consume drogas?",
  L5: "Ha presentado reacción alérgica a:",
  L6: "Penicilina",
  L7: "Anestesia",
  L8: "Aspirina, Yodo",
  L9: "Merthiolate, otros",
  L10: "Sufre de tensión arterial:",
  L11: "Alta",
  L12: "Baja",
  L13: "¿Sangra excesivamente al cortarse?",
  L14: "¿Padece o ha padecido algún problema sanguíneo?",
  L15: "Anemia, Leucemia, Hemofilia, Déficit vit. K",
  L16: "¿Es usted V.I.H.+?",
  L17: "¿Toma algún medicamento retroviral?",
  L18: "¿Está usted embarazada?",
  L19: "¿Toma actualmente pastillas anticonceptivas?",
  R0: "Fechas de ciclo menstrual",
  R1: "Sufre o ha sufrido de:",
  R2: "Enfermedades venéreas",
  R3: "Problemas del corazón",
  R4: "Tiene marcapasos o prótesis auricular",
  R5: "Hepatitis",
  R6: "Fiebre reumática",
  R7: "Asma",
  R8: "Diabetes",
  R9: "Úlcera gástrica",
  R10: "¿Sufre de hígado graso?",
  R11: "Tiroides",
  R12: "Respiración bucal",
  R13: "¿Sufre de herpes o aftas recurrentes?",
  R14: "Presenta alguno de los siguientes hábitos:",
  R15: "¿Morderse las uñas o labios?",
  R16: "¿Fuma?",
  R17: "¿Tiene rutina de skin care?",
};

export const BIOTIPOS = ["Eudérmica", "Grasa", "Alípica", "Hidrolítica (acné)", "Mixta"];
export const FOTOTIPOS = ["I", "II", "III", "IV", "V", "VI"];

// Campos de texto: clave en la ficha guardada -> longitud máxima
const TEXT_FIELDS = {
  nombre: 120,
  edad: 3,
  ci: 20,
  direccion: 200,
  lugarNacimiento: 80,
  celular: 25,
  antecedentes: 250,
  motivo: 120,
  dolor: 60,
  control: 30,
  enfermedadActual: 250,
  alergiaOtros: 60,
  fechaCiclo: 40,
  cigarrillosDiarios: 10,
  firma: 80,
  diagnostico: 600,
};

const DATE_FIELDS = ["fecha", "fechaNacimiento"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const clean = (value, max) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// Índice opcional dentro de una lista (biotipo, fototipo)
const optionIndex = (value, options) => {
  if (value === null || value === undefined || value === "") return null;
  const index = Number(value);
  if (!Number.isInteger(index) || index < 0 || index >= options.length) {
    throw new AppError("Opción de la ficha inválida", 400);
  }
  return index;
};

// Valida los datos que envía el doctor y devuelve una ficha limpia (solo campos conocidos)
export const sanitizeFicha = (input) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new AppError("Datos de la ficha inválidos", 400);
  }

  const ficha = {};
  for (const [key, max] of Object.entries(TEXT_FIELDS)) {
    // El diagnóstico admite saltos de línea; el resto es una sola línea
    ficha[key] = key === "diagnostico" ? String(input[key] ?? "").trim().slice(0, max) : clean(input[key], max);
  }
  for (const key of DATE_FIELDS) {
    const value = clean(input[key], 10);
    if (value && !DATE_RE.test(value)) throw new AppError("Fecha de la ficha inválida", 400);
    ficha[key] = value;
  }

  ficha.sexo = ["M", "F"].includes(input.sexo) ? input.sexo : "";

  const respuestas = input.respuestas && typeof input.respuestas === "object" ? input.respuestas : {};
  ficha.respuestas = {};
  for (const key of Object.keys(FICHA_QUESTIONS)) {
    if (respuestas[key] === "si" || respuestas[key] === "no") ficha.respuestas[key] = respuestas[key];
  }

  ficha.biotipo = optionIndex(input.biotipo, BIOTIPOS);
  ficha.fototipo = optionIndex(input.fototipo, FOTOTIPOS);

  if (!ficha.nombre) throw new AppError("El nombre del paciente es obligatorio", 400);
  return ficha;
};

// Ajusta el tamaño de letra para que el texto quepa en el ancho del campo
const fitSize = (font, text, width, max = 9, min = 5) => {
  let size = max;
  while (size > min && font.widthOfTextAtSize(text, size) > width - 4) size -= 0.5;
  return size;
};

// Reparte un texto en líneas que quepan en el ancho dado
const wrapLines = (font, text, width, size) => {
  const lines = [];
  for (const paragraph of text.split(/\r?\n/)) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (line && font.widthOfTextAtSize(next, size) > width - 4) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  return lines;
};

const canDraw = (font, ch) => {
  try {
    font.encodeText(ch);
    return true;
  } catch {
    return false;
  }
};

const splitDate = (value) => (value ? value.split("-").reverse() : ["", "", ""]);

// Genera el PDF de la ficha oficial con los datos dados y devuelve sus bytes
export const renderFichaPDF = async (ficha) => {
  const pdf = await PDFDocument.load(fs.readFileSync(TEMPLATE_PATH));
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const form = pdf.getForm();
  const page = pdf.getPage(0);

  // Helvetica solo cubre el alfabeto latino: se quitan los caracteres que no puede dibujar
  const printable = (text) => [...String(text ?? "")].filter((ch) => ch === "\n" || canDraw(font, ch)).join("");

  // El texto se dibuja sobre la línea de cada campo en lugar de escribirlo en el campo:
  // así se conserva el aspecto original de la ficha (pdf-lib redibujaría los campos con un recuadro)
  const rectOf = (name) => form.getField(name).acroField.getWidgets()[0].getRectangle();
  const drawIn = ({ x, y, width, height }, value, size) => {
    const text = printable(value);
    if (!text) return;
    const fontSize = size ?? fitSize(font, text, width);
    page.drawText(text, { x: x + 2, y: y + (height - fontSize * 0.7) / 2, size: fontSize, font });
  };
  const setText = (name, value) => drawIn(rectOf(name), value);

  const [dia, mes, anio] = splitDate(ficha.fecha);
  setText("fecha_d", dia);
  setText("fecha_m", mes);
  setText("fecha_a", anio);
  setText("nombre", ficha.nombre);
  setText("edad", ficha.edad);
  setText("masc", ficha.sexo === "M" ? "X" : "");
  setText("fem", ficha.sexo === "F" ? "X" : "");
  setText("ci", ficha.ci);
  setText("direccion", ficha.direccion);
  setText("lugar_nac", ficha.lugarNacimiento);
  const [nd, nm, na] = splitDate(ficha.fechaNacimiento);
  setText("fn_d", nd);
  setText("fn_m", nm);
  setText("fn_a", na);
  setText("cel", ficha.celular);
  setText("antecedentes", ficha.antecedentes);
  setText("motivo", ficha.motivo);
  setText("dolor", ficha.dolor);
  setText("control", ficha.control);
  setText("enf_actual", ficha.enfermedadActual);
  setText("firma", ficha.firma);

  for (const key of Object.keys(FICHA_QUESTIONS)) {
    const answer = ficha.respuestas?.[key];
    if (answer === "si") form.getCheckBox(`${key}_si`).check();
    if (answer === "no") form.getCheckBox(`${key}_no`).check();
  }
  if (ficha.biotipo !== null && ficha.biotipo !== undefined) form.getCheckBox(`bio_${ficha.biotipo}`).check();
  if (ficha.fototipo !== null && ficha.fototipo !== undefined) form.getCheckBox(`foto_${ficha.fototipo}`).check();

  // El diagnóstico ocupa las cuatro líneas del recuadro "Diagnóstico y Plan de Tratamiento"
  const diagWidth = rectOf("diag_0").width;
  const diagnostico = printable(ficha.diagnostico);
  let diagSize = 9;
  let diagLines = wrapLines(font, diagnostico, diagWidth, diagSize);
  while (diagLines.length > 4 && diagSize > 5) {
    diagSize -= 0.5;
    diagLines = wrapLines(font, diagnostico, diagWidth, diagSize);
  }
  diagLines.slice(0, 4).forEach((line, i) => drawIn(rectOf(`diag_${i}`), line, diagSize));

  // Datos que la ficha pide pero que no tienen campo en el formulario: se escriben sobre la línea
  const drawAfterLabel = (value, x, y, maxWidth) => {
    const text = printable(value);
    if (!text) return;
    page.drawText(text, { x, y, size: fitSize(font, text, maxWidth, 7), font });
  };
  drawAfterLabel(ficha.alergiaOtros, 96, 450, 160);
  drawAfterLabel(ficha.fechaCiclo, 393, 578, 136);
  drawAfterLabel(ficha.cigarrillosDiarios, 423, 350, 106);

  // Se aplana con las apariencias originales de la ficha (casillas marcadas incluidas)
  // para que el documento guardado no se pueda modificar fuera de la aplicación
  form.flatten({ updateFieldAppearances: false });
  return pdf.save();
};
