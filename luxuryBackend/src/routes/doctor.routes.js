import { Router } from "express";
import { createDoctorAppointment, getMyAppointments, getOccupiedTimes } from "../controllers/doctorController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { doctorOnly } from "../middlewares/roles.js";
import { validate } from "../middlewares/validate.js";
import { createAppointmentBody, occupiedQuery } from "../validators/appointmentSchemas.js";

const router = Router();

router.use(authenticateJWT, doctorOnly);

router.get("/appointments", getMyAppointments);
// La cita queda siempre asignada al doctor de la sesión
router.post("/appointments", validate({ body: createAppointmentBody }), createDoctorAppointment);
// Horas ocupadas de toda la clínica, sin datos de pacientes, para proponer horarios libres
router.get("/occupied", validate({ query: occupiedQuery }), getOccupiedTimes);

export default router;
