import { Router } from "express";
import {
  createAppointment,
  getOccupiedAppointments,   
} from "../controllers/appointmentController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";

const router = Router();

// Crear una nueva cita
router.post("/", createAppointment);
 
router.get("/occupied", getOccupiedAppointments);

export default router;
