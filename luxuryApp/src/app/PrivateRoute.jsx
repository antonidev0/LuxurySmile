import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingState from "../components/ui/LoadingState";
import { dashboardHome } from "../constants/navigation";
import { useAuth } from "../context/AuthContext";

// Deja pasar solo a usuarios con sesión y con uno de los roles indicados
const PrivateRoute = ({ roles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState minH="100vh" />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={dashboardHome(user.role)} replace />;

  return <Outlet />;
};

export default PrivateRoute;
