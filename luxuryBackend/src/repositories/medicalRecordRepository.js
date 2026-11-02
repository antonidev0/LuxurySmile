import { prisma } from "../lib/prisma.js";

// createdById sirve para saber quién puede editarla; el service no lo envía al front
const SUMMARY_FIELDS = {
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  createdByName: true,
  updatedByName: true,
  appointment: { select: { id: true, date: true, time: true } },
};

const RECORD_FIELDS = { ...SUMMARY_FIELDS, data: true };

export const findById = (id, db = prisma) => db.medicalRecord.findUnique({ where: { id }, select: RECORD_FIELDS });

// Para comprobar a qué paciente pertenece una ficha y qué PDF tenía
export const findOwnership = (id) =>
  prisma.medicalRecord.findUnique({
    where: { id },
    select: { id: true, patientCi: true, pdfPath: true, createdById: true },
  });

// Todas las fichas del paciente, de la más reciente a la más antigua, sin su contenido (se ve en el PDF)
export const findAllForPatient = (patientCi) =>
  prisma.medicalRecord.findMany({ where: { patientCi }, orderBy: { createdAt: "desc" }, select: SUMMARY_FIELDS });

export const findLatestForPatient = (patientCi) =>
  prisma.medicalRecord.findFirst({ where: { patientCi }, orderBy: { createdAt: "desc" }, select: RECORD_FIELDS });

export const create = (data, db = prisma) => db.medicalRecord.create({ data, select: { id: true } });

export const update = (id, data, db = prisma) => db.medicalRecord.update({ where: { id }, data, select: { id: true } });
