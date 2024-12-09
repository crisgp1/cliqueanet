// Enumeraciones
export enum CategoriaMultimedia {
  Estado_cuenta = 'Estado_cuenta',
  Nomina = 'Nomina',
  Otro = 'Otro'
}

export enum TipoTransaccion {
  Venta = 'Venta',
  Apartado = 'Apartado',
  Credito = 'Credito',
  Traspaso = 'Traspaso',
  Cambio = 'Cambio'
}

export enum RolUsuario {
  Administrador = 1,
  Ventas = 2,
  RRHH = 3,
  Gerente_general = 4,
  Capturista = 5
}

// Interfaces para Login History
export interface LoginHistory {
  id_login_history: number;
  id_empleado: number;
  fecha_login: Date;
  ip_address: string;
  user_agent: string;
  browser: string;
  device: string;
  country: string;
  city: string;
}

export interface CreateLoginHistory extends Omit<LoginHistory, 'id_login_history'> {}

export interface LoginResponse {
  token: string;
  usuario: Omit<Usuario, 'password'>;
  lastLogin?: LoginHistory;
}

// Interfaces
export interface Usuario {
  id_empleado: number;
  nombre: string;
  id_tipo_identificacion: number;
  num_identificacion: string;
  fecha_nacimiento: Date;
  telefono: string;
  correo: string;
  curp: string;
  domicilio: string;
  fecha_contratacion: Date;
  id_rol: number;
  password: string;
}

export interface LoginCredentials {
  employeeId?: string;
  correo?: string;
  password: string;
  ip_address?: string;
  user_agent?: string;
}

export interface CreateUsuario {
  nombre: string;
  id_tipo_identificacion: number;
  num_identificacion: string;
  fecha_nacimiento: Date;
  telefono: string;
  correo: string;
  curp: string;
  domicilio: string;
  fecha_contratacion: Date;
  id_rol: number;
  password: string;
}

export interface UpdateUsuario {
  nombre?: string;
  id_tipo_identificacion?: number;
  num_identificacion?: string;
  fecha_nacimiento?: Date;
  telefono?: string;
  correo?: string;
  curp?: string;
  domicilio?: string;
  fecha_contratacion?: Date;
  id_rol?: number;
  password?: string;
}

export interface Cliente {
  id_cliente: number;
  nombre: string;
  id_tipo_identificacion: number;
  num_identificacion: string;
  fecha_nacimiento: Date;
  telefono: string;
  correo: string;
  domicilio: string;
  tenencia?: string;
}

export interface Vehiculo {
  id_vehiculo: number;
  marca: string;
  modelo: string;
  año: number;
  precio: number;
  num_serie: string;
  color: string;
  num_motor: string;
  num_factura?: string;
  placas?: string;
  tarjeta_circulacion?: string;
}

export interface Credito {
  id_credito: number;
  id_cliente: number;
}

export interface Multimedia {
  id_multimedia: number;
  id_credito: number;
  url: string;
  categoria: CategoriaMultimedia;
  mes?: number;
  año?: number;
}

export interface Transaccion {
  id_transaccion: number;
  fecha: Date;
  id_usuario: number;
  id_cliente: number;
  id_vehiculo: number;
  id_credito?: number;
  tipo_transaccion: TipoTransaccion;
}

export interface Nomina {
  id_nomina: number;
  id_empleado: number;
  fecha_pago: Date;
  salario_base: number;
  comisiones?: number;
  otras_percepciones?: number;
  deducciones?: number;
  total_pago: number;
}

export interface Venta {
  id_venta: number;
  id_transaccion: number;
}

export interface VentaEmpleado {
  id_venta: number;
  id_empleado: number;
  comision: number;
}

// Tipos para crear nuevos registros (sin IDs)
export type CreateCliente = Omit<Cliente, 'id_cliente'>;
export type CreateVehiculo = Omit<Vehiculo, 'id_vehiculo'>;
export type CreateCredito = Omit<Credito, 'id_credito'>;
export type CreateMultimedia = Omit<Multimedia, 'id_multimedia'>;
export type CreateTransaccion = Omit<Transaccion, 'id_transaccion'>;
export type CreateNomina = Omit<Nomina, 'id_nomina'>;
export type CreateVenta = Omit<Venta, 'id_venta'>;

// Tipos para actualizar registros (todos los campos opcionales excepto ID)
export type UpdateCliente = Partial<Omit<Cliente, 'id_cliente'>> & { id_cliente: number };
export type UpdateVehiculo = Partial<Omit<Vehiculo, 'id_vehiculo'>> & { id_vehiculo: number };
export type UpdateCredito = Partial<Omit<Credito, 'id_credito'>> & { id_credito: number };
export type UpdateMultimedia = Partial<Omit<Multimedia, 'id_multimedia'>> & { id_multimedia: number };
export type UpdateTransaccion = Partial<Omit<Transaccion, 'id_transaccion'>> & { id_transaccion: number };
export type UpdateNomina = Partial<Omit<Nomina, 'id_nomina'>> & { id_nomina: number };
export type UpdateVenta = Partial<Omit<Venta, 'id_venta'>> & { id_venta: number };