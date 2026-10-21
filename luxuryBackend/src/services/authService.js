import bcrypt from 'bcrypt'; //encriptar las claves de los doctores o administradores.
import jwt from 'jsonwebtoken'; //Con esto generaremos y verificaremos tokens JWT.
import { prisma } from '../config/db.js'; //cliente de la base de datos (tabla Staff: administradores y odontologos).
import nodemailer from 'nodemailer'; // Con esto envaremos los emails.
import { AppError } from '../utils/AppError.js'; //usaremos esto para capturar los errores
import { 
    PAGE_URL,
    JWT_SECRET,
    EMAIL_USER,
    EMAIL_PASS, 
    VERIF_TOKEN_EXPIRES,
    SESSION_TOKEN_EXPIRES } from '../config.js';

// Los correos se guardan y buscan en minusculas y sin espacios,
// para que "Juan@Gmail.com " y "juan@gmail.com" sean la misma cuenta
export const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase();

    // registerUser(data)
    // Crea un nuevo usuario de tipo Staff (doctor/admin) tras validar y encriptar su contraseña.
    // Verifica unicidad de email.
    // Hashea la contraseña. 
export const registerUser = async (data) => {
    const {
        name,
        lastName,
        numberId,
        address,
        numberPhone,
        birthday,
        sex,
        specialty,
        password
    } = data;
    // Solo se aceptan estos dos roles; cualquier otro valor se registra como doctor
    const role = data.role === 'admin' ? 'admin' : 'doctor';
    // El admin puede activar la cuenta en el momento, sin esperar al correo de verificacion
    const verified = data.verified === true;
    const email = normalizeEmail(data.email);
    if( !name ||
        !lastName || 
        !numberPhone || 
        !email || 
        !address || 
        !numberId || 
        !birthday || 
        !sex || 
        !specialty ||
        !password){
            throw new AppError('Todos los campos son obligatorios', 400);
        }

        const emailExist = await prisma.staff.findUnique({ where: { email } });
        const numberPhoneExist = await prisma.staff.findUnique({ where: { numberPhone } });
        const numberIdExist = await prisma.staff.findUnique({ where: { numberId } });
        if(emailExist){ 
            throw new AppError('El correo ya se encuentra en uso', 409);
          } else if(numberPhoneExist) {
            throw new AppError('El numero de telefono ya se encuentra en uso', 409);
          } else if(numberIdExist) {
            throw new AppError('El numero de identidad ya se encuentra en uso', 409);
          }


        const passwordHash = await bcrypt.hash(password, 10);
          
        // crea y guarda el nuevo Staff o usuario
        const newUser = await prisma.staff.create({
            data: {
                name,
                lastName,
                numberId,
                address,
                numberPhone,
                birthday,
                sex,
                specialty,
                email,
                passwordHash,
                role,
                verified
            }
        });
        return newUser;
}

// sendVerificationEmail(user).
// crea el JWT de la verificacion.
// hace la verificacion para el frontend.
// envia email al usuario.
 
export const sendVerificationEmail = async (user) => {
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: VERIF_TOKEN_EXPIRES });
    const link = `${PAGE_URL}/verify/${user.id}/${token}`;


    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });
    await transporter.sendMail({
        from: EMAIL_USER,
        to: user.email,
        subject: 'verificacion de correo',
        html:`
        <p>Hola <strong>${user.name}</strong>,</p>
        <p>Gracias por registrarte en <em>Luxury Smail</em>.</p>
        <p>Haz clic en el enlace para verificar tu cuenta (válido por 1 hora):</p>
        <p><a href="${link}">${link}</a></p>
        <p>Si no solicitaste esta cuenta, ignora este correo.</p>
        
      `
    });
    return token;
}

// verifyUser(id, token)
// Verificara el token, comprobara que el id coincida y marcara el campoverified en la base de datos

export const verifyUser = async (id, token) => {
    try{
        const payload = jwt.verify(token, JWT_SECRET);
        if (payload.id !== id) {
            throw new AppError('Token de verificacion invalido', 401);
        }
        await prisma.staff.update({ where: { id }, data: { verified: true } });
        return { message: 'Cuenta Verificada exitosamente'}
    } catch(error){
        throw new AppError('Token invalido o expirado', 401);
    }
}

// loginUser, busca usuario por email y compara claves
// Asegura que el correo este verificado y genera un JWT de sesion de 2h

export const loginUser = async(rawEmail, password) =>{
    const email = normalizeEmail(rawEmail);
    // 1.- primero buscamos el usuario, el usuario es el correo.
    // passwordHash se omite por defecto; aqui lo pedimos para comparar la clave
    const user = await prisma.staff.findUnique({
        where: { email },
        omit: { passwordHash: false }
    });
    if(!user){
        throw new AppError('Datos invalidos', 400);
    }
    //  2.- validamos la clave.
    const valid = await bcrypt.compare(password, user.passwordHash);
    if(!valid){
        throw new AppError('Datos invalidos', 400);
    }
 
    // 3.- verificamos que el mail esta confirmado.
    if(!user.verified){
        throw new AppError('Debes verificar tu correo antes de iniciar sesion', 403);
    }

    // 4.- generamos token de sesion
    const token = jwt.sign(
        {id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: SESSION_TOKEN_EXPIRES}
    );
    
    return{ token, role: user.role, name: user.name};
};