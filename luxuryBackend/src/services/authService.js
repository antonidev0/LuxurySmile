import bcrypt from 'bcrypt'; //encriptar las claves de los doctores o administradores.
import jwt from 'jsonwebtoken'; //Con esto generaremos y verificaremos tokens JWT.
import Staff from '../models/staff.js'; //importamos nuestro modelo de staff (Personal), aministradores y odontologos.
import nodemailer from 'nodemailer'; // Con esto envaremos los emails.
import { AppError } from '../utils/AppError.js'; //usaremos esto para capturar los errores
import { 
    PAGE_URL,
    JWT_SECRET,
    EMAIL_USER,
    EMAIL_PASS, 
    VERIF_TOKEN_EXPIRES,
    SESSION_TOKEN_EXPIRES } from '../config.js';

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
        email,
        password
    } = data;
    if( !name ||
        !lastName || 
        !numberPhone || 
        !email || 
        !address || 
        !numberId || 
        !birthday || 
        !sex || 
        !password){
            throw new AppError('Todos los campos son obligatorios', 400);
        }

        const emailExist = await Staff.findOne({ email }); 
        const numberPhoneExist = await Staff.findOne({ numberPhone });
        const numberIdExist = await Staff.findOne({ numberId });  
        if(emailExist){ 
            throw new AppError('El correo ya se encuentra en uso', 401);
          } else if(numberPhoneExist) {
            throw new AppError('El numero de telefono ya se encuentra en uso', 401);
          } else if(numberIdExist) {
            throw new AppError('El numero de identidad ya se encuentra en uso', 401);
          }


        const passwordHash = await bcrypt.hash(password, 10);
          
        // crea el nuevo Staff o usuario
        const newUser = new Staff({
            name,
            lastName,
            numberId,
            address,
            numberPhone,
            birthday,
            sex,
            specialty,
            email,
            passwordHash
          });

        //   guardamos en Mongo
          await newUser.save();
          return newUser;
}

// sendVerificationEmail(user).
// crea el JWT de la verificacion.
// hace la verificacion para el frontend.
// envia email al usuario.
 
export const sendVerificationEmail = async (user) => {
    console.log(user);
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: VERIF_TOKEN_EXPIRES });
    const link = `${PAGE_URL}/verify/${user.id}/${token}`;


    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        },
        tls: { rejectUnauthorized: false }
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
// Verificara el token, comprobara que el id coincida y marcara el campoverified en la base de Mongo

export const verifyUser = async (id, token) => {
    try{
        const payload = jwt.verify(token, JWT_SECRET);
        if (payload.id !== id) {
            throw new AppError('Token de verificacion invalido', 401);
        }
        const updated = await Staff.findByIdAndUpdate(id, { verified: true }, { new: true });
        return { message: 'Cuenta Verificada exitosamente'}
    } catch(error){
        throw new AppError('Token invalido o expirado', 401);
    }
}

// loginUser, busca usuario por email y compara claves
// Asegura que el correo este verificado y genera un JWT de sesion de 2h

export const loginUser = async(email, password) =>{
    // 1.- primero buscamos el usuario, el usuario es el correo.
    const user = await Staff.findOne({ email });
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