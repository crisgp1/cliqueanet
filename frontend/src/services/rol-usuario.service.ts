import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface RolUsuario {
  id: number;
  nombre: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

class RolUsuarioService {
  private baseUrl = `${API_URL}/catalogs/rol-usuario`;

  async getAll(): Promise<RolUsuario[]> {
    try {
      const response = await axios.get<ApiResponse<RolUsuario[]>>(this.baseUrl);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener roles de usuario:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<RolUsuario> {
    try {
      const response = await axios.get<ApiResponse<RolUsuario>>(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error al obtener rol de usuario ${id}:`, error);
      throw error;
    }
  }
}

export const rolUsuarioService = new RolUsuarioService();
export default rolUsuarioService;