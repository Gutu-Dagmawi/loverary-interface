import api, { fetchCSRFToken } from './api';
import { getUserInfo, setUserInfo, clearUserInfo } from '../utils/tokenUtils';

// Helper function for consistent logging
const logger = {
  info: (component, message, data = {}) => {
    console.log(`[AuthService][${component}] ${message}`, data);
  },
  error: (component, message, error = {}) => {
    console.error(`[AuthService][${component}][ERROR] ${message}`, error);
  }
};

const REDIRECT_AFTER_LOGIN_KEY = 'redirect_after_login';

const authService = {
  // Register a new user
  async register(userData) {
    try {
      // Ensure we have a fresh CSRF token
      await fetchCSRFToken();
      
      // Validate required fields
      if (!userData.username || !userData.email || !userData.password) {
        throw new Error('Username, email, and password are required');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Validate password length
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Make the registration request
      const response = await api.post('/users', {
        user: {
          username: userData.username,
          email: userData.email,
          password: userData.password
        }
      });

      if (response.status === 201) {
        // Don't log in automatically, just return success
        logger.info('register', 'Registration successful', { 
          email: userData.email,
          username: userData.username 
        });
        
        // Return success without setting user info
        return { 
          success: true,
          email: userData.email,
          username: userData.username
        };
      }
      
      // Handle unexpected response status
      throw new Error('Registration failed. Please try again.');
      
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Handle 422 validation errors
      if (error.response && error.response.status === 422) {
        const errorMessages = error.response.data.errors || [];
        throw new Error(errorMessages.join(', ') || 'Validation failed. Please check your input.');
      }
      
      // Handle 400 bad request
      if (error.response && error.response.status === 400) {
        throw new Error(error.response.data.error || 'Invalid request. Please check your input.');
      }
      
      // Handle network errors or other issues
      throw new Error(error.message || 'Registration failed. Please try again later.');
    }
  },

  // Login user
  async login(credentials) {
    logger.info('login', 'Starting login process', { email: credentials.email });
    try {
      // Ensure we have a fresh CSRF token before login
      logger.info('login', 'Fetching CSRF token');
      await fetchCSRFToken();
      
      logger.info('login', 'Sending login request');
      const response = await api.post('/users/login', {
        user: {
          email: credentials.email,
          password: credentials.password
        }
      });

      // The API response should have user data in the expected format
      if (!response.data || !response.data.user) {
        const error = new Error('Invalid response format from server');
        logger.error('login', 'Invalid response format', { response });
        throw error;
      }
      
      const userData = response.data.user;
      logger.info('login', 'Login successful', { 
        userId: userData.id, 
        email: userData.email 
      });

      // Store user info using the token utility
      logger.info('login', 'Storing user info in token utility');
      setUserInfo(userData);
      
      // Clear the redirect path from session storage
      const redirectTo = sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY) || '/';
      if (sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY)) {
        logger.info('login', 'Clearing redirect path from session storage', { redirectTo });
        sessionStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
      }
      
      // Return the user data with redirect path
      const result = {
        ...userData,
        redirectTo
      };
      
      logger.info('login', 'Returning user data with redirect', { redirectTo });
      return result;
    } catch (error) {
      logger.error('login', 'Login failed', { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      // Try to get a fresh CSRF token before logout
      try {
        await fetchCSRFToken();
        // Use DELETE method as per documentation
        await api.delete('/users/logout');
      } catch (error) {
        console.error('Logout API call failed, continuing with local cleanup', error);
      }
    } finally {
      // Clear user data from localStorage
      // Clear user info using the token utility
      clearUserInfo();
    }
  },

  // Get current user from localStorage and validate with server
  async getCurrentUser(forceCheck = false) {
    logger.info('getCurrentUser', 'Checking current user', { forceCheck });
    
    // First check if we have user info in localStorage
    const userInfo = getUserInfo();
    logger.info('getCurrentUser', 'Retrieved user info from storage', { 
      hasUserInfo: !!userInfo,
      userId: userInfo?.id 
    });
    
    // If no user info in storage, no need to check with server
    if (!userInfo || !userInfo.id) {
      logger.info('getCurrentUser', 'No user info found in storage');
      return null;
    }
    
    // Only check with server if forced or if we have a token
    if (forceCheck || userInfo.token) {
      try {
        logger.info('getCurrentUser', 'Fetching current user from server');
        const response = await api.get('/users/current');
        
        if (response.data?.user) {
          logger.info('getCurrentUser', 'Received user data from server', { 
            userId: response.data.user.id 
          });
          // Update local storage with fresh data
          setUserInfo(response.data.user);
          return response.data.user;
        }
        
        logger.info('getCurrentUser', 'No user data in response');
      } catch (error) {
        // Only log non-401 errors
        if (error.response?.status !== 401) {
          console.error('Error getting current user:', error);
        } else {
          logger.info('getCurrentUser', 'Session expired or invalid');
        }
        // Clear invalid user data
        clearUserInfo();
      }
    }
    
    // Return the stored user info if we have it, even if we didn't validate with server
    return userInfo.id ? userInfo : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getCurrentUser();
  },

  // Get auth token
  getToken() {
    return getToken();
  },
  
  // Get current user info without validation
  getUserInfo() {
    return getUserInfo();
  },

  // Initialize auth state (call this when app starts)
  async initialize() {
    // Don't validate with server on initial load to prevent unnecessary requests
    const user = await this.getCurrentUser(false);
    
    // If we have a user, we'll validate the token on the first protected route
    if (user) {
      logger.info('initialize', 'User found in storage', { userId: user.id });
      return true;
    }
    
    // No user found, clear any partial/invalid data
    clearUserInfo();
    logger.info('initialize', 'No valid user session found');
    return false;
  },
  
  // Helper to handle authentication required for protected routes
  requireAuth() {
    if (!this.isAuthenticated()) {
      // Store the current path for redirect after login
      sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, window.location.pathname);
      window.location.href = '/login';
      return false;
    }
    return true;
  }
};

// Initialize auth state when the service is imported
authService.initialize();

// Export the service as default and also as named exports for individual functions
export const { getToken } = authService;
export default authService;
