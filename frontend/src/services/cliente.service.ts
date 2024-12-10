import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export interface Cliente {
  id: number;
  nombre: string;
  curp: string;
  idTipoIdentificacion: number;
  numIdentificacion: string;
  fechaNacimiento: Date;
  telefono: string;
  correo: string;
  domicilio: string;
  tipoIdentificacion?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
}

export interface CreateClienteDto {
  nombre: string;
  curp: string;
  idTipoIdentificacion: number;
  numIdentificacion: string;
  fechaNacimiento: Date;
  telefono: string;
  correo: string;
  domicilio: string;
}

export interface UpdateClienteDto {
  nombre?: string;
  curp?: string;
  idTipoIdentificacion?: number;
  numIdentificacion?: string;
  fechaNacimiento?: Date;
  telefono?: string;
  correo?: string;
  domicilio?: string;
}

class ClienteService {
  async getAll(): Promise<Cliente[]> {
    try {
      const response = await axios.get<Cliente[]>(`${API_URL}/clientes`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Cliente> {
    try {
      const response = await axios.get<Cliente>(`${API_URL}/clientes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener cliente ${id}:`, error);
      throw error;
    }
  }

  async create(cliente: CreateClienteDto): Promise<Cliente> {
    try {
      const response = await axios.post<Cliente>(`${API_URL}/clientes`, cliente);
      return response.data;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  }

  async update(id: number, cliente: UpdateClienteDto): Promise<Cliente> {
    try {
      const response = await axios.put<Cliente>(`${API_URL}/clientes/${id}`, cliente);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar cliente ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/clientes/${id}`);
    } catch (error) {
      console.error(`Error al eliminar cliente ${id}:`, error);
      throw error;
    }
  }

  async getByIdentificacion(numIdentificacion: string): Promise<Cliente | null> {
    try {
      const response = await axios.get<Cliente[]>(`${API_URL}/clientes`, {
        params: { numIdentificacion }
      });
      return response.data[0] || null;
    } catch (error) {
      console.error(`Error al buscar cliente por identificación ${numIdentificacion}:`, error);
      throw error;
    }
  }

  async getByCurp(curp: string): Promise<Cliente | null> {
    try {
      const response = await axios.get<Cliente[]>(`${API_URL}/clientes`, {
        params: { curp }
      });
      return response.data[0] || null;
    } catch (error) {
      console.error(`Error al buscar cliente por CURP ${curp}:`, error);
      throw error;
    }
  }

  async getByCorreo(correo: string): Promise<Cliente | null> {
    try {
      const response = await axios.get<Cliente[]>(`${API_URL}/clientes`, {
        params: { correo }
      });
      return response.data[0] || null;
    } catch (error) {
      console.error(`Error al buscar cliente por correo ${correo}:`, error);
      throw error;
    }
  }
}

export default new ClienteService();