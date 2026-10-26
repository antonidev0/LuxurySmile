import { Router } from "express";
import { getRecordForm, saveRecord } from "../controllers/pdfController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { staffOnly } from "../middlewares/roles.js";
import { validate } from "../middlewares/validate.js";
import { recordParams, saveRecordBody } from "../validators/recordSchemas.js";

const router = Router();

router.use(authenticateJWT, staffOnly);

// Ficha clínica de una cita (formato oficial de la clínica): datos para el formulario y guardado con su PDF
router.get("/appointments/:appointmentId/ficha", validate({ params: recordParams }), getRecordForm);
router.post("/appointments/:appointmentId/ficha", validate({ params: recordParams, body: saveRecordBody }), saveRecord);

export default router;
