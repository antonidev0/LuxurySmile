import { Router } from "express";
import { getMyAppointments } from "../controllers/doctorController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { doctorOnly } from "../middlewares/roles.js";

const router = Router();

router.use(authenticateJWT, doctorOnly);

// Solo sus citas asignadas. El doctor no crea, cancela ni reprograma citas, ni cambia su horario:
// eso lo gestiona la administración
router.get("/appointments", getMyAppointments);

export default router;
