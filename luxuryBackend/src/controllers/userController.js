// Controladores
import { prisma } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { registerUser,
        sendVerificationEmail,
        loginUser,
        verifyUser,
        normalizeEmail } from "../services/authService.js";

export const register = async (request, response, next) => {
    try {
        // primero crearemos el usuario
        const newUser = await registerUser(request.body);

        // 2.- ahora enviamos la verifycacion del email
        await sendVerificationEmail(newUser);
        
        // 3 respondeos con exito al front
        // (el token de verificacion solo viaja por correo, nunca en la respuesta)
        response.status(201).json({
            message: 'Registro exitoso. revise su correo para verificar su cuenta.',
            data: {
                id: newUser.id,
                email: newUser.email
            }
        });
    } catch (error){
        next(error);
    }
} 

export const resendVerificationEmail = async (request, response, next) => {
  try {
    const email = normalizeEmail(request.body.email);
    if (!email) {
      throw new AppError("El correo es obligatorio", 400);
    }
    const user = await prisma.staff.findUnique({ where: { email } });

    if (!user) {
      console.log("Usuario no encontrado");
      throw new AppError("Usuario no encontrado", 404);
    }

    if (user.verified) {
      console.log("Usuario ya verificado");
      return response.status(200).json({ message: "Tu cuenta ya está verificada." });
    }
    console.log("Usuario no verificado, enviando correo...");
    await sendVerificationEmail(user);
    
    console.log("Correo enviado correctamente a:", user.email);
    response.status(200).json({ message: "Correo de verificación reenviado." });

  } catch (error) {
    console.error("Error en resendVerificationEmail:", error)
    next(error);
  }
};

export const verify = async (request, response, next) => {
  try{
    const { id, token } = request.params;
    const result = await verifyUser(id, token);
    response.status(200).json({ message: result.message });
  } catch (error) {
    next(error);
  }
};

export const login = async (request, response, next) => {
    try {
      const { email, password } = request.body;
      const { token, role, name } = await loginUser(email, password);
      
      response.status(200).json({
        message: 'Inicio de sesión exitoso',
        data: { token, role, name }
      });
    } catch (error) {
      next(error);
    }
  };