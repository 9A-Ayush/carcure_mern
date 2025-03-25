import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuthStatus = () => {
      const isAuth = authService.checkAuth();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      }
    };
    
    checkAuthStatus();
    
    // Set up interval to periodically check token expiration
    const authCheckInterval = setInterval(() => {
      checkAuthStatus();
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(authCheckInterval);
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.login(credentials);
      
      if (data && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        return data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error in context:', err);
      setError(err.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.signup(userData);
      
      if (data && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        return data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Signup error in context:', err);
      setError(err.message || 'Signup failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      error, 
      loading,
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);