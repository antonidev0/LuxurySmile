import express from "express";
import { generateMedicalPDF } from "../controllers/pdfController.js";

const router = express.Router();

router.post("/generate-pdf/:appointmentId", generateMedicalPDF);

export default router;
