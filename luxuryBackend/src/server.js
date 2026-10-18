import app from './app.js'; // Importamos la configuracion principal de la aplicacion Express (rutas, middlewares, etc.).
import { connectDB } from './config/db.js'; // Importamos la función que conecta con MongoDB.
import dotenv from 'dotenv'; // Importamos dotenv para poder leer las variables de entorno desde el archivo .env .
dotenv.config(); // Ejecutamos dotenv para que las variables de entorno estén disponibles.

// Definimos el puerto donde se ejecutara el servidor, tomando primero el valor del .env si existe
const PORT = process.env.PORT || 3003;

// Creo una funcion asincrona para iniciar el servidor;
const startServer = async () =>{
    console.log('Iniciando primer proceso, por favor espere.');
    // Nos conectamos a la base de datos;
    await connectDB();
    console.log('Primer proceso terminado, iniciando servidor.');

    // Iniciamos el servidor y escuchamos en el puerto definido
    app.listen(PORT, () =>{
        console.log(`El servidor se a iniciado en el puerto ${PORT} exitosamente, puede continuar.`);   
    });
};

// Ejecutamos la funcion para poner todo en marcha
startServer();
