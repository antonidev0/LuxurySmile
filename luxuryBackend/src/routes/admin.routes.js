import { Router } from "express";
import {
  addAppointmentNote,
  assignDoctorToAppointment,
  createAdminAppointment,
  getAllAppointments,
  getAppointmentHistory,
  rebookAppointment,
  rescheduleAppointment,
  unassignDoctorFromAppointment,
  updateAppointment,
} from "../controllers/appointmentController.js";
import { getAppointmentPDF, uploadAppointmentPDF } from "../controllers/pdfController.js";
import {
  changeStaffRole,
  deactivateStaff,
  getAllStaff,
  reactivateStaff,
  updateAvailability,
  updateStaff,
  verifyStaffById,
} from "../controllers/staffController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { adminOnly, staffOnly } from "../middlewares/roles.js";
import { uploadPDF } from "../middlewares/upload.js";
import { validate } from "../middlewares/validate.js";
import {
  assignDoctorBody,
  createAppointmentBody,
  noteBody,
  rebookBody,
  rescheduleBody,
  unassignDoctorParams,
  updateStatusBody,
} from "../validators/appointmentSchemas.js";
import { idParams } from "../validators/common.js";
import { availabilityBody, changeRoleBody, updateStaffBody } from "../validators/staffSchemas.js";

const router = Router();

router.use(authenticateJWT);

const withId = (body) => validate(body ? { params: idParams, body } : { params: idParams });

router.get("/Allappointments", adminOnly, getAllAppointments);
router.post("/appointments", adminOnly, validate({ body: createAppointmentBody }), createAdminAppointment);
router.put("/:id/assign-doctor", adminOnly, withId(assignDoctorBody), assignDoctorToAppointment);
router.delete(
  "/:id/assign-doctor/:doctorId",
  adminOnly,
  validate({ params: unassignDoctorParams }),
  unassignDoctorFromAppointment,
);
// El doctor solo puede cerrar sus propias citas: lo comprueba el service
router.patch("/:id/updateStatus", staffOnly, withId(updateStatusBody), updateAppointment);
router.patch("/:id/reschedule", adminOnly, withId(rescheduleBody), rescheduleAppointment);
// Nueva cita a partir de una cancelada o de una a la que el paciente no asistió
router.post("/:id/rebook", adminOnly, withId(rebookBody), rebookAppointment);
router.get("/:id/history", adminOnly, withId(), getAppointmentHistory);
router.post("/:id/notes", adminOnly, withId(noteBody), addAppointmentNote);

// La sesión se valida antes de aceptar el archivo, para no guardar subidas anónimas
router.patch("/:id/upload-pdf", staffOnly, withId(), uploadPDF, uploadAppointmentPDF);
router.get("/:id/pdf", staffOnly, withId(), getAppointmentPDF);

router.get("/getDoctors", adminOnly, getAllStaff);
router.patch("/staff/:id/verify", adminOnly, withId(), verifyStaffById);
router.patch("/staff/:id", adminOnly, withId(updateStaffBody), updateStaff);
router.put("/staff/:id/availability", adminOnly, withId(availabilityBody), updateAvailability);
router.patch("/staff/:id/deactivate", adminOnly, withId(), deactivateStaff);
router.patch("/staff/:id/reactivate", adminOnly, withId(), reactivateStaff);
router.patch("/staff/:id/role", adminOnly, withId(changeRoleBody), changeStaffRole);

export default router;
