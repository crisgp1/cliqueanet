import { Table, Column, Model, DataType, HasMany, Sequelize } from 'sequelize-typescript';
import { Op, QueryTypes } from 'sequelize';
import { Usuario } from '../usuario.model';
import { Cliente } from '../cliente.model';

// Tipo para los IDs de identificación
export type TipoIdentificacionId = 1 | 2 | 3 | 4 | 5 | 6;

// Tipos de identificación
export type TipoIdentificacionNombre = 
  'INE/IFE' | 
  'Pasaporte' | 
  'Cédula Profesional' | 
  'Licencia de Conducir' | 
  'Cartilla Militar' |
  'Otro';

// Constantes para los tipos de identificación
export const TIPOS_IDENTIFICACION = {
  INE: 1 as TipoIdentificacionId,
  PASAPORTE: 2 as TipoIdentificacionId,
  CEDULA: 3 as TipoIdentificacionId,
  LICENCIA: 4 as TipoIdentificacionId,
  CARTILLA: 5 as TipoIdentificacionId,
  OTRO: 6 as TipoIdentificacionId
} as const;

// Descripciones y reglas por tipo
export const REGLAS_IDENTIFICACION = {
  [TIPOS_IDENTIFICACION.INE]: {
    nombre: 'INE/IFE',
    descripcion: 'Credencial para votar emitida por el INE',
    formatoNumero: /^[A-Z]{6}[0-9]{8}[A-Z][0-9]{3}$/,
    vigenciaAnios: 10,
    requiereImagen: true
  },
  [TIPOS_IDENTIFICACION.PASAPORTE]: {
    nombre: 'Pasaporte',
    descripcion: 'Pasaporte mexicano vigente',
    formatoNumero: /^[A-Z][0-9]{8}$/,
    vigenciaAnios: 10,
    requiereImagen: true
  },
  [TIPOS_IDENTIFICACION.CEDULA]: {
    nombre: 'Cédula Profesional',
    descripcion: 'Cédula profesional emitida por la SEP',
    formatoNumero: /^[0-9]{7,8}$/,
    vigenciaAnios: null, // No expira
    requiereImagen: true
  },
  [TIPOS_IDENTIFICACION.LICENCIA]: {
    nombre: 'Licencia de Conducir',
    descripcion: 'Licencia de conducir vigente',
    formatoNumero: /^[A-Z0-9]{10,13}$/,
    vigenciaAnios: 3,
    requiereImagen: true
  },
  [TIPOS_IDENTIFICACION.CARTILLA]: {
    nombre: 'Cartilla Militar',
    descripcion: 'Cartilla del Servicio Militar Nacional',
    formatoNumero: /^[A-Z][0-9]{8}$/,
    vigenciaAnios: null, // No expira
    requiereImagen: true
  },
  [TIPOS_IDENTIFICACION.OTRO]: {
    nombre: 'Otro',
    descripcion: 'Otro tipo de identificación oficial',
    formatoNumero: null,
    vigenciaAnios: null,
    requiereImagen: true
  }
} as const;

@Table({
  tableName: 'tipos_identificacion',
  timestamps: false
})
export class TipoIdentificacion extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_tipo_identificacion'
  })
  id!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      isIn: [Object.values(REGLAS_IDENTIFICACION).map(r => r.nombre)]
    }
  })
  nombre!: TipoIdentificacionNombre;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  descripcion?: string;

  // Relaciones
  @HasMany(() => Usuario, {
    foreignKey: 'id_tipo_identificacion',
    as: 'usuarios'
  })
  usuarios?: Usuario[];

  @HasMany(() => Cliente, {
    foreignKey: 'id_tipo_identificacion',
    as: 'clientes'
  })
  clientes?: Cliente[];

  // Métodos útiles
  static getNombreTipo(idTipo: TipoIdentificacionId): string {
    return REGLAS_IDENTIFICACION[idTipo]?.nombre || 'Desconocido';
  }

  static getReglas(idTipo: TipoIdentificacionId) {
    return REGLAS_IDENTIFICACION[idTipo];
  }

  // Método para validar el formato del número de identificación
  static validarFormato(idTipo: TipoIdentificacionId, numero: string): boolean {
    const reglas = REGLAS_IDENTIFICACION[idTipo];
    if (!reglas || !reglas.formatoNumero) return true; // Si no hay formato definido, se considera válido
    return reglas.formatoNumero.test(numero);
  }

  // Método para verificar vigencia
  static estaVigente(idTipo: TipoIdentificacionId, fechaEmision: Date): boolean {
    const reglas = REGLAS_IDENTIFICACION[idTipo];
    if (!reglas || !reglas.vigenciaAnios) return true; // Si no hay vigencia definida, se considera vigente
    
    const fechaVencimiento = new Date(fechaEmision);
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + reglas.vigenciaAnios);
    return fechaVencimiento > new Date();
  }

  // Método para obtener estadísticas de uso
  static async getEstadisticasUso(options?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalPorTipo: Record<TipoIdentificacionId, number>;
    porcentajes: Record<TipoIdentificacionId, number>;
    masUsados: Array<{ id: TipoIdentificacionId; cantidad: number }>;
    distribucionClientes: Record<TipoIdentificacionId, number>;
    distribucionUsuarios: Record<TipoIdentificacionId, number>;
  }> {
    const sequelize = new Sequelize('');
    const where: any = {};
    
    if (options?.startDate && options?.endDate) {
      where.created_at = {
        [Op.between]: [options.startDate, options.endDate]
      };
    }

    // Obtener estadísticas de clientes
    const clientesQuery = `
      SELECT id_tipo_identificacion, COUNT(*) as cantidad
      FROM clientes
      ${where.created_at ? 'WHERE created_at BETWEEN :startDate AND :endDate' : ''}
      GROUP BY id_tipo_identificacion
    `;

    const usuariosQuery = `
      SELECT id_tipo_identificacion, COUNT(*) as cantidad
      FROM usuarios
      ${where.created_at ? 'WHERE created_at BETWEEN :startDate AND :endDate' : ''}
      GROUP BY id_tipo_identificacion
    `;

    const [clientes, usuarios] = await Promise.all([
      sequelize.query(clientesQuery, {
        replacements: where.created_at ? {
          startDate: options?.startDate,
          endDate: options?.endDate
        } : undefined,
        type: QueryTypes.SELECT
      }) as Promise<Array<{ id_tipo_identificacion: number; cantidad: string }>>,
      sequelize.query(usuariosQuery, {
        replacements: where.created_at ? {
          startDate: options?.startDate,
          endDate: options?.endDate
        } : undefined,
        type: QueryTypes.SELECT
      }) as Promise<Array<{ id_tipo_identificacion: number; cantidad: string }>>
    ]);

    const totalPorTipo = {} as Record<TipoIdentificacionId, number>;
    const distribucionClientes = {} as Record<TipoIdentificacionId, number>;
    const distribucionUsuarios = {} as Record<TipoIdentificacionId, number>;
    let total = 0;

    // Procesar estadísticas de clientes
    clientes.forEach(c => {
      const idTipo = c.id_tipo_identificacion as TipoIdentificacionId;
      const cantidad = parseInt(c.cantidad);
      distribucionClientes[idTipo] = cantidad;
      totalPorTipo[idTipo] = (totalPorTipo[idTipo] || 0) + cantidad;
      total += cantidad;
    });

    // Procesar estadísticas de usuarios
    usuarios.forEach(u => {
      const idTipo = u.id_tipo_identificacion as TipoIdentificacionId;
      const cantidad = parseInt(u.cantidad);
      distribucionUsuarios[idTipo] = cantidad;
      totalPorTipo[idTipo] = (totalPorTipo[idTipo] || 0) + cantidad;
      total += cantidad;
    });

    // Calcular porcentajes
    const porcentajes = {} as Record<TipoIdentificacionId, number>;
    Object.entries(totalPorTipo).forEach(([tipo, cantidad]) => {
      const tipoId = parseInt(tipo) as TipoIdentificacionId;
      porcentajes[tipoId] = (cantidad / total) * 100;
    });

    // Ordenar por más usados
    const masUsados = Object.entries(totalPorTipo)
      .map(([id, cantidad]) => ({
        id: parseInt(id) as TipoIdentificacionId,
        cantidad
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    return {
      totalPorTipo,
      porcentajes,
      masUsados,
      distribucionClientes,
      distribucionUsuarios
    };
  }
}

export default TipoIdentificacion;