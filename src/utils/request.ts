import axios from 'axios';
import type { AxiosError } from 'axios';

type AuthErrorResponse = {
  code?: string;
};

const request = axios.create({
  timeout: 15000,
  // We use standard axios behavior (throws on non-2xx status codes)
  // but we intercept responses to provide a unified data structure if desired,
  // or just let it throw to the catch block where it can be handled.
});

// Request interceptor: attach token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vela_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
request.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<AuthErrorResponse>) => {
    if (error.response?.status === 401 && error.response.data?.code === 'AUTH_INVALID') {
      localStorage.removeItem('vela_token');
      localStorage.removeItem('vela_user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default request;
