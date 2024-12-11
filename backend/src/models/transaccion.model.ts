import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne, HasMany } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Usuario } from './usuario.model';
import { Cliente } from './cliente.model';
import { Vehiculo } from './vehiculo.model';
import { Credito } from './credito.model';
import { TipoTransaccion } from './catalogs/tipo-transaccion.model';
import { Venta } from './venta.model';
import { Documento } from './documento.model';

// Tipos de transacción
export type TipoTransaccionEnum = 'Venta' | 'Compra' | 'Pago Crédito' | 'Consignación' | 'Otro';

// Estados de transacción
export type EstadoTransaccion = 'Pendiente' | 'Completada' | 'Cancelada' | 'En Proceso';

@Table({
  tableName: 'transacciones',
  timestamps: false,
  schema: 'public',
  comment: 'Tabla particionada por fecha'
})
export class Transaccion extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_transaccion'
  })
  id!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    primaryKey: true,
    field: 'fecha',
    validate: {
      isDate: true,
      isAfter: '2020-01-01'
    }
  })
  fecha!: Date;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_usuario',
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  })
  idUsuario!: number;

  @ForeignKey(() => Cliente)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_cliente',
    references: {
      model: 'clientes',
      key: 'id_cliente'
    }
  })
  idCliente!: number;

  @ForeignKey(() => Vehiculo)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_vehiculo',
    references: {
      model: 'vehiculos',
      key: 'id_vehiculo'
    }
  })
  idVehiculo!: number;

  @ForeignKey(() => Credito)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'id_credito',
    references: {
      model: 'creditos',
      key: 'id_credito'
    }
  })
  idCredito?: number;

  @ForeignKey(() => TipoTransaccion)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_tipo_transaccion',
    references: {
      model: 'tipos_transaccion',
      key: 'id_tipo_transaccion'
    }
  })
  idTipoTransaccion!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'monto',
    validate: {
      min: 0
    }
  })
  monto!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'nombre_cliente'
  })
  nombreCliente?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'marca_vehiculo'
  })
  marcaVehiculo?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'modelo_vehiculo'
  })
  modeloVehiculo?: string;

  // Relaciones
  @BelongsTo(() => Usuario, { foreignKey: 'id_usuario', as: 'usuarioTransaccion' })
  usuario!: Usuario;

  @BelongsTo(() => Cliente, { foreignKey: 'id_cliente', as: 'cliente' })
  cliente!: Cliente;

  @BelongsTo(() => Vehiculo, { foreignKey: 'id_vehiculo', as: 'vehiculo' })
  vehiculo!: Vehiculo;

  @BelongsTo(() => Credito, { foreignKey: 'id_credito', as: 'credito' })
  credito?: Credito;

  @BelongsTo(() => TipoTransaccion, { foreignKey: 'id_tipo_transaccion', as: 'tipoTransaccion' })
  tipoTransaccion!: TipoTransaccion;

  @HasOne(() => Venta, { foreignKey: 'id_transaccion', as: 'venta' })
  venta?: Venta;

  @HasMany(() => Documento, { foreignKey: 'id_transaccion', as: 'documentos' })
  documentos?: Documento[];

  // Métodos útiles
  isPagoCredito(): boolean {
    return this.idTipoTransaccion === 3; // ID 3 para pagos de crédito
  }

  // Método para obtener el estado de la transacción
  async getEstadoTransaccion(): Promise<EstadoTransaccion> {
    const documentos = await this.$get('documentos');
    
    if (!documentos?.length) return 'Pendiente';
    
    const documentosRequeridos = ['Contrato', 'Factura'];
    const tieneDocumentosRequeridos = documentosRequeridos.every(tipo =>
      documentos.some(doc => doc.tipoDocumento === tipo && doc.estado === 'aprobado')
    );

    if (tieneDocumentosRequeridos) return 'Completada';
    if (documentos.some(doc => doc.estado === 'rechazado')) return 'Cancelada';
    return 'En Proceso';
  }

  // Método para obtener el resumen de la transacción
  async getResumenTransaccion(): Promise<{
    tipo: TipoTransaccionEnum;
    monto: number;
    fecha: Date;
    cliente: {
      id: number;
      nombre: string;
    };
    vehiculo: {
      id: number;
      marca: string;
      modelo: string;
    };
    credito?: {
      id: number;
      monto: number;
      estado: string;
    };
    documentos: {
      pendientes: number;
      aprobados: number;
      rechazados: number;
    };
    estado: EstadoTransaccion;
  }> {
    const [tipoTransaccion, documentos, estado] = await Promise.all([
      this.$get('tipoTransaccion'),
      this.$get('documentos'),
      this.getEstadoTransaccion()
    ]);

    const documentosEstado = {
      pendientes: documentos?.filter(d => d.estado === 'pendiente').length || 0,
      aprobados: documentos?.filter(d => d.estado === 'aprobado').length || 0,
      rechazados: documentos?.filter(d => d.estado === 'rechazado').length || 0
    };

    const resumen: any = {
      tipo: tipoTransaccion?.nombre as TipoTransaccionEnum,
      monto: this.monto,
      fecha: this.fecha,
      cliente: {
        id: this.idCliente,
        nombre: this.nombreCliente || ''
      },
      vehiculo: {
        id: this.idVehiculo,
        marca: this.marcaVehiculo || '',
        modelo: this.modeloVehiculo || ''
      },
      documentos: documentosEstado,
      estado
    };

    if (this.idCredito) {
      const credito = await this.$get('credito');
      resumen.credito = {
        id: this.idCredito,
        monto: credito?.cantidad || 0,
        estado: credito ? 'Activo' : 'Pendiente'
      };
    }

    return resumen;
  }

  // Método estático para obtener transacciones por período
  static async getTransaccionesPorPeriodo(options?: {
    startDate?: Date;
    endDate?: Date;
    tipo?: TipoTransaccionEnum;
    idCliente?: number;
    idVehiculo?: number;
  }): Promise<{
    transacciones: Transaccion[];
    totalTransacciones: number;
    montoTotal: number;
    promedioMonto: number;
    transaccionesPorTipo: { [key in TipoTransaccionEnum]?: number };
    transaccionesPorEstado: { [key in EstadoTransaccion]?: number };
  }> {
    const where: any = {};
    
    if (options?.startDate && options?.endDate) {
      where.fecha = {
        [Op.between]: [options.startDate, options.endDate]
      };
    }

    if (options?.tipo) {
      where['$tipoTransaccion.nombre$'] = options.tipo;
    }

    if (options?.idCliente) {
      where.id_cliente = options.idCliente;
    }

    if (options?.idVehiculo) {
      where.id_vehiculo = options.idVehiculo;
    }

    const transacciones = await this.findAll({
      where,
      include: [
        { model: TipoTransaccion, as: 'tipoTransaccion' },
        { model: Cliente, as: 'cliente' },
        { model: Vehiculo, as: 'vehiculo' },
        { model: Credito, as: 'credito' },
        { model: Documento, as: 'documentos' }
      ]
    });

    const transaccionesConEstado = await Promise.all(
      transacciones.map(async t => ({
        transaccion: t,
        estado: await t.getEstadoTransaccion()
      }))
    );

    const montoTotal = transacciones.reduce((sum, t) => sum + t.monto, 0);

    const transaccionesPorTipo = transacciones.reduce((acc, t) => {
      const tipo = t.tipoTransaccion?.nombre as TipoTransaccionEnum;
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {} as { [key in TipoTransaccionEnum]?: number });

    const transaccionesPorEstado = transaccionesConEstado.reduce((acc, { estado }) => {
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {} as { [key in EstadoTransaccion]?: number });

    return {
      transacciones,
      totalTransacciones: transacciones.length,
      montoTotal,
      promedioMonto: montoTotal / transacciones.length,
      transaccionesPorTipo,
      transaccionesPorEstado
    };
  }
}

export default Transaccion;