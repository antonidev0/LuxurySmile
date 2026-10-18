// Exportamos una clase llamada AppError que extiende de la clase nativa Error
export class AppError extends Error {

    // El constructor recibe un mensaje y un cidigo de estado HTTP (por defecto 400)
    constructor(message, statusCode = 400){
        super(message); // Llamamos al constructor de la clase Error con el mensaje
        this.name = 'AppError'; // Le damos un nombre personalizado al error (util para identificarlo)
        this.statusCode = statusCode; // Guardamos el codigo de estado HTTP (como 400, 401, 500, etc.)

        // Capturamos el stack trace (rastro de la pila de llamadas) para este error,
        // evitando incluir el constructor en ese rastro (para depuración más clara)
        Error.captureStackTrace(this, this.constructor);
    }
}