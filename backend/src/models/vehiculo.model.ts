import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'vehiculos',
  timestamps: false
})
export class Vehiculo extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_vehiculo'
  })
  id!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  marca!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  modelo!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'anio'
  })
  anio!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  precio!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'num_serie'
  })
  numSerie!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  color!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'num_motor'
  })
  numMotor!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'num_factura'
  })
  numFactura?: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true
  })
  placas?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'tarjeta_circulacion'
  })
  tarjetaCirculacion?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'comentarios_internos'
  })
  comentariosInternos?: string;
}