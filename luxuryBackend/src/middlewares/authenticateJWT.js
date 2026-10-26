import { AppError } from "../lib/AppError.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { resolveSession } from "../services/authService.js";

export const authenticateJWT = asyncHandler(async (request, response, next) => {
  const header = request.headers.authorization;
  if (!header) throw new AppError("Token no proporcionado", 401);

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) throw new AppError("Token malformado", 401);

  request.user = await resolveSession(token);
  next();
});
