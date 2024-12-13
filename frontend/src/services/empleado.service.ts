import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config/api.config';

export interface IUsuarioEmpleado {
    correo: string;
    id_rol: number;
    password?: string;
    username?: string;
    is_active?: boolean;
    is_locked?: boolean;
    auth_provider?: string;
    auth_provider_id?: string;
    two_factor_enabled?: boolean;
    two_factor_secret?: string;
}

export interface IEmpleado {
    id?: number;
    idUsuario?: number;
    idTipoIdentificacion: number;
    nombre: string;
    numIdentificacion: string;
    fechaNacimiento: Date;
    telefono: string;
    curp: string;
    domicilio: string;
    fechaContratacion: Date;
    numEmpleado?: string;
    usuario?: IUsuarioEmpleado;
    tipoIdentificacion?: {
        id_tipo_identificacion: number;
        nombre: string;
        descripcion?: string;
    };
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export class EmpleadoService {
    private static instance: EmpleadoService;
    private axiosInstance: AxiosInstance;
    private baseUrl: string;

    private constructor() {
        this.baseUrl = `${API_BASE_URL}/empleados`;
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: this.getAuthHeaders(),
        });

        // Interceptor para añadir el token a cada solicitud
        this.axiosInstance.interceptors.request.use(config => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        }, error => {
            return Promise.reject(error);
        });
    }

    public static getInstance(): EmpleadoService {
        if (!EmpleadoService.instance) {
            EmpleadoService.instance = new EmpleadoService();
        }
        return EmpleadoService.instance;
    }

    private getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token || ''}`,
            'Content-Type': 'application/json'
        };
    }

    private handleError(error: any): Error {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                const message = error.response.data.message || 'Error en la solicitud del empleado';
                return new Error(message);
            } else if (error.request) {
                return new Error('No se recibió respuesta del servidor');
            } else {
                return new Error('Error al procesar la solicitud del empleado');
            }
        }
        return new Error('Error desconocido al procesar la solicitud del empleado');
    }

    public async obtenerEmpleados(): Promise<IEmpleado[]> {
        try {
            const response: AxiosResponse<ApiResponse<IEmpleado[]>> = await this.axiosInstance.get('/');
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Error al obtener empleados');
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async obtenerEmpleadoPorId(id: number): Promise<IEmpleado> {
        try {
            const response: AxiosResponse<ApiResponse<IEmpleado>> = await this.axiosInstance.get(`/${id}`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Error al obtener el empleado');
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async crearEmpleado(data: { 
        usuario: IUsuarioEmpleado; 
        empleado: Omit<IEmpleado, 'id' | 'idUsuario' | 'usuario' | 'tipoIdentificacion'> 
    }): Promise<IEmpleado> {
        try {
            const response: AxiosResponse<ApiResponse<IEmpleado>> = await this.axiosInstance.post('/', data);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Error al crear el empleado');
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async actualizarEmpleado(
        id: number,
        data: {
            usuario?: Partial<IUsuarioEmpleado>;
            empleado?: Partial<Omit<IEmpleado, 'id' | 'idUsuario' | 'usuario' | 'tipoIdentificacion'>>;
        }
    ): Promise<IEmpleado> {
        try {
            const response: AxiosResponse<ApiResponse<IEmpleado>> = await this.axiosInstance.put(`/${id}`, data);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Error al actualizar el empleado');
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async desactivarEmpleado(id: number): Promise<void> {
        try {
            const response: AxiosResponse<ApiResponse<null>> = await this.axiosInstance.put(`/${id}/desactivar`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Error al desactivar el empleado');
            }
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async reactivarEmpleado(id: number): Promise<void> {
        try {
            const response: AxiosResponse<ApiResponse<null>> = await this.axiosInstance.put(`/${id}/reactivar`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Error al reactivar el empleado');
            }
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async cambiarPassword(
        id: number,
        passwords: { passwordActual: string; passwordNuevo: string; confirmarPassword: string }
    ): Promise<void> {
        try {
            const response: AxiosResponse<ApiResponse<null>> = await this.axiosInstance.put(`/${id}/password`, passwords);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Error al cambiar la contraseña');
            }
        } catch (error) {
            throw this.handleError(error);
        }
    }
}

export const empleadoService = EmpleadoService.getInstance();