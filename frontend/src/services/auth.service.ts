import axios from 'axios';
import { LoginResponse, LoginCredentials, LoginHistory } from '../types';

const API_URL = 'http://localhost:3001/api';

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Add IP address and user agent to credentials
      const enrichedCredentials = {
        ...credentials,
        user_agent: window.navigator.userAgent,
        // We'll get the IP from the server side since it's more reliable
        ip_address: '0.0.0.0' // This will be overwritten by the server
      };

      const response = await axios.post<LoginResponse>(`${API_URL}/usuarios/login`, enrichedCredentials);
      
      if (response.data.success && response.data.data) {
        // Store user data and token in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.data.usuario));
        localStorage.setItem('token', response.data.data.token);
        
        // Store last login info if available
        if (response.data.data.lastLogin) {
          localStorage.setItem('lastLogin', JSON.stringify(response.data.data.lastLogin));
        }
        
        // Set default Authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
      }
      return response.data;
    } catch (error: unknown) {
      // Type guard for axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data: LoginResponse } };
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
      }
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('lastLogin');
    // Remove Authorization header
    delete axios.defaults.headers.common['Authorization'];
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  getLastLogin(): LoginHistory | null {
    const lastLoginStr = localStorage.getItem('lastLogin');
    if (lastLoginStr) {
      return JSON.parse(lastLoginStr);
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  setupAxiosInterceptors(): void {
    // Add token to requests if it exists
    const token = this.getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Handle 401 responses
    axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
}

export const authService = new AuthService();

// Setup interceptors on service initialization
authService.setupAxiosInterceptors();