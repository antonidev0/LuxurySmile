import { Router } from "express";
import { me } from "../controllers/userController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";

const router = Router();

router.get("/me", authenticateJWT, me);

export default router;
