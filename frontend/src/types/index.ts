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

export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    usuario: Usuario;
  };
  message: string;
}

export interface LoginCredentials {
  employeeId?: string;
  correo?: string;
  password: string;
}