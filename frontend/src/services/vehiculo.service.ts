import axios from 'axios';

const API_URL = 'http://localhost:3001';

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

// Función para transformar de snake_case a camelCase
const toBackendFormat = (data: any) => {
    const transformed: any = {};
    Object.entries(data).forEach(([key, value]) => {
        const newKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        transformed[newKey] = value;
    });
    return transformed;
};

// Función para transformar de camelCase a snake_case
const toFrontendFormat = (data: any) => {
    const transformed: any = {};
    Object.entries(data).forEach(([key, value]) => {
        const newKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        transformed[newKey] = value;
    });
    return transformed;
};

class VehiculoService {
    async getAll(): Promise<Vehiculo[]> {
        try {
            const response = await axios.get<any[]>(`${API_URL}/vehiculos`);
            return response.data.map(vehiculo => toFrontendFormat(vehiculo));
        } catch (error) {
            console.error('Error al obtener vehículos:', error);
            throw error;
        }
    }

    async getById(id: number): Promise<Vehiculo> {
        try {
            const response = await axios.get<any>(`${API_URL}/vehiculos/${id}`);
            return toFrontendFormat(response.data);
        } catch (error) {
            console.error(`Error al obtener vehículo ${id}:`, error);
            throw error;
        }
    }

    async create(vehiculo: CreateVehiculoDto): Promise<Vehiculo> {
        try {
            const response = await axios.post<any>(
                `${API_URL}/vehiculos`,
                toBackendFormat(vehiculo)
            );
            return toFrontendFormat(response.data);
        } catch (error) {
            console.error('Error al crear vehículo:', error);
            throw error;
        }
    }

    async update(id: number, vehiculo: UpdateVehiculoDto): Promise<Vehiculo> {
        try {
            const response = await axios.put<any>(
                `${API_URL}/vehiculos/${id}`,
                toBackendFormat(vehiculo)
            );
            return toFrontendFormat(response.data);
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
            const response = await axios.get<any[]>(`${API_URL}/vehiculos`, {
                params: { numSerie: toBackendFormat({ num_serie: numSerie }).numSerie }
            });
            return response.data[0] ? toFrontendFormat(response.data[0]) : null;
        } catch (error) {
            console.error(`Error al buscar vehículo por número de serie ${numSerie}:`, error);
            throw error;
        }
    }

    async getByPlacas(placas: string): Promise<Vehiculo | null> {
        try {
            const response = await axios.get<any[]>(`${API_URL}/vehiculos`, {
                params: { placas }
            });
            return response.data[0] ? toFrontendFormat(response.data[0]) : null;
        } catch (error) {
            console.error(`Error al buscar vehículo por placas ${placas}:`, error);
            throw error;
        }
    }

    async getByNumMotor(numMotor: string): Promise<Vehiculo | null> {
        try {
            const response = await axios.get<any[]>(`${API_URL}/vehiculos`, {
                params: { numMotor: toBackendFormat({ num_motor: numMotor }).numMotor }
            });
            return response.data[0] ? toFrontendFormat(response.data[0]) : null;
        } catch (error) {
            console.error(`Error al buscar vehículo por número de motor ${numMotor}:`, error);
            throw error;
        }
    }
}

export default new VehiculoService();