/* eslint no-process-env: 0 */
import axios from 'axios';
import { getToken } from './authService';

// Create a custom Axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000', 
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true, // This is required for cookies to be sent with requests
  xsrfCookieName: 'CSRF-TOKEN',
  xsrfHeaderName: 'X-CSRF-TOKEN',
});

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login or handle as needed
          console.error('Authentication required');
          break;
          
        case 403:
          // Forbidden - user doesn't have permission
          console.error('You do not have permission to perform this action');
          break;
          
        case 404:
          // Not found
          console.error('The requested resource was not found');
          break;
          
        case 422:
          // Validation errors - these will be handled by the form
          console.error('Validation errors:', data.errors);
          break;
          
        case 500:
          // Server error
          console.error('A server error occurred. Please try again later.');
          break;
          
        default:
          console.error('An error occurred:', data.error || 'Unknown error');
      }
      
      // Log detailed error in development
      if (import.meta.env.DEV) {
        console.error('API Error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
