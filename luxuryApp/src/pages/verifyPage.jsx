import { useParams, useNavigate } from "react-router-dom"; // Para obtener parámetros de la URL y navegar
import { useEffect, useState } from "react";               // Para manejar efectos secundarios y estados
import axios from "axios";                                 // Para hacer peticiones HTTP

// También importamos íconos de estado desde lucide-react (opcional si estás usando esa librería)
import { Loader, CheckCircle, AlertTriangle } from "lucide-react";

// Componente de la página de verificación
const VerifyPage = () => {
  // Obtenemos el ID y el token desde la URL usando react-router-dom
  const { id, token } = useParams();

  // Estado para controlar si estamos cargando, si fue exitoso o si hubo error
  const [status, setStatus] = useState("loading");

  // Estado para mostrar un mensaje informativo al usuario
  const [message, setMessage] = useState("Verificando...");

  // Hook para redirigir al usuario
  const navigate = useNavigate();

  // useEffect se ejecuta una vez al cargar el componente (o si cambian id/token)
  useEffect(() => {
    // Función asincrónica para hacer la verificación con el backend
    const verify = async () => {
      try {
        // Hacemos una petición GET al backend con el ID y el token
        const response = await axios.get(`http://localhost:3003/api/users/verify/${id}/${token}`);
        
        // Si la verificación fue exitosa, actualizamos el estado
        setStatus("success");
        setMessage(response.data.message); // mensaje del backend: "Cuenta verificada exitosamente"
      } catch (error) {
        // Si hay un error (token inválido o expirado), actualizamos el estado
        setStatus("error");
        setMessage("El enlace de verificación es inválido o ha expirado.");
      }
    };

    // Llamamos a la función verify
    verify();
  }, [id, token]);

  // Esta función devuelve un ícono distinto según el estado actual
  const renderIcon = () => {
    if (status === "loading") return <Loader className="animate-spin w-10 h-10 text-blue-500" />;
    if (status === "success") return <CheckCircle className="w-10 h-10 text-green-500" />;
    if (status === "error") return <AlertTriangle className="w-10 h-10 text-red-500" />;
  };

  // Lo que se muestra en la página
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md text-center space-y-4 max-w-md">
        
        {/* Ícono correspondiente al estado actual */}
        {renderIcon()}

        {/* Mensaje de estado */}
        <h1 className="text-xl font-semibold">{message}</h1>

        {/* Botón que aparece si el estado ya no es "loading" */}
        {(status === "success" || status === "error") && (
          <button
            onClick={() => navigate("/")} // Redirige al home
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200"
          >
            Volver al inicio
          </button>
        )}
      </div>
    </div>
  );
};

// Exportamos el componente para que pueda usarse en el router
export default VerifyPage;
