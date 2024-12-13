import axios from 'axios';
import { TipoTransaccion, ApiResponse } from '../types';
import { API_BASE_URL } from '../config/api.config';

class TipoTransaccionService {
  private baseUrl = `${API_BASE_URL}/catalogs/tipos-transaccion`;

  async getAll(): Promise<TipoTransaccion[]> {
    try {
      const response = await axios.get<ApiResponse<TipoTransaccion[]>>(this.baseUrl);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener tipos de transacción:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<TipoTransaccion> {
    try {
      const response = await axios.get<ApiResponse<TipoTransaccion>>(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener tipo de transacción:', error);
      throw error;
    }
  }

  async create(nombre: string): Promise<TipoTransaccion> {
    try {
      const response = await axios.post<ApiResponse<TipoTransaccion>>(this.baseUrl, { nombre });
      return response.data.data;
    } catch (error) {
      console.error('Error al crear tipo de transacción:', error);
      throw error;
    }
  }

  async update(id: number, nombre: string): Promise<TipoTransaccion> {
    try {
      const response = await axios.put<ApiResponse<TipoTransaccion>>(`${this.baseUrl}/${id}`, { nombre });
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar tipo de transacción:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error al eliminar tipo de transacción:', error);
      throw error;
    }
  }
}

export const tipoTransaccionService = new TipoTransaccionService();
export default tipoTransaccionService;