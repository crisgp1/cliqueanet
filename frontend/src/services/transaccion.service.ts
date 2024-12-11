import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface Transaccion {
  id: number;
  fecha: Date;
  idUsuario: number;
  idCliente: number;
  idVehiculo: number;
  idCredito?: number;
  idTipoTransaccion: number;
  usuario?: {
    id: number;
    nombre: string;
  };
  cliente?: {
    id: number;
    nombre: string;
  };
  vehiculo?: {
    id: number;
    marca: string;
    modelo: string;
    anio: number;
    precio: number;
  };
  credito?: {
    id: number;
    cantidad: number;
  };
  tipoTransaccion?: {
    id: number;
    nombre: string;
  };
}

export interface CreateTransaccionDto {
  idUsuario: number;
  idCliente: number;
  idVehiculo: number;
  idCredito?: number;
  idTipoTransaccion: number;
}

export interface UpdateTransaccionDto {
  idUsuario?: number;
  idCliente?: number;
  idVehiculo?: number;
  idCredito?: number;
  idTipoTransaccion?: number;
}

class TransaccionService {
  async getAll(): Promise<Transaccion[]> {
    try {
      const response = await axios.get<Transaccion[]>(`${API_URL}/transacciones`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Transaccion> {
    try {
      const response = await axios.get<Transaccion>(`${API_URL}/transacciones/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener transacción ${id}:`, error);
      throw error;
    }
  }

  async create(transaccion: CreateTransaccionDto): Promise<Transaccion> {
    try {
      const response = await axios.post<Transaccion>(`${API_URL}/transacciones`, transaccion);
      return response.data;
    } catch (error) {
      console.error('Error al crear transacción:', error);
      throw error;
    }
  }

  async update(id: number, transaccion: UpdateTransaccionDto): Promise<Transaccion> {
    try {
      const response = await axios.put<Transaccion>(`${API_URL}/transacciones/${id}`, transaccion);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar transacción ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/transacciones/${id}`);
    } catch (error) {
      console.error(`Error al eliminar transacción ${id}:`, error);
      throw error;
    }
  }
}

export default new TransaccionService();