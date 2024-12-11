import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Vehiculo } from './vehiculo.model';
import { Contacto } from './contacto.model';
import { GastoConsignacion } from './gasto-consignacion.model';

// Tipos de origen del vehículo
export type OrigenVehiculoTipo = 'Particular' | 'Agencia' | 'Lote' | 'Otro';

// Interfaces para los tipos de datos
interface GastoPorTipo {
  [concepto: string]: number;
}

interface DistribucionGastos {
  totalGastos: number;
  gastosPorTipo: GastoPorTipo;
  porcentajeConsignatario: number;
  porcentajeAgencia: number;
}

@Table({
  tableName: 'consignaciones',
  timestamps: false
})
export class Consignacion extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_consignacion'
  })
  id!: number;

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

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'nombre_consignatario'
  })
  nombreConsignatario!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'apellidos_consignatario'
  })
  apellidosConsignatario!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'correo_consignatario'
  })
  correoConsignatario!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    field: 'telefono_consignatario'
  })
  telefonoConsignatario!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'origen_vehiculo_tipo',
    validate: {
      isIn: [['Particular', 'Agencia', 'Lote', 'Otro']]
    }
  })
  origenVehiculoTipo?: OrigenVehiculoTipo;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'origen_vehiculo_nombre'
  })
  origenVehiculoNombre?: string;

  // Relaciones
  @BelongsTo(() => Vehiculo, {
    foreignKey: 'id_vehiculo',
    as: 'vehiculoConsignado'
  })
  vehiculo?: Vehiculo;

  @HasMany(() => Contacto, {
    foreignKey: 'id_consignacion',
    as: 'contactosConsignacion'
  })
  contactos?: Contacto[];

  @HasMany(() => GastoConsignacion, {
    foreignKey: 'id_consignacion',
    as: 'gastosConsignacion'
  })
  gastos?: GastoConsignacion[];

  // Métodos útiles
  getNombreCompleto(): string {
    return `${this.nombreConsignatario} ${this.apellidosConsignatario}`;
  }

  async getTotalGastos(): Promise<number> {
    const gastos = await GastoConsignacion.findAll({
      where: { id_consignacion: this.id }
    });
    return gastos.reduce((total, gasto) => total + gasto.costo_total, 0);
  }

  async getGastosPorTipo(): Promise<GastoPorTipo> {
    const gastos = await GastoConsignacion.findAll({
      where: { id_consignacion: this.id }
    });
    return gastos.reduce((acc: GastoPorTipo, gasto) => {
      acc[gasto.concepto] = (acc[gasto.concepto] || 0) + gasto.costo_total;
      return acc;
    }, {});
  }

  async getDistribucionGastos(): Promise<DistribucionGastos> {
    const gastos = await GastoConsignacion.findAll({
      where: { id_consignacion: this.id }
    });

    const totalGastos = gastos.reduce((total, gasto) => total + gasto.costo_total, 0);
    const gastosPorTipo = gastos.reduce((acc: GastoPorTipo, gasto) => {
      acc[gasto.concepto] = (acc[gasto.concepto] || 0) + gasto.costo_total;
      return acc;
    }, {});

    // Calcular porcentajes promedio
    const porcentajes = gastos.reduce(
      (acc, gasto) => {
        acc.consignatario += gasto.porcentaje_consignatario;
        acc.agencia += gasto.porcentaje_agencia;
        return acc;
      },
      { consignatario: 0, agencia: 0 }
    );

    const totalGastosCount = gastos.length || 1;
    return {
      totalGastos,
      gastosPorTipo,
      porcentajeConsignatario: porcentajes.consignatario / totalGastosCount,
      porcentajeAgencia: porcentajes.agencia / totalGastosCount
    };
  }
}

export default Consignacion;