export enum RolUsuario {
  Administrador = 'Administrador',
  Ventas = 'Ventas',
  RRHH = 'RRHH',
  Gerente_general = 'Gerente_general',
  Capturista = 'Capturista'
}

export interface Usuario {
  id_empleado: number;
  nombre: string;
  tipo_identificacion: number;
  num_identificacion: string;
  fecha_nacimiento: string;
  telefono: string;
  correo: string;
  curp: string;
  domicilio: string;
  fecha_contratacion: string;
  id_rol: RolUsuario;
}

export interface LoginHistory {
  id_login_history: number;
  id_empleado: number;
  fecha_login: string;
  ip_address: string;
  user_agent: string;
  browser: string;
  device: string;
  country: string;
  city: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    usuario: Usuario;
    lastLogin?: LoginHistory;
  };
  message: string;
}

export interface LoginCredentials {
  employeeId?: string;
  correo?: string;
  password: string;
  ip_address?: string;
  user_agent?: string;
}

export interface TipoTransaccion {
  id: number;
  nombre: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}