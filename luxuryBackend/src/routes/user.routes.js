import { Router } from "express"; // Importamos el Router de Express para crear nuestras rutas.
import { register, resendVerificationEmail, login, verify } from "../controllers/userController.js"; // Importamos los controladores que manejan la lógica de cada ruta.
import { authenticateJWT } from "../middlewares/authenticateJWT.js";// Importamos el middleware que protege rutas usando JWT (aunque aun no se usa).

// Creamos una instancia de router para definir nuestras rutas.
const router = Router();

// Ruta para registrar a un nuevo usuario (POST /api/users/register)
// Se ejecuta la función "register" del controlador.
router.post('/register', register);

// Ruta para logear a un usuario.
router.post('/login', login);

// Ruta para verificar el email del usuario
router.get('/verify/:id/:token', verify);

// Ruta para verificar el email del usuario si su token vencio
router.post('/resend-verification', resendVerificationEmail);

// Exportamos el router para usarlo en app.js u otros archivos
export default router;