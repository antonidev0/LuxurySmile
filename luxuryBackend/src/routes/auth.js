// routes/auth.js
import express from "express";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { prisma } from "../config/db.js";

const router = express.Router();

router.get("/me", authenticateJWT, async (request, response) => {
  try { 
    const user = await prisma.staff.findUnique({ where: { id: request.user.id } });
    if (!user) {
      return response.status(404).json({ message: "Usuario no encontrado" });
    }
    response.json(user);
  } catch (error) {
    response.status(500).json({ message: "Error del servidor" });
  }
});


export default router;
