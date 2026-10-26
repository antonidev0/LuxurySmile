import express from "express";
import { getRecordForm, saveRecord } from "../controllers/pdfController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { staffOnly } from "../middlewares/staffOnly.js";

const router = express.Router();

// Ficha clínica de una cita (formato oficial de la clínica): datos para el formulario y guardado con su PDF
router.get("/appointments/:appointmentId/ficha", authenticateJWT, staffOnly, getRecordForm);
router.post("/appointments/:appointmentId/ficha", authenticateJWT, staffOnly, saveRecord);

export default router;
