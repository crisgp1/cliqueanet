import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'transacciones',
  timestamps: false
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
    allowNull: false
  })
  fecha!: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_usuario'
  })
  idUsuario!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_cliente'
  })
  idCliente!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_vehiculo'
  })
  idVehiculo!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'id_credito'
  })
  idCredito?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_tipo_transaccion'
  })
  idTipoTransaccion!: number;
}