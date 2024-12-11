import { Table, Column, Model, DataType, HasMany, Sequelize } from 'sequelize-typescript';
import { Op, QueryTypes } from 'sequelize';
import { Transaccion } from '../transaccion.model';

// Tipo para los IDs de transacción
export type TipoTransaccionId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// Tipo para roles
export type RolUsuario = 'Administrador' | 'Ventas' | 'Finanzas';

// Constantes para los tipos de transacciones
export const TIPOS_TRANSACCION = {
  VENTA: 1 as TipoTransaccionId,
  APARTADO: 2 as TipoTransaccionId,
  PAGO_CREDITO: 3 as TipoTransaccionId,
  TRASPASO: 4 as TipoTransaccionId,
  CAMBIO: 5 as TipoTransaccionId,
  CONSIGNACION: 6 as TipoTransaccionId,
  DEVOLUCION: 7 as TipoTransaccionId,
  CANCELACION: 8 as TipoTransaccionId
} as const;

// Descripciones de los tipos de transacción
export const DESCRIPCIONES_TIPO = {
  1: 'Venta directa de vehículo',
  2: 'Apartado de vehículo con anticipo',
  3: 'Pago de crédito automotriz',
  4: 'Traspaso de propiedad del vehículo',
  5: 'Cambio o permuta de vehículos',
  6: 'Consignación de vehículo',
  7: 'Devolución de vehículo',
  8: 'Cancelación de transacción'
} satisfies Record<TipoTransaccionId, string>;

// Grupos de tipos relacionados
export const GRUPOS_TIPO: Record<string, TipoTransaccionId[]> = {
  VENTAS: [TIPOS_TRANSACCION.VENTA, TIPOS_TRANSACCION.APARTADO],
  CREDITOS: [TIPOS_TRANSACCION.PAGO_CREDITO],
  CAMBIOS: [TIPOS_TRANSACCION.TRASPASO, TIPOS_TRANSACCION.CAMBIO],
  CONSIGNACIONES: [TIPOS_TRANSACCION.CONSIGNACION],
  CANCELACIONES: [TIPOS_TRANSACCION.DEVOLUCION, TIPOS_TRANSACCION.CANCELACION]
};

// Roles que pueden realizar cada tipo de transacción
export const PERMISOS_TIPO = {
  1: ['Administrador', 'Ventas'] as RolUsuario[],
  2: ['Administrador', 'Ventas'] as RolUsuario[],
  3: ['Administrador', 'Finanzas'] as RolUsuario[],
  4: ['Administrador'] as RolUsuario[],
  5: ['Administrador', 'Ventas'] as RolUsuario[],
  6: ['Administrador', 'Ventas'] as RolUsuario[],
  7: ['Administrador'] as RolUsuario[],
  8: ['Administrador'] as RolUsuario[]
} satisfies Record<TipoTransaccionId, RolUsuario[]>;

@Table({
  tableName: 'tipos_transaccion',
  timestamps: false
})
export class TipoTransaccion extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_tipo_transaccion'
  })
  id!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      isIn: [Object.values(DESCRIPCIONES_TIPO)]
    }
  })
  nombre!: string;

  // Relaciones
  @HasMany(() => Transaccion, {
    foreignKey: 'id_tipo_transaccion',
    as: 'transacciones'
  })
  transacciones?: Transaccion[];

  // Métodos de validación
  static isPagoCredito(idTipo: number): boolean {
    return idTipo === TIPOS_TRANSACCION.PAGO_CREDITO;
  }

  static isVenta(idTipo: number): boolean {
    return idTipo === TIPOS_TRANSACCION.VENTA;
  }

  static isApartado(idTipo: number): boolean {
    return idTipo === TIPOS_TRANSACCION.APARTADO;
  }

  static isTraspaso(idTipo: number): boolean {
    return idTipo === TIPOS_TRANSACCION.TRASPASO;
  }

  static isCambio(idTipo: number): boolean {
    return idTipo === TIPOS_TRANSACCION.CAMBIO;
  }

  static isConsignacion(idTipo: number): boolean {
    return idTipo === TIPOS_TRANSACCION.CONSIGNACION;
  }

  static isDevolucion(idTipo: number): boolean {
    return idTipo === TIPOS_TRANSACCION.DEVOLUCION;
  }

  static isCancelacion(idTipo: number): boolean {
    return idTipo === TIPOS_TRANSACCION.CANCELACION;
  }

  // Método para obtener el nombre del tipo
  static getNombreTipo(idTipo: TipoTransaccionId): string {
    return DESCRIPCIONES_TIPO[idTipo] || 'Desconocido';
  }

  // Método para validar si un ID de tipo es válido
  static isValidTipo(idTipo: number): idTipo is TipoTransaccionId {
    return Object.values(TIPOS_TRANSACCION).includes(idTipo as TipoTransaccionId);
  }

  // Método para convertir un número a TipoTransaccionId
  static toTipoTransaccionId(idTipo: number): TipoTransaccionId | null {
    return this.isValidTipo(idTipo) ? idTipo : null;
  }

  // Método para verificar permisos
  static tienePermiso(idTipo: TipoTransaccionId, rol: RolUsuario): boolean {
    return PERMISOS_TIPO[idTipo]?.includes(rol) || false;
  }

  // Método para obtener tipos relacionados
  static getTiposRelacionados(idTipo: TipoTransaccionId): TipoTransaccionId[] {
    const grupoEncontrado = Object.values(GRUPOS_TIPO).find(grupo => 
      grupo.includes(idTipo)
    );
    return grupoEncontrado ? [...grupoEncontrado] : [];
  }

  // Método para obtener estadísticas de uso
  static async getEstadisticasUso(options?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalPorTipo: Record<TipoTransaccionId, number>;
    porcentajes: Record<TipoTransaccionId, number>;
    tendencias: Record<TipoTransaccionId, 'aumento' | 'disminución' | 'estable'>;
    tiposMasUsados: Array<{ id: TipoTransaccionId; cantidad: number }>;
  }> {
    const sequelize = new Sequelize('');
    const where: any = {};
    
    if (options?.startDate && options?.endDate) {
      where.fecha = {
        [Op.between]: [options.startDate, options.endDate]
      };
    }

    const query = `
      SELECT id_tipo_transaccion, COUNT(*) as cantidad
      FROM transacciones
      ${where.fecha ? `WHERE fecha BETWEEN :startDate AND :endDate` : ''}
      GROUP BY id_tipo_transaccion
    `;

    const transacciones = await sequelize.query(query, {
      replacements: where.fecha ? {
        startDate: options?.startDate,
        endDate: options?.endDate
      } : undefined,
      type: QueryTypes.SELECT
    }) as Array<{ id_tipo_transaccion: number; cantidad: string }>;

    const totalPorTipo = {} as Record<TipoTransaccionId, number>;
    let total = 0;

    transacciones.forEach(t => {
      if (this.isValidTipo(t.id_tipo_transaccion)) {
        const cantidad = parseInt(t.cantidad);
        totalPorTipo[t.id_tipo_transaccion] = cantidad;
        total += cantidad;
      }
    });

    const porcentajes = {} as Record<TipoTransaccionId, number>;
    Object.entries(totalPorTipo).forEach(([tipo, cantidad]) => {
      const tipoId = parseInt(tipo) as TipoTransaccionId;
      if (this.isValidTipo(tipoId)) {
        porcentajes[tipoId] = (cantidad / total) * 100;
      }
    });

    // Calcular tendencias
    const tendencias = {} as Record<TipoTransaccionId, 'aumento' | 'disminución' | 'estable'>;
    if (options?.startDate && options?.endDate) {
      const mitad = new Date((options.startDate.getTime() + options.endDate.getTime()) / 2);
      
      const [primerasMitad, segundasMitad] = await Promise.all([
        sequelize.query(
          `SELECT id_tipo_transaccion, COUNT(*) as cantidad
           FROM transacciones
           WHERE fecha < :fecha
           GROUP BY id_tipo_transaccion`,
          {
            replacements: { fecha: mitad },
            type: QueryTypes.SELECT
          }
        ) as Promise<Array<{ id_tipo_transaccion: number; cantidad: string }>>,
        sequelize.query(
          `SELECT id_tipo_transaccion, COUNT(*) as cantidad
           FROM transacciones
           WHERE fecha >= :fecha
           GROUP BY id_tipo_transaccion`,
          {
            replacements: { fecha: mitad },
            type: QueryTypes.SELECT
          }
        ) as Promise<Array<{ id_tipo_transaccion: number; cantidad: string }>>
      ]);

      const cantidadesPrimeras = {} as Record<TipoTransaccionId, number>;
      const cantidadesSegundas = {} as Record<TipoTransaccionId, number>;

      primerasMitad.forEach(t => {
        if (this.isValidTipo(t.id_tipo_transaccion)) {
          cantidadesPrimeras[t.id_tipo_transaccion] = parseInt(t.cantidad);
        }
      });

      segundasMitad.forEach(t => {
        if (this.isValidTipo(t.id_tipo_transaccion)) {
          cantidadesSegundas[t.id_tipo_transaccion] = parseInt(t.cantidad);
        }
      });

      Object.keys(totalPorTipo).forEach(tipo => {
        const tipoId = parseInt(tipo) as TipoTransaccionId;
        if (this.isValidTipo(tipoId)) {
          const primera = cantidadesPrimeras[tipoId] || 0;
          const segunda = cantidadesSegundas[tipoId] || 0;
          const diferencia = segunda - primera;

          if (diferencia > primera * 0.1) tendencias[tipoId] = 'aumento';
          else if (diferencia < -primera * 0.1) tendencias[tipoId] = 'disminución';
          else tendencias[tipoId] = 'estable';
        }
      });
    }

    const tiposMasUsados = Object.entries(totalPorTipo)
      .map(([id, cantidad]) => {
        const tipoId = parseInt(id) as TipoTransaccionId;
        return this.isValidTipo(tipoId) ? { 
          id: tipoId, 
          cantidad 
        } : null;
      })
      .filter((item): item is { id: TipoTransaccionId; cantidad: number } => item !== null)
      .sort((a, b) => b.cantidad - a.cantidad);

    return {
      totalPorTipo,
      porcentajes,
      tendencias,
      tiposMasUsados
    };
  }
}

export default TipoTransaccion;