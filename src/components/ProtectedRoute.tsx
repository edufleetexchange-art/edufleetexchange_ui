import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { account, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while AuthContext is initializing/validating
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login, preserving intended destination
  if (!account) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  // Check required role
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(account.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
