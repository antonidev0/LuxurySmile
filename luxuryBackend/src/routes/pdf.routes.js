import express from "express";
import { generateMedicalPDF } from "../controllers/pdfController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { staffOnly } from "../middlewares/staffOnly.js";

const router = express.Router();

router.post("/generate-pdf/:appointmentId", authenticateJWT, staffOnly, generateMedicalPDF);

export default router;
