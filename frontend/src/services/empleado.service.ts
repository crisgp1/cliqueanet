import axios from 'axios';
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
    id_empleado?: number;
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

class EmpleadoService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${API_BASE_URL}/empleados`;
    }

    public async obtenerEmpleados(): Promise<IEmpleado[]> {
        try {
            const response = await axios.get<ApiResponse<IEmpleado[]>>(this.baseUrl);
            return response.data.data;
        } catch (error) {
            console.error('Error al obtener empleados:', error);
            throw error;
        }
    }

    public async obtenerEmpleadoPorId(id: number): Promise<IEmpleado> {
        try {
            const response = await axios.get<ApiResponse<IEmpleado>>(`${this.baseUrl}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error al obtener empleado ${id}:`, error);
            throw error;
        }
    }

    public async crearEmpleado(data: { 
        usuario: IUsuarioEmpleado; 
        empleado: Omit<IEmpleado, 'id_empleado' | 'idUsuario' | 'usuario' | 'tipoIdentificacion'> 
    }): Promise<IEmpleado> {
        try {
            const response = await axios.post<ApiResponse<IEmpleado>>(this.baseUrl, data);
            return response.data.data;
        } catch (error) {
            console.error('Error al crear empleado:', error);
            throw error;
        }
    }

    public async actualizarEmpleado(
        id: number,
        data: {
            usuario?: Partial<IUsuarioEmpleado>;
            empleado?: Partial<Omit<IEmpleado, 'id_empleado' | 'idUsuario' | 'usuario' | 'tipoIdentificacion'>>;
        }
    ): Promise<IEmpleado> {
        try {
            const response = await axios.put<ApiResponse<IEmpleado>>(`${this.baseUrl}/${id}`, data);
            return response.data.data;
        } catch (error) {
            console.error(`Error al actualizar empleado ${id}:`, error);
            throw error;
        }
    }

    public async desactivarEmpleado(id: number): Promise<void> {
        try {
            await axios.put(`${this.baseUrl}/${id}/desactivar`);
        } catch (error) {
            console.error(`Error al desactivar empleado ${id}:`, error);
            throw error;
        }
    }

    public async reactivarEmpleado(id: number): Promise<void> {
        try {
            await axios.put(`${this.baseUrl}/${id}/reactivar`);
        } catch (error) {
            console.error(`Error al reactivar empleado ${id}:`, error);
            throw error;
        }
    }

    public async cambiarPassword(
        id: number,
        passwords: { passwordActual: string; passwordNuevo: string; confirmarPassword: string }
    ): Promise<void> {
        try {
            await axios.put(`${this.baseUrl}/${id}/password`, passwords);
        } catch (error) {
            console.error(`Error al cambiar contraseña del empleado ${id}:`, error);
            throw error;
        }
    }
}

export const empleadoService = new EmpleadoService();
export default empleadoService;