import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export interface Vehiculo {
    id_vehiculo: number;
    marca: string;
    modelo: string;
    anio: number;
    precio: number;
    num_serie: string;
    color: string;
    num_motor: string;
    num_factura?: string;
    placas?: string;
    tarjeta_circulacion?: string;
    comentarios_internos?: string;
}

export interface CreateVehiculoDto {
    marca: string;
    modelo: string;
    anio: number;
    precio: number;
    num_serie: string;
    color: string;
    num_motor: string;
    num_factura?: string;
    placas?: string;
    tarjeta_circulacion?: string;
    comentarios_internos?: string;
}

export interface UpdateVehiculoDto {
    marca?: string;
    modelo?: string;
    anio?: number;
    precio?: number;
    num_serie?: string;
    color?: string;
    num_motor?: string;
    num_factura?: string;
    placas?: string;
    tarjeta_circulacion?: string;
    comentarios_internos?: string;
}

class VehiculoService {
    async getAll(): Promise<Vehiculo[]> {
        try {
            const response = await axios.get<Vehiculo[]>(`${API_URL}/vehiculos`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener vehículos:', error);
            throw error;
        }
    }

    async getById(id: number): Promise<Vehiculo> {
        try {
            const response = await axios.get<Vehiculo>(`${API_URL}/vehiculos/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener vehículo ${id}:`, error);
            throw error;
        }
    }

    async create(vehiculo: CreateVehiculoDto): Promise<Vehiculo> {
        try {
            const response = await axios.post<Vehiculo>(`${API_URL}/vehiculos`, vehiculo);
            return response.data;
        } catch (error) {
            console.error('Error al crear vehículo:', error);
            throw error;
        }
    }

    async update(id: number, vehiculo: UpdateVehiculoDto): Promise<Vehiculo> {
        try {
            const response = await axios.put<Vehiculo>(`${API_URL}/vehiculos/${id}`, vehiculo);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar vehículo ${id}:`, error);
            throw error;
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await axios.delete(`${API_URL}/vehiculos/${id}`);
        } catch (error) {
            console.error(`Error al eliminar vehículo ${id}:`, error);
            throw error;
        }
    }

    async getByNumSerie(numSerie: string): Promise<Vehiculo | null> {
        try {
            const response = await axios.get<Vehiculo[]>(`${API_URL}/vehiculos`, {
                params: { numSerie }
            });
            return response.data[0] || null;
        } catch (error) {
            console.error(`Error al buscar vehículo por número de serie ${numSerie}:`, error);
            throw error;
        }
    }

    async getByPlacas(placas: string): Promise<Vehiculo | null> {
        try {
            const response = await axios.get<Vehiculo[]>(`${API_URL}/vehiculos`, {
                params: { placas }
            });
            return response.data[0] || null;
        } catch (error) {
            console.error(`Error al buscar vehículo por placas ${placas}:`, error);
            throw error;
        }
    }

    async getByNumMotor(numMotor: string): Promise<Vehiculo | null> {
        try {
            const response = await axios.get<Vehiculo[]>(`${API_URL}/vehiculos`, {
                params: { numMotor }
            });
            return response.data[0] || null;
        } catch (error) {
            console.error(`Error al buscar vehículo por número de motor ${numMotor}:`, error);
            throw error;
        }
    }
}

export default new VehiculoService();