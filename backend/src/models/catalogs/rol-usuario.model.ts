import { Table, Column, Model, DataType, HasMany, Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Usuario } from '../usuario.model';

// Tipo para los IDs de rol
export type RolUsuarioId = 1 | 2 | 3 | 4 | 5;

// Tipos de roles
export type RolUsuarioNombre = 
  'Administrador' | 
  'Gerente' | 
  'Ventas' | 
  'Finanzas' | 
  'Capturista';

// Tipo para permisos
export type Permiso = string;

// Constantes para los roles
export const ROLES_USUARIO = {
  ADMIN: 1 as RolUsuarioId,
  GERENTE: 2 as RolUsuarioId,
  VENTAS: 3 as RolUsuarioId,
  FINANZAS: 4 as RolUsuarioId,
  CAPTURISTA: 5 as RolUsuarioId
} as const;

// Tipo para la configuración de un rol
type RolConfig = {
  nombre: RolUsuarioNombre;
  descripcion: string;
  nivel: number;
  permisos: Permiso[];
  puedeCrearUsuarios: boolean;
  puedeEliminarRegistros: boolean;
  accesoTotal: boolean;
};

// Descripciones y permisos por rol
const permisosRolConfig: Record<RolUsuarioId, RolConfig> = {
  1: {
    nombre: 'Administrador',
    descripcion: 'Control total del sistema',
    nivel: 1,
    permisos: ['*'],
    puedeCrearUsuarios: true,
    puedeEliminarRegistros: true,
    accesoTotal: true
  },
  2: {
    nombre: 'Gerente',
    descripcion: 'Gestión general y reportes',
    nivel: 2,
    permisos: [
      'ver_reportes',
      'gestionar_empleados',
      'gestionar_inventario',
      'gestionar_ventas',
      'gestionar_creditos',
      'gestionar_consignaciones'
    ],
    puedeCrearUsuarios: true,
    puedeEliminarRegistros: false,
    accesoTotal: false
  },
  3: {
    nombre: 'Ventas',
    descripcion: 'Gestión de ventas y clientes',
    nivel: 3,
    permisos: [
      'gestionar_ventas',
      'gestionar_clientes',
      'ver_inventario',
      'crear_citas'
    ],
    puedeCrearUsuarios: false,
    puedeEliminarRegistros: false,
    accesoTotal: false
  },
  4: {
    nombre: 'Finanzas',
    descripcion: 'Gestión financiera y créditos',
    nivel: 3,
    permisos: [
      'gestionar_creditos',
      'ver_reportes_financieros',
      'gestionar_pagos',
      'ver_ventas'
    ],
    puedeCrearUsuarios: false,
    puedeEliminarRegistros: false,
    accesoTotal: false
  },
  5: {
    nombre: 'Capturista',
    descripcion: 'Captura de información básica',
    nivel: 4,
    permisos: [
      'capturar_datos',
      'ver_inventario',
      'crear_citas'
    ],
    puedeCrearUsuarios: false,
    puedeEliminarRegistros: false,
    accesoTotal: false
  }
};

export const PERMISOS_ROL = permisosRolConfig;

// Jerarquía de roles para herencia de permisos
const jerarquiaRolesConfig: Record<RolUsuarioId, RolUsuarioId[]> = {
  1: [],
  2: [1],
  3: [2],
  4: [2],
  5: [3, 4]
};

export const JERARQUIA_ROLES = jerarquiaRolesConfig;

@Table({
  tableName: 'roles_usuario',
  timestamps: false
})
export class RolUsuario extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_rol'
  })
  id!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      isIn: [Object.values(PERMISOS_ROL).map(r => r.nombre)]
    }
  })
  nombre!: RolUsuarioNombre;

  // Relaciones
  @HasMany(() => Usuario, {
    foreignKey: 'id_rol',
    as: 'usuarios'
  })
  usuarios?: Usuario[];

  // Métodos útiles
  static getNombreRol(idRol: RolUsuarioId): string {
    return PERMISOS_ROL[idRol]?.nombre || 'Desconocido';
  }

  static getPermisos(idRol: RolUsuarioId): Permiso[] {
    return [...(PERMISOS_ROL[idRol]?.permisos || [])];
  }

  // Método para verificar si un rol tiene un permiso específico
  static tienePermiso(idRol: RolUsuarioId, permiso: Permiso): boolean {
    const permisos = PERMISOS_ROL[idRol]?.permisos;
    if (!permisos) return false;
    if (permisos.includes('*')) return true;
    return permisos.includes(permiso);
  }

  // Método para verificar si un rol puede supervisar a otro
  static puedeSupervizar(rolSupervisor: RolUsuarioId, rolSubordinado: RolUsuarioId): boolean {
    const nivelSupervisor = PERMISOS_ROL[rolSupervisor]?.nivel;
    const nivelSubordinado = PERMISOS_ROL[rolSubordinado]?.nivel;
    if (!nivelSupervisor || !nivelSubordinado) return false;
    return nivelSupervisor < nivelSubordinado;
  }

  // Método para obtener todos los permisos heredados
  static getPermisosHeredados(idRol: RolUsuarioId): Permiso[] {
    const permisosSet = new Set<Permiso>();
    const rolesHeredados = JERARQUIA_ROLES[idRol] || [];

    // Agregar permisos propios
    const permisosRol = PERMISOS_ROL[idRol]?.permisos || [];
    permisosRol.forEach(p => permisosSet.add(p));

    // Agregar permisos heredados
    rolesHeredados.forEach(rolHeredado => {
      const permisosHeredados = PERMISOS_ROL[rolHeredado]?.permisos || [];
      permisosHeredados.forEach(p => permisosSet.add(p));
    });

    return Array.from(permisosSet);
  }

  // Método para obtener estadísticas de uso
  static async getEstadisticasUso(): Promise<{
    usuariosPorRol: Record<RolUsuarioId, number>;
    porcentajes: Record<RolUsuarioId, number>;
    distribucionNiveles: Record<number, number>;
    rolesActivos: RolUsuarioId[];
  }> {
    const sequelize = new Sequelize('');
    const query = `
      SELECT id_rol, COUNT(*) as cantidad
      FROM usuarios
      GROUP BY id_rol
    `;

    const usuarios = await sequelize.query(query, {
      type: 'SELECT'
    }) as Array<{ id_rol: number; cantidad: string }>;

    const usuariosPorRol = {} as Record<RolUsuarioId, number>;
    const distribucionNiveles = {} as Record<number, number>;
    let total = 0;

    usuarios.forEach(u => {
      const idRol = u.id_rol as RolUsuarioId;
      const cantidad = parseInt(u.cantidad);
      usuariosPorRol[idRol] = cantidad;
      total += cantidad;

      const nivel = PERMISOS_ROL[idRol]?.nivel;
      if (nivel) {
        distribucionNiveles[nivel] = (distribucionNiveles[nivel] || 0) + cantidad;
      }
    });

    const porcentajes = {} as Record<RolUsuarioId, number>;
    Object.entries(usuariosPorRol).forEach(([rol, cantidad]) => {
      const rolId = parseInt(rol) as RolUsuarioId;
      porcentajes[rolId] = (cantidad / total) * 100;
    });

    const rolesActivos = Object.keys(usuariosPorRol)
      .map(r => parseInt(r) as RolUsuarioId)
      .sort((a, b) => usuariosPorRol[b] - usuariosPorRol[a]);

    return {
      usuariosPorRol,
      porcentajes,
      distribucionNiveles,
      rolesActivos
    };
  }
}

export default RolUsuario;