import { Router } from "express";
import { getMyAppointments } from "../controllers/doctorController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { doctorOnly } from "../middlewares/staffOnly.js";

const router = Router();

// Citas asignadas al doctor con sesion iniciada
router.get("/appointments", authenticateJWT, doctorOnly, getMyAppointments);

export default router;
