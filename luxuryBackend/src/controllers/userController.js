import { asyncHandler } from "../lib/asyncHandler.js";
import * as authService from "../services/authService.js";

const registerMessage = ({ verified }, emailSent) => {
  if (verified) return "Personal registrado y cuenta activada.";
  if (emailSent) return "Personal registrado. Revise su correo para verificar su cuenta.";
  return "Personal registrado, pero no se pudo enviar el correo de verificación.";
};

export const register = asyncHandler(async (request, response) => {
  const { user, emailSent } = await authService.registerStaff(request.body);
  // El token de verificación solo viaja por correo, nunca en la respuesta
  response.status(201).json({
    message: registerMessage(user, emailSent),
    data: { id: user.id, email: user.email, role: user.role, verified: user.verified, emailSent },
  });
});

export const resendVerificationEmail = asyncHandler(async (request, response) => {
  await authService.resendVerification(request.body.email);
  response.status(200).json({
    message: "Si la cuenta existe y está pendiente de verificar, se ha enviado un nuevo correo de verificación.",
  });
});

export const verify = asyncHandler(async (request, response) => {
  await authService.verifyEmail(request.params.id, request.params.token);
  response.status(200).json({ message: "Cuenta Verificada exitosamente" });
});

export const login = asyncHandler(async (request, response) => {
  const { token, role, name } = await authService.login(request.body.email, request.body.password);
  response.status(200).json({ message: "Inicio de sesión exitoso", data: { token, role, name } });
});

export const me = asyncHandler(async (request, response) => {
  response.status(200).json(await authService.getCurrentUser(request.user.id));
});
