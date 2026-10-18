import mongoose from 'mongoose';
import { MONGO_URI } from '../config.js';

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Estamos Conectado a MongoDB exitosamente.');
    } catch (error) {
        console.log('Error al conectar a MongoDB', error.message);
        process.exit(1); // esto saldra del proceso ni no hay base de datos
    }
};