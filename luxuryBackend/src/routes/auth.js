// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET, JWT_SECRET } from "../config.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import Staff from "../models/staff.js";

const router = express.Router();

router.post("/refresh", (request, response) => {
  const refreshToken = request.cookies.refreshToken;

  if (!refreshToken) {
    return response.status(401).json({ message: "No se encontró el token de actualización" });
  }

  try {
    // Verificamos el refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    // Creamos un nuevo access token
    const accessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    response.json({ accessToken });
  } catch (error) {
    return response.status(403).json({ message: "Refresh token inválido o expirado" });
  }
});

router.get("/me", authenticateJWT, async (request, response) => {
  try { 
    const user = await Staff.findById(request.user.id).select("-password");
    if (!user) {
      return response.status(404).json({ message: "Usuario no encontrado" });
    }
    response.json(user);
  } catch (error) {
    response.status(500).json({ message: "Error del servidor" });
  }
});


export default router;
