import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Store the attempted URL for redirect after login
    return <Navigate to="/login" state={{ from: window.location }} replace />;
  }

  // Check for admin access if required
  if (requireAdmin && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // Verify token exists
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.error('No access token found in localStorage');
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;