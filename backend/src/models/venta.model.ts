import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BelongsToMany, HasMany } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Transaccion } from './transaccion.model';
import { Empleado } from './empleado.model';
import { VentaEmpleado } from './venta-empleado.model';
import { Documento } from './documento.model';

// Estados de venta
export type EstadoVenta = 'Pendiente' | 'Completada' | 'Cancelada' | 'En Proceso';

@Table({
  tableName: 'ventas',
  timestamps: false
})
export class Venta extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_venta'
  })
  id!: number;

  @ForeignKey(() => Transaccion)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_transaccion',
    references: {
      model: 'transacciones',
      key: 'id_transaccion'
    }
  })
  idTransaccion!: number;

  // Relaciones
  @BelongsTo(() => Transaccion, {
    foreignKey: 'id_transaccion',
    as: 'transaccion'
  })
  transaccion?: Transaccion;

  @BelongsToMany(() => Empleado, {
    through: () => VentaEmpleado,
    foreignKey: 'id_venta',
    otherKey: 'id_empleado',
    as: 'empleados'
  })
  empleados?: Empleado[];

  @HasMany(() => VentaEmpleado, {
    foreignKey: 'id_venta',
    as: 'ventaEmpleados'
  })
  ventaEmpleados?: VentaEmpleado[];

  @HasMany(() => Documento, {
    foreignKey: 'id_transaccion',
    as: 'documentos'
  })
  documentos?: Documento[];

  // Métodos útiles
  async getTotalComisiones(): Promise<number> {
    const ventaEmpleados = await this.$get('ventaEmpleados');
    return ventaEmpleados?.reduce((total, ve) => total + (ve.comision || 0), 0) || 0;
  }

  async getMontoVenta(): Promise<number> {
    const transaccion = await this.$get('transaccion', {
      include: [{ model: Documento, as: 'documentos' }]
    });
    return transaccion?.monto || 0;
  }

  // Método para obtener el estado de la venta
  async getEstadoVenta(): Promise<EstadoVenta> {
    const transaccion = await this.$get('transaccion');
    const documentos = await this.$get('documentos');
    
    if (!transaccion) return 'Pendiente';
    
    const documentosRequeridos = ['Contrato', 'Factura'];
    const tieneDocumentosRequeridos = documentosRequeridos.every(tipo =>
      documentos?.some(doc => doc.tipoDocumento === tipo && doc.estado === 'aprobado')
    );

    if (tieneDocumentosRequeridos) return 'Completada';
    if (documentos?.some(doc => doc.estado === 'rechazado')) return 'Cancelada';
    return 'En Proceso';
  }

  // Método para obtener el resumen de la venta
  async getResumenVenta(): Promise<{
    montoVenta: number;
    totalComisiones: number;
    porcentajeComisiones: number;
    empleadosParticipantes: number;
    documentosEstado: {
      pendientes: number;
      aprobados: number;
      rechazados: number;
    };
    estado: EstadoVenta;
  }> {
    const [montoVenta, totalComisiones, documentos, estado] = await Promise.all([
      this.getMontoVenta(),
      this.getTotalComisiones(),
      this.$get('documentos'),
      this.getEstadoVenta()
    ]);

    const documentosEstado = {
      pendientes: documentos?.filter(d => d.estado === 'pendiente').length || 0,
      aprobados: documentos?.filter(d => d.estado === 'aprobado').length || 0,
      rechazados: documentos?.filter(d => d.estado === 'rechazado').length || 0
    };

    const ventaEmpleados = await this.$get('ventaEmpleados');

    return {
      montoVenta,
      totalComisiones,
      porcentajeComisiones: montoVenta ? (totalComisiones / montoVenta) * 100 : 0,
      empleadosParticipantes: ventaEmpleados?.length || 0,
      documentosEstado,
      estado
    };
  }

  // Método estático para obtener ventas por período
  static async getVentasPorPeriodo(options?: {
    startDate?: Date;
    endDate?: Date;
    estado?: EstadoVenta;
  }): Promise<{
    ventas: Venta[];
    totalVentas: number;
    montoTotal: number;
    comisionesTotal: number;
    promedioComisiones: number;
    ventasPorEstado: { [key in EstadoVenta]?: number };
  }> {
    const where: any = {};
    
    if (options?.startDate && options?.endDate) {
      where['$transaccion.fecha$'] = {
        [Op.between]: [options.startDate, options.endDate]
      };
    }

    const ventas = await this.findAll({
      where,
      include: [
        {
          model: Transaccion,
          as: 'transaccion',
          required: true
        },
        {
          model: VentaEmpleado,
          as: 'ventaEmpleados'
        },
        {
          model: Documento,
          as: 'documentos'
        }
      ]
    });

    const ventasConEstado = await Promise.all(
      ventas.map(async venta => ({
        venta,
        estado: await venta.getEstadoVenta()
      }))
    );

    const ventasFiltradas = options?.estado
      ? ventasConEstado.filter(v => v.estado === options.estado).map(v => v.venta)
      : ventas;

    const montoTotal = await ventasFiltradas.reduce(
      async (promise, venta) => (await promise) + await venta.getMontoVenta(),
      Promise.resolve(0)
    );

    const comisionesTotal = await ventasFiltradas.reduce(
      async (promise, venta) => (await promise) + await venta.getTotalComisiones(),
      Promise.resolve(0)
    );

    const ventasPorEstado = ventasConEstado.reduce((acc, { estado }) => {
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {} as { [key in EstadoVenta]?: number });

    return {
      ventas: ventasFiltradas,
      totalVentas: ventasFiltradas.length,
      montoTotal,
      comisionesTotal,
      promedioComisiones: ventasFiltradas.length ? comisionesTotal / ventasFiltradas.length : 0,
      ventasPorEstado
    };
  }
}

export default Venta;