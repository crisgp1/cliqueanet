import axios from 'axios';

import { API_BASE_URL } from '../config/api.config';


export class CreditoService {
    private static instance: CreditoService;
    private baseUrl: string;

    private constructor() {
        this.baseUrl = `${API_BASE_URL}/citas`;
    }

    public static getInstance(): CreditoService {
        if (!CreditoService.instance) {
            CreditoService.instance = new CreditoService();
        }
        return CreditoService.instance;
    }

    public async obtenerCreditos() {
        try {
            const response = await axios.get(this.baseUrl, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async obtenerCreditoPorId(id: number) {
        try {
            const response = await axios.get(`${this.baseUrl}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async obtenerCreditosPorCliente(clienteId: number) {
        try {
            const response = await axios.get(`${this.baseUrl}/cliente/${clienteId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async crearCredito(credito: {
        clienteId: number;
        vehiculoId: number;
        montoTotal: number;
        plazo: number;
        tasaInteres: number;
        fechaInicio: Date;
        estado: string;
    }) {
        try {
            const response = await axios.post(this.baseUrl, credito, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async actualizarCredito(id: number, credito: {
        montoTotal?: number;
        plazo?: number;
        tasaInteres?: number;
        fechaInicio?: Date;
        estado?: string;
    }) {
        try {
            const response = await axios.put(`${this.baseUrl}/${id}`, credito, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async eliminarCredito(id: number) {
        try {
            const response = await axios.delete(`${this.baseUrl}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
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

export const creditoService = CreditoService.getInstance();