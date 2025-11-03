import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Check for token
  const token = localStorage.getItem('accessToken');
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Not authenticated or no token
  if (!isAuthenticated || !token) {
    console.log('Admin access denied: Not authenticated');
    return <Navigate to="/login" state={{ from: window.location }} replace />;
  }

  // Not an admin
  if (user?.role !== 'ADMIN') {
    console.log('Access denied: User is not an admin');
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;