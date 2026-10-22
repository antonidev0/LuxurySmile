import { Router } from "express";
import { getAllStaff,
         assignDoctorToAppointment,
         unassignDoctorFromAppointment,
         getAllAppointments,
         updateAppointment,
         verifyStaffById,
         uploadAppointmentPDF,
         getAppointmentPDF,
         rescheduleAppointment,
         rebookAppointment,
         getAppointmentHistory,
         addAppointmentNote } from "../controllers/adminAppointmentsController.js";
import { updateStaff,
         updateAvailability,
         deactivateStaff,
         reactivateStaff,
         changeStaffRole } from "../controllers/staffController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { adminOnly, staffOnly } from "../middlewares/staffOnly.js"; 
import { uploadPDF } from "../middlewares/upload.js";

const router = Router();

// Ruta para obtener todas las citas del admin
router.get('/Allappointments', authenticateJWT, adminOnly, getAllAppointments);

// Ruta para obtener todos los doctores
router.get('/getDoctors', authenticateJWT, adminOnly ,getAllStaff);

// Ruta para asignar un doctor a una cita
router.put('/:id/assign-doctor', authenticateJWT, adminOnly, assignDoctorToAppointment );

// Ruta para quitar un doctor de una cita
router.delete('/:id/assign-doctor/:doctorId', authenticateJWT, adminOnly, unassignDoctorFromAppointment);

// ruta para actualizar el estado de una cita (el doctor solo puede cerrar las suyas)
router.patch('/:id/updateStatus', authenticateJWT, staffOnly, updateAppointment);

// Reprogramar fecha, hora o doctores de una cita pendiente o confirmada
router.patch('/:id/reschedule', authenticateJWT, adminOnly, rescheduleAppointment);

// Nueva cita a partir de una cancelada o de una a la que el paciente no asistió
router.post('/:id/rebook', authenticateJWT, adminOnly, rebookAppointment);

// Historial de cambios y notas administrativas de la cita
router.get('/:id/history', authenticateJWT, adminOnly, getAppointmentHistory);
router.post('/:id/notes', authenticateJWT, adminOnly, addAppointmentNote);

// Activar a mano la cuenta de un miembro del personal
router.patch('/staff/:id/verify', authenticateJWT, adminOnly, verifyStaffById);

// Gestion del personal (solo admin). El personal no se borra: se da de baja
// para conservar su historial, sus citas y las historias clinicas que hizo
router.patch('/staff/:id', authenticateJWT, adminOnly, updateStaff);
router.put('/staff/:id/availability', authenticateJWT, adminOnly, updateAvailability);
router.patch('/staff/:id/deactivate', authenticateJWT, adminOnly, deactivateStaff);
router.patch('/staff/:id/reactivate', authenticateJWT, adminOnly, reactivateStaff);
router.patch('/staff/:id/role', authenticateJWT, adminOnly, changeStaffRole);

// Primero se valida la sesion y luego se acepta el archivo, para no guardar subidas anonimas
router.patch('/:id/upload-pdf', authenticateJWT, staffOnly, uploadPDF.single("pdf"), uploadAppointmentPDF);

// Descargar el historial PDF de una cita (los PDF ya no son publicos)
router.get('/:id/pdf', authenticateJWT, staffOnly, getAppointmentPDF);

export default router; 