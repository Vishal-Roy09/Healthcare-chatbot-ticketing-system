import axios from 'axios';

// Create an axios instance with base URL that works with the proxy
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to set auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      return Promise.reject(error);
    } else if (error.request) {
      // Request was made but no response
      console.error('Network Error:', error.request);
      return Promise.reject({
        response: {
          data: {
            msg: 'Unable to connect to server. Please check if the server is running.'
          }
        }
      });
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject({
        response: {
          data: {
            msg: 'An unexpected error occurred.'
          }
        }
      });
    }
  }
);

export default api;