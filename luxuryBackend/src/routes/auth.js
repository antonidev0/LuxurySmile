// routes/auth.js
import express from "express";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import Staff from "../models/staff.js";

const router = express.Router();

router.get("/me", authenticateJWT, async (request, response) => {
  try { 
    const user = await Staff.findById(request.user.id).select("-passwordHash");
    if (!user) {
      return response.status(404).json({ message: "Usuario no encontrado" });
    }
    response.json(user);
  } catch (error) {
    response.status(500).json({ message: "Error del servidor" });
  }
});


export default router;
