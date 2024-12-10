import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface IEmpleado {
    id?: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion?: string;
    rolId: number;
    tipoIdentificacionId: number;
    numeroIdentificacion: string;
    fechaNacimiento?: Date;
    activo?: boolean;
    password?: string;
}

export class EmpleadoService {
    private static instance: EmpleadoService;
    private baseUrl: string;

    private constructor() {
        this.baseUrl = `${API_URL}/api/empleados`;
    }

    public static getInstance(): EmpleadoService {
        if (!EmpleadoService.instance) {
            EmpleadoService.instance = new EmpleadoService();
        }
        return EmpleadoService.instance;
    }

    public async obtenerEmpleados() {
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

    public async obtenerEmpleadoPorId(id: number) {
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

    public async crearEmpleado(empleado: IEmpleado) {
        try {
            const response = await axios.post(this.baseUrl, empleado, {
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

    public async actualizarEmpleado(id: number, empleado: Partial<IEmpleado>) {
        try {
            const response = await axios.put(`${this.baseUrl}/${id}`, empleado, {
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

    public async desactivarEmpleado(id: number) {
        try {
            const response = await axios.put(`${this.baseUrl}/${id}/desactivar`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async reactivarEmpleado(id: number) {
        try {
            const response = await axios.put(`${this.baseUrl}/${id}/reactivar`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async cambiarPassword(id: number, passwords: { 
        passwordActual: string; 
        passwordNuevo: string; 
        confirmarPassword: string;
    }) {
        try {
            const response = await axios.put(`${this.baseUrl}/${id}/password`, passwords, {
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

    private handleError(error: any): Error {
        if (error.response) {
            const message = error.response.data.message || 'Error en la solicitud del empleado';
            return new Error(message);
        } else if (error.request) {
            return new Error('No se recibió respuesta del servidor');
        } else {
            return new Error('Error al procesar la solicitud del empleado');
        }
    }
}

export const empleadoService = EmpleadoService.getInstance();