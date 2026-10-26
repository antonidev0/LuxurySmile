import { prisma } from "../lib/prisma.js";

// Todo salvo el hash de la contraseña: es lo que ve la administración y el propio usuario en su perfil
const STAFF_FIELDS = {
  id: true,
  name: true,
  lastName: true,
  numberId: true,
  address: true,
  numberPhone: true,
  birthday: true,
  sex: true,
  specialty: true,
  email: true,
  role: true,
  verified: true,
  createdAt: true,
  deactivatedAt: true,
  availability: true,
};

// Lo necesario para comprobar si un doctor puede atender una cita
const SCHEDULING_FIELDS = {
  id: true,
  name: true,
  lastName: true,
  role: true,
  verified: true,
  deactivatedAt: true,
  availability: true,
};

export const findAll = () => prisma.staff.findMany({ select: STAFF_FIELDS, orderBy: { createdAt: "asc" } });

export const findById = (id) => prisma.staff.findUnique({ where: { id }, select: STAFF_FIELDS });

export const findByEmail = (email) => prisma.staff.findUnique({ where: { email }, select: STAFF_FIELDS });

// Único acceso al hash: solo lo usa el login para comparar la contraseña
export const findByEmailWithPassword = (email) =>
  prisma.staff.findUnique({ where: { email }, omit: { passwordHash: false } });

export const findSessionById = (id) =>
  prisma.staff.findUnique({ where: { id }, select: { id: true, role: true, deactivatedAt: true } });

export const findActorById = (id) =>
  prisma.staff.findUnique({ where: { id }, select: { name: true, lastName: true, role: true } });

export const findForScheduling = (ids, db = prisma) =>
  db.staff.findMany({ where: { id: { in: ids } }, select: SCHEDULING_FIELDS });

// Id del miembro del personal que ya usa ese valor único, o null si está libre
export const findOwnerOf = async (field, value) => {
  const owner = await prisma.staff.findUnique({ where: { [field]: value }, select: { id: true } });
  return owner?.id ?? null;
};

export const countActiveAdmins = () => prisma.staff.count({ where: { role: "admin", deactivatedAt: null } });

export const create = (data) => prisma.staff.create({ data, select: STAFF_FIELDS });

export const update = (id, data) => prisma.staff.update({ where: { id }, data, select: STAFF_FIELDS });
