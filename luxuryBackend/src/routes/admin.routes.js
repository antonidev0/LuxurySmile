import { Router } from "express";
import { getAllStaff,
         assignDoctorToAppointment,
         getAllAppointments,
         updateAppointment,
         deleteDoctorById,
         uploadAppointmentPDF } from "../controllers/adminAppointmentsController.js";
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

// ruta para actualizar el estado de una cita
router.patch('/:id/updateStatus', authenticateJWT, staffOnly, updateAppointment);

// Ruta para eliminar un doctor por ID
// Esta ruta es para que el admin pueda eliminar un doctor o administrador
router.delete('/deleteDoctor/:id', authenticateJWT, adminOnly, deleteDoctorById);

router.patch('/:id/upload-pdf', uploadPDF.single("pdf"), authenticateJWT, staffOnly, uploadAppointmentPDF);

export default router; 