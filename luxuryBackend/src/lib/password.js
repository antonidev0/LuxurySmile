import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// Hash de una cadena aleatoria descartada. Si el correo no existe se compara contra él,
// para que el tiempo de respuesta no delate qué correos están registrados.
const DUMMY_HASH = "$2b$10$9V9EzFg6jQ/7V5hPgfOPdO4Vu13CuETx39JigaDImmoGWObl/C48S";

export const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

export const verifyPassword = (password, hash) => bcrypt.compare(password, hash ?? DUMMY_HASH);
