const API_URL = 'http://localhost:3001';

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
    id_usuario?: number;
    id_tipo_identificacion: number;
    nombre: string;
    num_identificacion: string;
    fecha_nacimiento: Date;
    telefono: string;
    curp: string;
    domicilio: string;
    fecha_contratacion: Date;
    num_empleado?: string;
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

    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token || ''}`,
            'Content-Type': 'application/json'
        };
    }

    public async obtenerEmpleados(): Promise<IEmpleado[]> {
        try {
            const response = await fetch(this.baseUrl, {
                headers: this.getAuthHeaders()
            });
            await this.handleResponseErrors(response);
            const result: ApiResponse<IEmpleado[]> = await response.json();
            return result.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async obtenerEmpleadoPorId(id: number): Promise<IEmpleado> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                headers: this.getAuthHeaders()
            });
            await this.handleResponseErrors(response);
            const result: ApiResponse<IEmpleado> = await response.json();
            return result.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async crearEmpleado(data: { 
        usuario: IUsuarioEmpleado; 
        empleado: Omit<IEmpleado, 'id_empleado' | 'id_usuario' | 'usuario' | 'tipoIdentificacion'> 
    }): Promise<IEmpleado> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(data)
            });
            await this.handleResponseErrors(response);
            const result: ApiResponse<IEmpleado> = await response.json();
            return result.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async actualizarEmpleado(
        id: number,
        data: {
            usuario?: Partial<IUsuarioEmpleado>;
            empleado?: Partial<Omit<IEmpleado, 'id_empleado' | 'id_usuario' | 'usuario' | 'tipoIdentificacion'>>;
        }
    ): Promise<IEmpleado> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(data)
            });
            await this.handleResponseErrors(response);
            const result: ApiResponse<IEmpleado> = await response.json();
            return result.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async desactivarEmpleado(id: number): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}/desactivar`, {
                method: 'PUT',
                headers: this.getAuthHeaders()
            });
            await this.handleResponseErrors(response);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async reactivarEmpleado(id: number): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}/reactivar`, {
                method: 'PUT',
                headers: this.getAuthHeaders()
            });
            await this.handleResponseErrors(response);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async cambiarPassword(
        id: number,
        passwords: { passwordActual: string; passwordNuevo: string; confirmarPassword: string }
    ): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}/password`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(passwords)
            });
            await this.handleResponseErrors(response);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    private async handleResponseErrors(response: Response) {
        if (!response.ok) {
            let errorMessage = 'Error en la solicitud del empleado';
            try {
                const errorData = await response.json();
                if (errorData && errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch {
                // Si no se puede parsear JSON, dejamos el mensaje por defecto
            }
            throw new Error(errorMessage);
        }
    }

    private handleError(error: any): Error {
        if (error instanceof Error) {
            return error;
        }
        return new Error('Error desconocido al procesar la solicitud del empleado');
    }
}

export const empleadoService = EmpleadoService.getInstance();