import { Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const ProtectedRoute = ({ children }) => {
  // Check if user is logged in using the enhanced authService
  const isAuthenticated = authService.checkAuth();
  const user = localStorage.getItem('user');

  if (!isAuthenticated || !user) {
    // If not authenticated, redirect to home and open auth modal
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
