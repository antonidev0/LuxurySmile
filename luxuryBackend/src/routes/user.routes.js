import { Router } from "express";
import { login, register, resendVerificationEmail, verify } from "../controllers/userController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { emailLimiter, loginLimiter, registerLimiter, verifyLimiter } from "../middlewares/rateLimit.js";
import { adminOnly } from "../middlewares/roles.js";
import { validate } from "../middlewares/validate.js";
import { loginBody, registerBody, resendVerificationBody, verifyParams } from "../validators/authSchemas.js";

const router = Router();

// Solo un administrador con sesión iniciada puede dar de alta personal
router.post("/register", registerLimiter, authenticateJWT, adminOnly, validate({ body: registerBody }), register);
router.post("/login", loginLimiter, validate({ body: loginBody }), login);
router.get("/verify/:id/:token", verifyLimiter, validate({ params: verifyParams }), verify);
router.post("/resend-verification", emailLimiter, validate({ body: resendVerificationBody }), resendVerificationEmail);

export default router;
