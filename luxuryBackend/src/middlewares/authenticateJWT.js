// Para proteger las rutas y asegurar que solo usuarios autenticados accedan
//  a ciertas funcionalidades, implementamos un middleware que verifique
//   la validez del token JWT en cada solicitud.

import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import { AppError } from '../utils/AppError.js';

export const authenticateJWT = (request, response, next) => {
    const authHeader = request.headers.authorization;
    if (!authHeader){
        return next(new AppError('Token no proporcionado', 401));
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token){
        return next(new AppError('Token malformado', 401));
    }

    try {
        // verificamos y decodificamos el jwt
        const decoded = jwt.verify(token, JWT_SECRET);
        // adjuntamos la carga util al request
        request.user = decoded;
        next();
    } catch(error){
        // capturamos los errores del JWT expirado o invalido
        if (error.name === 'TokenExpiredError'){
            return next(new AppError('Token expirado', 401));
        }
        return next(new AppError('Token invalido', 401));
    }
};