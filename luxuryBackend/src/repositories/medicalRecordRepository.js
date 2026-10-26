import { prisma } from "../lib/prisma.js";

const RECORD_FIELDS = {
  id: true,
  data: true,
  createdAt: true,
  updatedAt: true,
  createdByName: true,
  updatedByName: true,
  appointment: { select: { id: true, date: true, time: true } },
};

export const findById = (id, db = prisma) => db.medicalRecord.findUnique({ where: { id }, select: RECORD_FIELDS });

// Para comprobar a qué paciente pertenece una ficha y qué PDF tenía
export const findOwnership = (id) =>
  prisma.medicalRecord.findUnique({ where: { id }, select: { id: true, patientCi: true, pdfPath: true } });

export const findLatestForPatient = (patientCi) =>
  prisma.medicalRecord.findFirst({ where: { patientCi }, orderBy: { createdAt: "desc" }, select: RECORD_FIELDS });

export const create = (data, db = prisma) => db.medicalRecord.create({ data, select: { id: true } });

export const update = (id, data, db = prisma) => db.medicalRecord.update({ where: { id }, data, select: { id: true } });
