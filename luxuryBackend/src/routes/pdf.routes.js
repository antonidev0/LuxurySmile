import { Router } from "express";
import { getPatientRecords, getRecordForm, getRecordPDF, saveRecord } from "../controllers/pdfController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { staffOnly } from "../middlewares/roles.js";
import { validate } from "../middlewares/validate.js";
import { recordIdParams, recordParams, saveRecordBody } from "../validators/recordSchemas.js";

const router = Router();

router.use(authenticateJWT, staffOnly);

// Ficha clínica de una cita (formato oficial de la clínica): datos para el formulario y guardado con su PDF
router.get("/appointments/:appointmentId/ficha", validate({ params: recordParams }), getRecordForm);
router.post("/appointments/:appointmentId/ficha", validate({ params: recordParams, body: saveRecordBody }), saveRecord);
// Historia clínica completa del paciente de la cita (la cédula no viaja en la URL)
router.get("/appointments/:appointmentId/records", validate({ params: recordParams }), getPatientRecords);
router.get("/records/:recordId/pdf", validate({ params: recordIdParams }), getRecordPDF);

export default router;
