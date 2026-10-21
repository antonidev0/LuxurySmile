// Gestión del personal (solo administradores): editar datos, horario, rol y acceso
import { prisma } from "../config/db.js";
import { normalizeEmail } from "../services/authService.js";
import { parseAvailability } from "../utils/availability.js";

// Mismas reglas que el formulario del front
const NAME_PART = "[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñü'-]+";
const NAME_FORMAT = new RegExp(`^${NAME_PART}(\\s${NAME_PART})*$`);
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_FORMAT = /^\+?\d{7,15}$/;

// Citas que siguen abiertas (pendientes o confirmadas, incluidas las de hoy en curso)
const OPEN_STATUSES = ["pendiente", "confirmada"];

const openAppointmentsOf = (doctorId) =>
  prisma.appointment.findMany({
    where: { status: { in: OPEN_STATUSES }, assignedDoctors: { some: { id: doctorId } } },
    select: { id: true, firstName: true, lastName: true, date: true, time: true, status: true },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

const activeAdminsCount = () => prisma.staff.count({ where: { role: "admin", deactivatedAt: null } });

const findStaff = (id) => prisma.staff.findUnique({ where: { id } });

const fail = (response, status, message, extra = {}) => response.status(status).json({ message, ...extra });

// Editar nombre, apellido, correo, teléfono y (doctores) especialidad
export const updateStaff = async (request, response, next) => {
  try {
    const staff = await findStaff(request.params.id);
    if (!staff) return fail(response, 404, "Personal no encontrado");

    const name = String(request.body.name ?? "").trim();
    const lastName = String(request.body.lastName ?? "").trim();
    const email = normalizeEmail(request.body.email);
    const numberPhone = String(request.body.numberPhone ?? "").trim();
    const specialty = String(request.body.specialty ?? "").trim();

    if (!NAME_FORMAT.test(name)) return fail(response, 400, "Nombre inválido", { field: "name" });
    if (!NAME_FORMAT.test(lastName)) return fail(response, 400, "Apellido inválido", { field: "lastName" });
    if (!EMAIL_FORMAT.test(email)) return fail(response, 400, "Correo electrónico inválido", { field: "email" });
    if (!PHONE_FORMAT.test(numberPhone)) return fail(response, 400, "Teléfono inválido", { field: "numberPhone" });
    if (staff.role === "doctor" && !specialty) {
      return fail(response, 400, "La especialidad es obligatoria", { field: "specialty" });
    }

    const [emailOwner, phoneOwner] = await Promise.all([
      prisma.staff.findUnique({ where: { email } }),
      prisma.staff.findUnique({ where: { numberPhone } }),
    ]);
    if (emailOwner && emailOwner.id !== staff.id) {
      return fail(response, 409, "El correo ya se encuentra en uso", { field: "email" });
    }
    if (phoneOwner && phoneOwner.id !== staff.id) {
      return fail(response, 409, "El número de teléfono ya se encuentra en uso", { field: "numberPhone" });
    }

    const data = { name, lastName, email, numberPhone };
    // A los administradores no se les muestra especialidad; se conserva su cargo
    if (staff.role === "doctor") data.specialty = specialty;

    const updated = await prisma.staff.update({ where: { id: staff.id }, data });
    response.status(200).json({ message: "Datos actualizados", staff: updated });
  } catch (error) {
    next(error);
  }
};

// Horario semanal en el que el doctor atiende citas
export const updateAvailability = async (request, response, next) => {
  try {
    const staff = await findStaff(request.params.id);
    if (!staff || staff.role !== "doctor") return fail(response, 404, "Doctor no encontrado");

    let availability;
    try {
      availability = parseAvailability(request.body.availability);
    } catch (error) {
      return fail(response, 400, error.message);
    }

    const updated = await prisma.staff.update({ where: { id: staff.id }, data: { availability } });
    response.status(200).json({ message: "Disponibilidad actualizada", staff: updated });
  } catch (error) {
    next(error);
  }
};

// Dar de baja (desactivar). No se borra nada: sus citas, historias y datos se conservan.
// Un doctor con citas pendientes, confirmadas o en curso no se puede dar de baja hasta reasignarlas.
export const deactivateStaff = async (request, response, next) => {
  try {
    const staff = await findStaff(request.params.id);
    if (!staff) return fail(response, 404, "Personal no encontrado");
    if (staff.deactivatedAt) return fail(response, 400, "La cuenta ya está desactivada");

    if (staff.id === request.user.id) {
      return fail(response, 400, "No puedes desactivar tu propia cuenta");
    }

    if (staff.role === "admin" && (await activeAdminsCount()) <= 1) {
      return fail(response, 400, "Debe quedar al menos un administrador activo");
    }

    if (staff.role === "doctor") {
      const open = await openAppointmentsOf(staff.id);
      if (open.length) {
        return fail(response, 409, `Tiene ${open.length} ${open.length === 1 ? "cita abierta" : "citas abiertas"}. Reasígnalas antes de darlo de baja.`, {
          appointments: open,
        });
      }
    }

    const updated = await prisma.staff.update({ where: { id: staff.id }, data: { deactivatedAt: new Date() } });
    response.status(200).json({ message: "Cuenta desactivada", staff: updated });
  } catch (error) {
    next(error);
  }
};

export const reactivateStaff = async (request, response, next) => {
  try {
    const staff = await findStaff(request.params.id);
    if (!staff) return fail(response, 404, "Personal no encontrado");

    const updated = await prisma.staff.update({ where: { id: staff.id }, data: { deactivatedAt: null } });
    response.status(200).json({ message: "Cuenta reactivada", staff: updated });
  } catch (error) {
    next(error);
  }
};

// Cambiar el rol (y con él los permisos). Al pasar a doctor hace falta su especialidad.
export const changeStaffRole = async (request, response, next) => {
  try {
    const staff = await findStaff(request.params.id);
    if (!staff) return fail(response, 404, "Personal no encontrado");

    const role = request.body.role;
    if (role !== "admin" && role !== "doctor") return fail(response, 400, "Rol inválido");
    if (role === staff.role) return response.status(200).json({ message: "Sin cambios", staff });

    if (staff.id === request.user.id) {
      return fail(response, 400, "No puedes cambiar tu propio rol");
    }

    const data = { role };
    if (role === "doctor") {
      if (!staff.deactivatedAt && (await activeAdminsCount()) <= 1) {
        return fail(response, 400, "Debe quedar al menos un administrador activo");
      }
      const specialty = String(request.body.specialty ?? "").trim();
      if (!specialty) return fail(response, 400, "La especialidad es obligatoria", { field: "specialty" });
      data.specialty = specialty;
    } else {
      // Un doctor con citas abiertas las dejaría sin atender
      const open = await openAppointmentsOf(staff.id);
      if (open.length) {
        return fail(response, 409, "Tiene citas abiertas asignadas. Reasígnalas antes de cambiar su rol.", { appointments: open });
      }
      data.specialty = "Administración";
    }

    const updated = await prisma.staff.update({ where: { id: staff.id }, data });
    response.status(200).json({ message: "Rol actualizado", staff: updated });
  } catch (error) {
    next(error);
  }
};
