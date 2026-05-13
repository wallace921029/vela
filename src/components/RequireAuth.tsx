import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

const RequireAuth = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
