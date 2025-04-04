import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Initialize session and set up refresh interval
  useEffect(() => {
    const initializeAuth = () => {
      const session = authService.initSession();
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
        console.log('Session initialized successfully');
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('No valid session found');
      }
      setLoading(false);
    };

    // Set up token refresh interval (every 55 minutes)
    const setupRefreshInterval = () => {
      const interval = setInterval(async () => {
        console.log('Attempting to refresh session');
        const refreshed = await authService.refreshSession();
        if (refreshed) {
          console.log('Session refreshed successfully');
          initializeAuth();
        } else {
          console.log('Session refresh failed');
          handleLogout();
        }
      }, 55 * 60 * 1000); // 55 minutes
      return interval;
    };

    // Handle storage events (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log('Storage changed:', e.key);
        initializeAuth();
      }
    };

    // Initial setup
    initializeAuth();
    const refreshInterval = setupRefreshInterval();

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    console.log('Logging out');
    authService.clearSession();
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        console.log('Login successful');
        setUser(result.user);
        setIsAuthenticated(true);
        setShowAuthModal(false); // Hide modal on successful login
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const result = await authService.register(name, email, password);
      
      if (result.success) {
        console.log('Registration successful');
        setUser(result.user);
        setIsAuthenticated(true);
        setShowAuthModal(false); // Hide modal on successful registration
      }
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      setLoading(true);
      setError(null);
      await authService.requestPasswordReset(email);
      return true;
    } catch (err) {
      console.error('Password reset request error:', err);
      setError(err.message || 'Failed to request password reset. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword(token, newPassword);
      return true;
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      register,
      logout: handleLogout,
      showAuthModal,
      setShowAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};