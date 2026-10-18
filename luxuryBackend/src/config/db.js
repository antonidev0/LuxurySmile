import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI_TEST);
        console.log('Estamos Conectado a MongoDB exitosamente.');
    } catch (error) {
        console.log('Error al conectar a MongoDB', error.message);
        process.exit(1); // esto saldra del proceso ni no hay base de datos
    }
};