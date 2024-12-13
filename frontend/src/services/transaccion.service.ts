import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

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

export class TransaccionService {
    private static instance: TransaccionService;
    private baseUrl: string;

    private constructor() {
        this.baseUrl = `${API_BASE_URL}/transacciones`;
    }

    public static getInstance(): TransaccionService {
        if (!TransaccionService.instance) {
            TransaccionService.instance = new TransaccionService();
        }
        return TransaccionService.instance;
    }

    public async getAll(): Promise<Transaccion[]> {
        try {
            const response = await axios.get<Transaccion[]>(this.baseUrl);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async getById(id: number): Promise<Transaccion> {
        try {
            const response = await axios.get<Transaccion>(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async create(transaccion: CreateTransaccionDto): Promise<Transaccion> {
        try {
            const response = await axios.post<Transaccion>(this.baseUrl, transaccion);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async update(id: number, transaccion: UpdateTransaccionDto): Promise<Transaccion> {
        try {
            const response = await axios.put<Transaccion>(`${this.baseUrl}/${id}`, transaccion);
            return response.data;
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

    private handleError(error: any): Error {
        if (error.response) {
            const message = error.response.data.message || 'Error en la solicitud de la transacción';
            return new Error(message);
        } else if (error.request) {
            return new Error('No se recibió respuesta del servidor');
        } else {
            return new Error('Error al procesar la solicitud de la transacción');
        }
    }
}

export const transaccionService = TransaccionService.getInstance();
export default transaccionService;