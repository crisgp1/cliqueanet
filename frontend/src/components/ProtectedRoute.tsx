import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps): JSX.Element => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Guardar la URL actual para redirigir después del login
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      sessionStorage.setItem('redirectUrl', currentPath);
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};