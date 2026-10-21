// Para proteger las rutas y asegurar que solo usuarios autenticados accedan
//  a ciertas funcionalidades, implementamos un middleware que verifique
//   la validez del token JWT en cada solicitud.

import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import { AppError } from '../utils/AppError.js';
import { prisma } from '../config/db.js';

export const authenticateJWT = async (request, response, next) => {
    const authHeader = request.headers.authorization;
    if (!authHeader){
        return next(new AppError('Token no proporcionado', 401));
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token){
        return next(new AppError('Token malformado', 401));
    }

    let decoded;
    try {
        // verificamos y decodificamos el jwt
        decoded = jwt.verify(token, JWT_SECRET);
    } catch(error){
        // capturamos los errores del JWT expirado o invalido
        if (error.name === 'TokenExpiredError'){
            return next(new AppError('Token expirado', 401));
        }
        return next(new AppError('Token invalido', 401));
    }

    // El rol y el estado se leen de la base de datos y no del token, para que un cambio
    // de rol o una baja se apliquen al momento y no cuando caduque la sesion
    let user;
    try {
        user = await prisma.staff.findUnique({
            where: { id: decoded.id },
            select: { id: true, role: true, deactivatedAt: true },
        });
    } catch (error) {
        return next(error);
    }
    if (!user || user.deactivatedAt) {
        return next(new AppError('Tu cuenta no está activa', 401));
    }
    // adjuntamos la carga util al request
    request.user = { id: user.id, role: user.role };
    next();
};
