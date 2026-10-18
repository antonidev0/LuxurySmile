import Staff from '../models/staff.js';
import Appointment from '../models/appointment.js';
import mongoose from 'mongoose';
import { startOfDay, endOfDay } from "date-fns";  

// Ruta para obtener todas las citas del admin
export const getAllAppointments = async (request, response) => {
  try {
    // 1. Verificar si el usuario es admin
    if (request.user.role !== 'admin') {
      return response.status(403).json({ message: "Acceso denegado: Se requiere rol de administrador" });
    }

    // 2. Buscar todas las citas (con datos del doctor asignado si existe)
    const appointments = await Appointment.find()
      .populate('assignedDoctors', 'name lastName email -_id') // -_id excluye el ID
      .sort({ date: 1, time: 1 });

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
    const staff = await Staff.find();
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

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return response.status(400).json({ error: "ID de doctor inválido" });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return response.status(404).json({ message: "Cita no encontrada" });
    }

    // Si no existe el array, lo inicializa
    if (!appointment.assignedDoctors) {
      appointment.assignedDoctors = [];
    }

    // Verificar si el doctor ya está asignado
    const alreadyAssigned = appointment.assignedDoctors.some(
      (docId) => docId.toString() === doctorId
    );

    if (alreadyAssigned) {
      return response.status(400).json({ message: "El doctor ya está asignado a esta cita" });
    }

    appointment.assignedDoctors.push(doctorId);
    await appointment.save();

    return response.status(200).json({
      message: "Doctor asignado exitosamente",
      appointment,
    });
  } catch (error) {
    console.error("Error asignando doctor:", error);
    console.error("Error asignando doctor:", error.message);
    console.error(error.stack);

    return response.status(500).json({ message: "Error interno del servidor" });
  }
};

  
// Actualizar estado de una cita (Admin y doctores); 
// Al actualizar el estado de una cita, tambien se guarda el nombre del doctor que la completó 
// Actualizar estado de una cita (Admin y doctores) 
export const updateAppointment = async (request, response) => {
  const { id } = request.params;
  const updates = request.body;

  const validStatuses = ["pendiente", "confirmada", "cancelada", "completada"];
  if (updates.status && !validStatuses.includes(updates.status)) {
    return response.status(400).json({ message: "Estado de cita inválido" });
  }

  try {
    const appointment = await Appointment.findById(id).populate("assignedDoctors");

    if (!appointment) {
      return response.status(404).json({ message: "Cita no encontrada" });
    }

    // Si ya está completada, no permitir modificarla
    if (
      appointment.status === "completada" &&
      updates.status &&
      updates.status !== "completada"
    ) {
      return response
        .status(400)
        .json({ message: "No se puede modificar el estado de una cita completada" });
    }

    // Si se está completando ahora, guarda info de todos los doctores asignados
    if (
      updates.status === "completada" &&
      Array.isArray(appointment.assignedDoctors) &&
      appointment.assignedDoctors.length > 0
    ) {
      appointment.completedBy = appointment.assignedDoctors.map((doc) => ({
        name: `${doc.name} ${doc.lastName}`,
        ci: `V${doc.numberId}`,
        email: doc.email,
        specialty: doc.specialty,
      }));
    }

    Object.assign(appointment, updates);
    const updatedAppointment = await appointment.save();

    response.status(200).json(updatedAppointment);
  } catch (error) {
    console.error("Error al actualizar la cita:", error);
    response.status(500).json({ message: "Error al actualizar la cita", error });
  }
};


// Eliminar un doctor (Admin)
export const deleteDoctorById = async (request, response) => {
  const { id } = request.params;

  try {
    const doctor = await Staff.findById(id);

    if (!doctor || doctor.role !== 'doctor') {
      return response.status(404).json({ message: 'Doctor no encontrado' });
    }

    // Eliminar referencias de citas no completadas
    await Appointment.updateMany(
      { assignedDoctors: id,
        status: { $in: ['pendiente', 'confirmada', 'cancelada' ] },
      },
        {
    $pull: { assignedDoctors: id }
  }
    );

    // IMPORTANTE: las citas completadas conservarán el ID del doctor eliminado
    // para que puedas luego poblar su nombre en frontend si lo deseas

    // Eliminar el doctor
    await Staff.findByIdAndDelete(id);

    response.status(200).json({ message: 'Doctor eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar doctor:', error);
    response.status(500).json({ message: 'Error al eliminar doctor' });
  }
};

export const uploadAppointmentPDF = async (request, response) => {
  try {
    const { id } = request.params;
    const filePath = `/uploads/pdf/${request.file.filename}`;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        historialPDF: filePath,
      },
      { new: true }
    );

    if (!appointment) {
      return response.status(404).json({ message: "Cita no encontrada" });
    }

    return response.status(200).json({
      message: "PDF subido exitosamente",
      historialPDF: appointment.historialPDF,
    });
  } catch (error) {
    console.error("Error al subir el PDF:", error);
    response.status(500).json({ message: "Error del servidor" });
  }
};