import axios from 'axios';

const API_URL =  'http://localhost:3001';

export class CitaService {
    private static instance: CitaService;
    private baseUrl: string;

    private constructor() {
        this.baseUrl = `${API_URL}/api/citas`;
    }

    public static getInstance(): CitaService {
        if (!CitaService.instance) {
            CitaService.instance = new CitaService();
        }
        return CitaService.instance;
    }

    public async obtenerCitas() {
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

    public async obtenerCitaPorId(id: number) {
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

    public async obtenerCitasPorCliente(clienteId: number) {
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

    public async crearCita(cita: {
        clienteId: number;
        fecha: Date;
        hora: string;
        motivo: string;
        estado: string;
        empleadosIds?: number[];
        notas?: string;
    }) {
        try {
            const response = await axios.post(this.baseUrl, cita, {
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

    public async actualizarCita(id: number, cita: {
        fecha?: Date;
        hora?: string;
        motivo?: string;
        estado?: string;
        empleadosIds?: number[];
        notas?: string;
    }) {
        try {
            const response = await axios.put(`${this.baseUrl}/${id}`, cita, {
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

    public async eliminarCita(id: number) {
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
            const message = error.response.data.message || 'Error en la solicitud de la cita';
            return new Error(message);
        } else if (error.request) {
            return new Error('No se recibió respuesta del servidor');
        } else {
            return new Error('Error al procesar la solicitud de la cita');
        }
    }
}

export const citaService = CitaService.getInstance();