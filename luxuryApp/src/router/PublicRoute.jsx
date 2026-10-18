import React from 'react';
import { Outlet } from 'react-router-dom';
import { Spinner, Center } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

/**
 * PublicRoute protege rutas públicas de usuarios autenticados:
 * - Si loading está activo, muestra spinner.
 * - Si el usuario está autenticado, redirige a la ruta privada (default: /dashboard).
 * - Si no, renderiza las rutas hijas (Outlet).
 */
const PublicRoute = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // Aquí no haces ninguna redirección, permites siempre el acceso
  // (aunque el usuario esté autenticado)
  return <Outlet />;
};

export default PublicRoute;