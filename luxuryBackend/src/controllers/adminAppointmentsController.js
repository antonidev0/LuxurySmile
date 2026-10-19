import fs from "fs";
import path from "path";
import { prisma } from "../config/db.js";

// Datos de los doctores que se devuelven junto a cada cita
const DOCTOR_FIELDS = { id: true, name: true, lastName: true, email: true, specialty: true, numberId: true };
const WITH_DOCTORS = { assignedDoctors: { select: DOCTOR_FIELDS } };

const VALID_STATUSES = ["pendiente", "confirmada", "cancelada", "completada"];

// Comprueba si un usuario esta entre los doctores asignados
const isAssigned = (appointment, userId) =>
  appointment.assignedDoctors.some((doc) => doc.id === userId);

// Ruta para obtener todas las citas del admin
export const getAllAppointments = async (request, response) => {
  try {
    // Buscar todas las citas (con datos de los doctores asignados)
    const appointments = await prisma.appointment.findMany({
      include: WITH_DOCTORS,
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    response.status(200).json(appointments);

  } catch (error) {
    console.error("Error al obtener citas (Admin):", error);
    response.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener todo el personal médico
// Esta ruta es para que el admin pueda ver todos los doctores y administradores 
export const getAllStaff = async (request, response) => {
  try {
    const staff = await prisma.staff.findMany({ orderBy: { createdAt: "asc" } });
    response.json(staff);
  } catch (error) {
    response.status(500).json({ message: "Error al obtener el personal médico" });
  }
};

// asignar un doctor a cada paciente o cita
export const assignDoctorToAppointment = async (request, response) => {
  try {
    const appointmentId = request.params.id;
    const { doctorId } = request.body; 

    if (!doctorId) {
      return response.status(400).json({ message: "DoctorId es requerido" });
    }

    const doctor = await prisma.staff.findUnique({ where: { id: doctorId } });
    if (!doctor || doctor.role !== "doctor") {
      return response.status(400).json({ message: "ID de doctor inválido" });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: WITH_DOCTORS,
    });

    if (!appointment) {
      return response.status(404).json({ message: "Cita no encontrada" });
    }

    // Verificar si el doctor ya está asignado
    if (isAssigned(appointment, doctorId)) {
      return response.status(400).json({ message: "El doctor ya está asignado a esta cita" });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { assignedDoctors: { connect: { id: doctorId } } },
      include: WITH_DOCTORS,
    });

    return response.status(200).json({
      message: "Doctor asignado exitosamente",
      appointment: updated,
    });
  } catch (error) {
    console.error("Error asignando doctor:", error);
    return response.status(500).json({ message: "Error interno del servidor" });
  }
};


// Quitar un doctor de una cita (las completadas ya no se modifican)
export const unassignDoctorFromAppointment = async (request, response) => {
  try {
    const { id, doctorId } = request.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: WITH_DOCTORS,
    });

    if (!appointment) {
      return response.status(404).json({ message: "Cita no encontrada" });
    }

    if (appointment.status === "completada") {
      return response.status(400).json({ message: "No se puede modificar una cita completada" });
    }

    if (!isAssigned(appointment, doctorId)) {
      return response.status(400).json({ message: "El doctor no está asignado a esta cita" });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { assignedDoctors: { disconnect: { id: doctorId } } },
      include: WITH_DOCTORS,
    });

    return response.status(200).json({ message: "Doctor retirado de la cita", appointment: updated });
  } catch (error) {
    console.error("Error retirando doctor:", error);
    return response.status(500).json({ message: "Error interno del servidor" });
  }
};
  
// Actualizar estado de una cita (Admin y doctores); 
// Al completar una cita, tambien se guardan los datos de los doctores que la completaron
export const updateAppointment = async (request, response) => {
  const { id } = request.params;
  // Solo se permite cambiar el estado; el resto de campos no se toca desde aqui
  const { status } = request.body;

  if (!status) {
    return response.status(400).json({ message: "El estado es obligatorio" });
  }

  if (!VALID_STATUSES.includes(status)) {
    return response.status(400).json({ message: "Estado de cita inválido" });
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: WITH_DOCTORS,
    });

    if (!appointment) {
      return response.status(404).json({ message: "Cita no encontrada" });
    }

    // Un doctor solo puede modificar las citas que tiene asignadas
    if (request.user.role === "doctor" && !isAssigned(appointment, request.user.id)) {
      return response.status(403).json({ message: "No tienes asignada esta cita" });
    }

    // Si ya está completada, no permitir modificarla
    if (appointment.status === "completada" && status !== "completada") {
      return response
        .status(400)
        .json({ message: "No se puede modificar el estado de una cita completada" });
    }

    const data = { status };

    // Si se está completando ahora, guarda info de todos los doctores asignados
    if (status === "completada" && appointment.assignedDoctors.length > 0) {
      data.completedBy = appointment.assignedDoctors.map((doc) => ({
        name: `${doc.name} ${doc.lastName}`,
        ci: `V${doc.numberId}`,
        email: doc.email,
        specialty: doc.specialty,
      }));
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data,
      include: WITH_DOCTORS,
    });

    response.status(200).json(updatedAppointment);
  } catch (error) {
    console.error("Error al actualizar la cita:", error);
    response.status(500).json({ message: "Error al actualizar la cita" });
  }
};


// Eliminar un doctor (Admin)
// Se quita de todas sus citas; las completadas conservan sus datos en "completedBy"
export const deleteDoctorById = async (request, response) => {
  const { id } = request.params;

  try {
    const doctor = await prisma.staff.findUnique({ where: { id } });

    if (!doctor || doctor.role !== 'doctor') {
      return response.status(404).json({ message: 'Doctor no encontrado' });
    }

    await prisma.staff.delete({ where: { id } });

    response.status(200).json({ message: 'Doctor eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar doctor:', error);
    response.status(500).json({ message: 'Error al eliminar doctor' });
  }
};

export const uploadAppointmentPDF = async (request, response) => {
  try {
    const { id } = request.params;

    if (!request.file) {
      return response.status(400).json({ message: "Debes adjuntar un archivo PDF" });
    }

    const filePath = `/uploads/pdf/${request.file.filename}`;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: WITH_DOCTORS,
    });

    if (!appointment) {
      fs.unlink(request.file.path, () => {});
      return response.status(404).json({ message: "Cita no encontrada" });
    }

    if (request.user.role === "doctor" && !isAssigned(appointment, request.user.id)) {
      fs.unlink(request.file.path, () => {});
      return response.status(403).json({ message: "No tienes asignada esta cita" });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { historialPDF: filePath },
    });

    return response.status(200).json({
      message: "PDF subido exitosamente",
      historialPDF: updated.historialPDF,
    });
  } catch (error) {
    console.error("Error al subir el PDF:", error);
    response.status(500).json({ message: "Error del servidor" });
  }
};

// Descargar el historial PDF de una cita (solo personal con sesion iniciada)
export const getAppointmentPDF = async (request, response) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: request.params.id },
      include: WITH_DOCTORS,
    });

    if (!appointment || !appointment.historialPDF) {
      return response.status(404).json({ message: "Historial no encontrado" });
    }

    if (request.user.role === "doctor" && !isAssigned(appointment, request.user.id)) {
      return response.status(403).json({ message: "No tienes asignada esta cita" });
    }

    // historialPDF se guarda como "/uploads/pdf/<archivo>.pdf"; usamos solo el nombre del archivo
    const fileName = path.basename(appointment.historialPDF);
    const filePath = path.resolve("uploads", "pdf", fileName);

    if (!fs.existsSync(filePath)) {
      return response.status(404).json({ message: "Archivo no encontrado" });
    }

    response.sendFile(filePath);
  } catch (error) {
    console.error("Error al obtener el PDF:", error);
    response.status(500).json({ message: "Error del servidor" });
  }
};
