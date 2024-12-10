import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export interface TipoIdentificacion {
  id: number;
  nombre: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

class TipoIdentificacionService {
  private baseUrl = `${API_URL}/catalogs/tipo-identificacion`;

  async getAll(): Promise<TipoIdentificacion[]> {
    try {
      const response = await axios.get<ApiResponse<TipoIdentificacion[]>>(this.baseUrl);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener tipos de identificación:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<TipoIdentificacion> {
    try {
      const response = await axios.get<ApiResponse<TipoIdentificacion>>(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error al obtener tipo de identificación ${id}:`, error);
      throw error;
    }
  }
}

export const tipoIdentificacionService = new TipoIdentificacionService();
export default tipoIdentificacionService;