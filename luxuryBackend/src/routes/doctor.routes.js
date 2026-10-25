import { Router } from "express";
import { getMyAppointments, getOccupiedTimes } from "../controllers/doctorController.js";
import { createDoctorAppointment } from "../controllers/adminAppointmentsController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { doctorOnly } from "../middlewares/staffOnly.js";

const router = Router();

// Citas asignadas al doctor con sesion iniciada
router.get("/appointments", authenticateJWT, doctorOnly, getMyAppointments);

// Nueva cita en la agenda del doctor con sesion iniciada (siempre asignada a el)
router.post("/appointments", authenticateJWT, doctorOnly, createDoctorAppointment);

// Horas ocupadas de la clinica en un dia, sin datos de pacientes, para proponer horarios libres
router.get("/occupied", authenticateJWT, doctorOnly, getOccupiedTimes);

export default router;
