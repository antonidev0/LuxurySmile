import dotenv from 'dotenv';
dotenv.config(); //con esto leeremos las variables de entornos para usarla de manera global 
                 //en el resto de los archivos y asi no esparcir llamadas directas a process.env siguiendo el patrón de "Twelve-Factor App".

const NODE_ENV = process.env.NODE_ENV || 'development'; //para detectar el entorno de ejecucion (desarrollo o produccion).

//el puerto donde arrancara el servidor n produccion, suele venir inyectado
//por la plataforma (Heroku, Railway…).
//Como estamos en desarrollo, usamos 3003 como valor por defecto.
export const PORT = process.env.PORT || 3003;

// Clave para firmar y verificar JWT
export const JWT_SECRET = process.env.JWT_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Credenciales para enviar correos
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;

export const VERIF_TOKEN_EXPIRES = '1min';
export const SESSION_TOKEN_EXPIRES = '3h';

// Base del front para cors y generar enlaces
// Client origin para cors y PAGE_URL para construir los links en emails
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
export const PAGE_URL = process.env.PAGE_URL || CLIENT_ORIGIN;

// conexion a mongo segun el entorno, si es produccion o desarrollo
export const MONGO_URI = NODE_ENV === 'production'
? process.env.MONGO_URI_PROD
: process.env.MONGO_URI_TEST;
