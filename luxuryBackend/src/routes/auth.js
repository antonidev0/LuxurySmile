import { Router } from "express";
import { changeMyPassword, updateMyProfile } from "../controllers/profileController.js";
import { me } from "../controllers/userController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { passwordChangeLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import { changePasswordBody, updateProfileBody } from "../validators/profileSchemas.js";

const router = Router();

router.use(authenticateJWT);

router.get("/me", me);
// Solo los campos que el propio usuario puede cambiar; el resto lo gestiona la administración
router.patch("/me", validate({ body: updateProfileBody }), updateMyProfile);
router.patch("/me/password", passwordChangeLimiter, validate({ body: changePasswordBody }), changeMyPassword);

export default router;
