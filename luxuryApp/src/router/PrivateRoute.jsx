import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Center } from '@chakra-ui/react';

const PrivateRoute = ({ redirectTo = '/login', roles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
