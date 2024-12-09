import { Table, Column, Model, DataType } from 'sequelize-typescript';

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

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_transaccion'
  })
  idTransaccion!: number;
}