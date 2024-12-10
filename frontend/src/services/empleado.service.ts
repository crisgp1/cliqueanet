import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface IEmpleado {
    id_empleado?: number;
    nombre: string;
    id_tipo_identificacion: number;
    num_identificacion: string;
    curp: string;
    fecha_nacimiento: Date;
    telefono: string;
    correo: string;
    domicilio: string;
    fecha_contratacion: Date;
    id_rol: number;
    password?: string;
    num_empleado?: string;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export class EmpleadoService {
    private static instance: EmpleadoService;
    private baseUrl: string;

    private constructor() {
        this.baseUrl = `${API_URL}/api/usuarios`;
    }

    public static getInstance(): EmpleadoService {
        if (!EmpleadoService.instance) {
            EmpleadoService.instance = new EmpleadoService();
        }
        return EmpleadoService.instance;
    }

    public async obtenerEmpleados(): Promise<IEmpleado[]> {
        try {
            const response = await axios.get<ApiResponse<IEmpleado[]>>(this.baseUrl, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async obtenerEmpleadoPorId(id: number): Promise<IEmpleado> {
        try {
            const response = await axios.get<ApiResponse<IEmpleado>>(`${this.baseUrl}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async crearEmpleado(empleado: Omit<IEmpleado, 'id_empleado'>): Promise<IEmpleado> {
        try {
            const response = await axios.post<ApiResponse<IEmpleado>>(this.baseUrl, empleado, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async actualizarEmpleado(id: number, empleado: Partial<IEmpleado>): Promise<IEmpleado> {
        try {
            const response = await axios.put<ApiResponse<IEmpleado>>(`${this.baseUrl}/${id}`, empleado, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async desactivarEmpleado(id: number): Promise<void> {
        try {
            await axios.put(`${this.baseUrl}/${id}/desactivar`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async reactivarEmpleado(id: number): Promise<void> {
        try {
            await axios.put(`${this.baseUrl}/${id}/reactivar`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async cambiarPassword(id: number, passwords: { 
        passwordActual: string; 
        passwordNuevo: string; 
        confirmarPassword: string;
    }): Promise<void> {
        try {
            await axios.put(`${this.baseUrl}/${id}/password`, passwords, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
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