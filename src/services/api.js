/* eslint no-process-env: 0 */
import axios from 'axios';
import { getToken, clearUserInfo } from '../utils/tokenUtils';

// Create a custom Axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true, // Required for cookies/authentication
  xsrfCookieName: '_loverary_csrf',
  xsrfHeaderName: 'X-CSRF-Token',
});

// CSRF token handling
let csrfToken = null;
const CSRF_TOKEN_KEY = 'loverary_csrf_token';

// Try to get CSRF token from localStorage on initial load
const storedCSRFToken = localStorage.getItem(CSRF_TOKEN_KEY);
if (storedCSRFToken) {
  csrfToken = storedCSRFToken;
}

/**
 * Fetches and stores a new CSRF token from the server
 */
export const fetchCSRFToken = async () => {
  try {
    const response = await axios.get('http://localhost:3000/users/csrf-token', {
      withCredentials: true,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (response.data && response.data.csrf_token) {
      csrfToken = response.data.csrf_token;
      // Store the token in localStorage for persistence across page reloads
      localStorage.setItem(CSRF_TOKEN_KEY, csrfToken);
      logger.info('CSRF', 'Fetched and stored new CSRF token');
    } else {
      throw new Error('Invalid CSRF token response format');
    }
    
    return csrfToken;
  } catch (error) {
    logger.error('CSRF', 'Failed to fetch CSRF token', { error: error.message });
    // Clear the stored token on error
    localStorage.removeItem(CSRF_TOKEN_KEY);
    csrfToken = null;
    throw error;
  }
};

// Initialize CSRF token when the module loads
fetchCSRFToken().catch(console.warn);

// Set default withCredentials to true for all requests
api.defaults.withCredentials = true;

// Helper function for consistent logging
const logger = {
  info: (component, message, data = {}) => {
    console.log(`[API][${component}] ${message}`, data);
  },
  error: (component, message, error = {}) => {
    console.error(`[API][${component}][ERROR] ${message}`, error);
  }
};

// Add a request interceptor to include auth token and CSRF token
api.interceptors.request.use(
  async (config) => {
    const requestId = Math.random().toString(36).substring(2, 9);
    config.metadata = { startTime: new Date(), requestId };
    
    const { method, url, params, data, headers } = config;
    const isApiRequest = url.startsWith(api.defaults.baseURL);
    const needsCSRFToken = ['post', 'put', 'patch', 'delete'].includes(method?.toLowerCase());
    
    logger.info('Request', 'Outgoing request', {
      requestId,
      method,
      url,
      params,
      data: method?.toLowerCase() !== 'get' ? data : undefined,
      isApiRequest,
      needsCSRFToken
    });
    
    // Add CSRF token for modifying requests to our API
    if (isApiRequest && needsCSRFToken && csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
      logger.info('Request', 'Added CSRF token', { requestId });
    }
    
    // Add auth token if available
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      logger.info('Request', 'Added auth token', { 
        requestId,
        hasToken: !!token,
        tokenPrefix: token.substring(0, 10) + '...' 
      });
    } else {
      logger.info('Request', 'No auth token found', { requestId });
    }
    
    return config;
  },
  (error) => {
    const requestId = error.config?.metadata?.requestId || 'unknown';
    logger.error('Request', 'Request interceptor error', { 
      requestId,
      error: error.message,
      config: error.config 
    });
    return Promise.reject(error);
  }
);

// Track authentication state and retry counts
const authState = {
  isAuthenticated: false,
  lastAuthCheck: 0,
  authCheckInProgress: false,
  failedAuthChecks: 0
};

// Add a response interceptor to handle common errors and CSRF token refresh
api.interceptors.response.use(
  (response) => {
    const { config, status, statusText, data } = response;
    const { method, url, metadata = {} } = config;
    const { requestId, startTime } = metadata;
    const duration = startTime ? new Date() - startTime : 'unknown';
    
    // Reset failed auth checks counter on successful auth
    if (url.includes('/users/current') && status === 200) {
      authState.failedAuthChecks = 0;
      authState.isAuthenticated = true;
      authState.lastAuthCheck = Date.now();
    }
    
    logger.info('Response', 'Received response', {
      requestId,
      method,
      url,
      status,
      statusText,
      duration: `${duration}ms`,
      data: method?.toLowerCase() === 'get' ? data : undefined
    });
    
    return response;
  },
  async (error) => {
    const { config, response, message } = error;
    const { method, url, metadata = {} } = config || {};
    const { requestId } = metadata || {};
    
    // Skip handling if no config (network error, etc.)
    if (!config) {
      logger.error('Response', 'No config in error', { message });
      return Promise.reject(error);
    }
    
    // Handle 401 Unauthorized responses
    if (response?.status === 401) {
      authState.failedAuthChecks++;
      authState.isAuthenticated = false;
      
      // If we've had multiple failed auth checks, stop trying
      if (authState.failedAuthChecks > 2) {
        logger.info('Auth', 'Multiple auth failures, redirecting to login', {
          failedChecks: authState.failedAuthChecks,
          url: config.url
        });
        
        // Clear any existing auth data
        clearUserInfo();
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(new Error('Authentication required'));
      }
      
      // Don't retry the same request
      return Promise.reject(error);
    }
    
    if (response) {
      // Log response error
      const { status, statusText, data } = response;
      logger.error('Response', 'Error response', {
        requestId,
        method,
        url,
        status,
        statusText,
        error: data?.error || message,
        responseData: data
      });
    } else {
      // Log request error (no response)
      logger.error('Response', 'Request failed', {
        requestId,
        method: method,
        url: url,
        error: message,
        config: { url, method }
      });
    }
    
    const originalRequest = error.config;
    
    // Handle CSRF token expiration (401 with specific error message)
    if (error.response?.status === 401 && 
        error.response?.data?.error === 'Invalid CSRF token' && 
        !originalRequest?._retry) {
      originalRequest._retry = true;
      
      logger.info('CSRF', 'Detected CSRF token expiration, attempting refresh', { requestId });
      
      try {
        // Try to get a new CSRF token
        await fetchCSRFToken();
        logger.info('CSRF', 'Successfully refreshed CSRF token', { requestId });
        // Retry the original request with the new token
        return api(originalRequest);
      } catch (csrfError) {
        logger.error('CSRF', 'Failed to refresh CSRF token', { 
          requestId, 
          error: csrfError.message 
        });
        // If we can't get a new CSRF token, the user needs to log in again
        window.location.href = '/login';
        return Promise.reject(csrfError);
      }
    }
    
    // Standard error handling
    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = 'An unexpected error occurred';
      
      // Map status codes to error messages based on API documentation
      switch (status) {
        case 400:
          errorMessage = data.error || 'Invalid request format';
          break;
          
        case 401:
          errorMessage = data.error || 'Authentication required';
          // Consider redirecting to login page or showing login modal
          if (window.location.pathname !== '/login') {
            // Store the current location for redirecting after login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = '/login';
          }
          break;
          
        case 403:
          errorMessage = data.error || 'You do not have permission to perform this action';
          break;
          
        case 404:
          errorMessage = data.error || 'The requested resource was not found';
          break;
          
        case 422:
          // Format validation errors as a single string
          if (data.errors && Array.isArray(data.errors)) {
            errorMessage = data.errors.join(', ');
          } else if (typeof data.errors === 'object') {
            errorMessage = Object.values(data.errors).flat().join(', ');
          } else {
            errorMessage = data.error || 'Validation failed';
          }
          break;
          
        case 500:
          errorMessage = 'A server error occurred. Please try again later.';
          break;
          
        default:
          errorMessage = data.error || `An error occurred (${status})`;
      }
      
      // Create a new error with the formatted message
      const formattedError = new Error(errorMessage);
      formattedError.response = error.response;
      formattedError.status = status;
      
      // Log detailed error in development
      if (import.meta.env.DEV) {
        console.error('API Error:', {
          status,
          message: errorMessage,
          response: data,
          url: originalRequest.url,
          method: originalRequest.method,
        });
      }
      
      return Promise.reject(formattedError);
      
    } else if (error.request) {
      // The request was made but no response was received
      const networkError = new Error('No response received from server. Please check your connection.');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
      
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      return Promise.reject(error);
    }
  }
);

export default api;
