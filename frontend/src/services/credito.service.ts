import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

export interface Credito {
    id: number;
    clienteId: number;
    vehiculoId: number;
    montoTotal: number;
    plazo: number;
    tasaInteres: number;
    fechaInicio: Date;
    estado: string;
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
    pagos?: Array<{
        id: number;
        monto: number;
        fechaPago: Date;
        estado: string;
    }>;
}

export interface CreateCreditoDto {
    clienteId: number;
    vehiculoId: number;
    montoTotal: number;
    plazo: number;
    tasaInteres: number;
    fechaInicio: Date;
    estado: string;
}

export interface UpdateCreditoDto {
    montoTotal?: number;
    plazo?: number;
    tasaInteres?: number;
    fechaInicio?: Date;
    estado?: string;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

class CreditoService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${API_BASE_URL}/creditos`;
    }

    public async obtenerCreditos(): Promise<Credito[]> {
        try {
            const response = await axios.get<ApiResponse<Credito[]>>(this.baseUrl);
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async obtenerCreditoPorId(id: number): Promise<Credito> {
        try {
            const response = await axios.get<ApiResponse<Credito>>(`${this.baseUrl}/${id}`);
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async obtenerCreditosPorCliente(clienteId: number): Promise<Credito[]> {
        try {
            const response = await axios.get<ApiResponse<Credito[]>>(`${this.baseUrl}/cliente/${clienteId}`);
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async crearCredito(credito: CreateCreditoDto): Promise<Credito> {
        try {
            const response = await axios.post<ApiResponse<Credito>>(this.baseUrl, credito);
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async actualizarCredito(id: number, credito: UpdateCreditoDto): Promise<Credito> {
        try {
            const response = await axios.put<ApiResponse<Credito>>(`${this.baseUrl}/${id}`, credito);
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async eliminarCredito(id: number): Promise<void> {
        try {
            await axios.delete(`${this.baseUrl}/${id}`);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    private handleError(error: any): Error {
        if (error.response) {
            const message = error.response.data.message || 'Error en la solicitud del crédito';
            return new Error(message);
        } else if (error.request) {
            return new Error('No se recibió respuesta del servidor');
        } else {
            return new Error('Error al procesar la solicitud del crédito');
        }
    }
}

export const creditoService = new CreditoService();
export default creditoService;