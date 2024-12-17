import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

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

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

const toBackendFormat = (data: any) => {
    const transformed: any = {};
    Object.entries(data).forEach(([key, value]) => {
        const newKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        transformed[newKey] = value;
    });
    return transformed;
};

const toFrontendFormat = (data: any) => {
    const transformed: any = {};
    Object.entries(data).forEach(([key, value]) => {
        const newKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        transformed[newKey] = value;
    });
    return transformed;
};

class VehiculoService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${API_BASE_URL}/vehiculos`;
    }

    public async getAll(): Promise<Vehiculo[]> {
        try {
            const response = await axios.get<ApiResponse<any[]>>(this.baseUrl);
            return response.data.data.map(vehiculo => toFrontendFormat(vehiculo));
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async getById(id: number): Promise<Vehiculo> {
        try {
            const response = await axios.get<ApiResponse<any>>(`${this.baseUrl}/${id}`);
            return toFrontendFormat(response.data.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async create(vehiculo: CreateVehiculoDto): Promise<Vehiculo> {
        try {
            const response = await axios.post<ApiResponse<any>>(this.baseUrl, toBackendFormat(vehiculo));
            return toFrontendFormat(response.data.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async update(id: number, vehiculo: UpdateVehiculoDto): Promise<Vehiculo> {
        try {
            const response = await axios.put<ApiResponse<any>>(`${this.baseUrl}/${id}`, toBackendFormat(vehiculo));
            return toFrontendFormat(response.data.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async delete(id: number): Promise<void> {
        try {
            await axios.delete(`${this.baseUrl}/${id}`);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async getByNumSerie(numSerie: string): Promise<Vehiculo | null> {
        try {
            const response = await axios.get<ApiResponse<any[]>>(this.baseUrl, {
                params: { numSerie: toBackendFormat({ num_serie: numSerie }).numSerie }
            });
            return response.data.data[0] ? toFrontendFormat(response.data.data[0]) : null;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async getByPlacas(placas: string): Promise<Vehiculo | null> {
        try {
            const response = await axios.get<ApiResponse<any[]>>(this.baseUrl, {
                params: { placas }
            });
            return response.data.data[0] ? toFrontendFormat(response.data.data[0]) : null;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async getByNumMotor(numMotor: string): Promise<Vehiculo | null> {
        try {
            const response = await axios.get<ApiResponse<any[]>>(this.baseUrl, {
                params: { numMotor: toBackendFormat({ num_motor: numMotor }).numMotor }
            });
            return response.data.data[0] ? toFrontendFormat(response.data.data[0]) : null;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    private handleError(error: any): Error {
        if (error.response) {
            const message = error.response.data.message || 'Error en la solicitud del vehículo';
            return new Error(message);
        } else if (error.request) {
            return new Error('No se recibió respuesta del servidor');
        } else {
            return new Error('Error al procesar la solicitud del vehículo');
        }
    }
}

export const vehiculoService = new VehiculoService();
export default vehiculoService;