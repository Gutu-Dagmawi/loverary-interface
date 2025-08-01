import api from './api';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_INFO_KEY = 'user_info';

const authService = {
  // Register a new user
  async register(userData) {
    try {
      const response = await api.post('/users', {
        user: {
          username: userData.username,
          email: userData.email,
          password: userData.password
        }
      });

      // Store user info in localStorage
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(response.data.user));
      
      return response.data.user;
    } catch (error) {
      console.error('Registration failed:', error);
      // Format error messages from the API if available
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      throw error;
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/users/login', {
        user: {
          email: credentials.email,
          password: credentials.password
        }
      });

      // Store user info in localStorage
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(response.data.user));
      
      return response.data.user;
    } catch (error) {
      console.error('Login failed:', error);
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      await api.delete('/users/logout');
    } catch (error) {
      console.error('Logout failed:', error);
      // Continue with clearing local data even if API call fails
    } finally {
      // Clear user data from localStorage
      localStorage.removeItem(USER_INFO_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  },

  // Get current user
  async getCurrentUser() {
    // First check localStorage for quick access
    const cachedUser = localStorage.getItem(USER_INFO_KEY);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    // If not in localStorage, try to fetch from API
    try {
      const response = await api.get('/users/current');
      if (response.data) {
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(response.data));
        return response.data;
      }
      return null;
    } catch (error) {
      if (error.response?.status === 401) {
        // Clear any stale auth data
        localStorage.removeItem(USER_INFO_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem(USER_INFO_KEY);
  },

  // Get auth token (if using token-based auth in the future)
  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  // Initialize auth state (call this when app starts)
  async initialize() {
    // Check if we have a user in localStorage
    const user = localStorage.getItem(USER_INFO_KEY);
    if (user) {
      try {
        // Verify the session is still valid
        await this.getCurrentUser();
      } catch (error) {
        console.error('Session validation failed:', error);
        this.logout();
      }
    }
  }
};

// Initialize auth state when the service is imported
authService.initialize();

// Export the service as default and also as named exports for individual functions
export const { getToken } = authService;
export default authService;
