import axios from 'axios';
import { LoginResponse, LoginCredentials, LoginHistory } from '../types';
import { ipService } from './ip.service';

const API_URL = 'http://localhost:3001';

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🚀 Obteniendo IP del cliente...');
      const ip_address = await ipService.getClientIp();
      console.log('✅ IP obtenida:', ip_address);

      const enrichedCredentials = {
        ...credentials,
        user_agent: window.navigator.userAgent,
        ip_address
      };

      console.log('🚀 Enviando credenciales:', {
        ...enrichedCredentials,
        password: '[REDACTED]'
      });

      const response = await axios.post<LoginResponse>(
        `${API_URL}/api/usuarios/login`, 
        enrichedCredentials
      );

      if (response.data.success && response.data.data) {
        // Store user data and token in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.data.usuario));
        localStorage.setItem('token', response.data.data.token);
        
        if (response.data.data.lastLogin) {
          localStorage.setItem('lastLogin', JSON.stringify(response.data.data.lastLogin));
        }
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
      }

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // Si es un error de respuesta del servidor
        if (error.response?.data) {
          return error.response.data as LoginResponse;
        }
        
        // Si es un error de red o tiempo de espera
        return {
          success: false,
          message: error.message || 'Error de conexión con el servidor'
        };
      }

      // Para otros tipos de errores
      return {
        success: false,
        message: 'Error inesperado durante el inicio de sesión'
      };
    }
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('lastLogin');
    delete axios.defaults.headers.common['Authorization'];
    ipService.clearCache();
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
    const token = this.getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    axios.interceptors.response.use(
      response => response,
      error => {
        // Solo redirigir si no estamos ya en la página de login
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
          this.logout();
          // Usar history.push en lugar de window.location para evitar recargas
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
}

export const authService = new AuthService();
authService.setupAxiosInterceptors();