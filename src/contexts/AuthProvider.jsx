import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import AuthContext from './auth-context';
import authService from '../services/authService';

// Helper function for consistent logging
const logger = {
  info: (component, message, data = {}) => {
    console.log(`[Auth][${component}] ${message}`, data);
  },
  error: (component, message, error = {}) => {
    console.error(`[Auth][${component}][ERROR] ${message}`, error);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      logger.info('AuthProvider', 'Checking authentication status');
      try {
        const currentUser = await authService.getCurrentUser();
        logger.info('AuthProvider', 'Auth check completed', { hasUser: !!currentUser });
        if (currentUser) {
          logger.info('AuthProvider', 'User authenticated', { userId: currentUser.id });
          setUser(currentUser);
        } else {
          logger.info('AuthProvider', 'No authenticated user found');
        }
      } catch (error) {
        logger.error('AuthProvider', 'Auth check failed', error);
      } finally {
        logger.info('AuthProvider', 'Setting loading to false');
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (credentials) => {
    logger.info('AuthProvider', 'Login attempt', { email: credentials.email });
    try {
      const response = await authService.login(credentials);
      logger.info('AuthProvider', 'Login successful', { userId: response?.id });
      // Set the user from the response
      setUser(response);
      return response;
    } catch (error) {
      logger.error('AuthProvider', 'Login failed', error);
      throw error;
    }
  };

  const register = async (userData) => {
    logger.info('AuthProvider', 'Registration attempt', { email: userData.email });
    try {
      // Register the user
      const user = await authService.register(userData);
      logger.info('AuthProvider', 'Registration successful', { userId: user?.id });
      // Set the user directly from registration response
      setUser(user);
      return user;
    } catch (error) {
      logger.error('AuthProvider', 'Registration failed', error);
      throw error;
    }
  };

  const logout = async () => {
    logger.info('AuthProvider', 'Logout initiated');
    try {
      await authService.logout();
      logger.info('AuthProvider', 'Logout successful');
    } catch (error) {
      logger.error('AuthProvider', 'Logout error', error);
    } finally {
      logger.info('AuthProvider', 'Clearing user and redirecting to login');
      setUser(null);
      navigate('/login');
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
