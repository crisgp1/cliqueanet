import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

export interface TipoIdentificacion {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

class TipoIdentificacionService {
  private baseUrl = `${API_BASE_URL}/catalogs/tipos-identificacion`;

  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getAll(): Promise<TipoIdentificacion[]> {
    try {
      const response = await axios.get<ApiResponse<TipoIdentificacion[]>>(
        this.baseUrl,
        { headers: this.getAuthHeader() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener tipos de identificación:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<TipoIdentificacion> {
    try {
      const response = await axios.get<ApiResponse<TipoIdentificacion>>(
        `${this.baseUrl}/${id}`,
        { headers: this.getAuthHeader() }
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error al obtener tipo de identificación ${id}:`, error);
      throw error;
    }
  }
}

export const tipoIdentificacionService = new TipoIdentificacionService();
export default tipoIdentificacionService;