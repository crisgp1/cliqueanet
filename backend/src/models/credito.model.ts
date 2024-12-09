import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'creditos',
  timestamps: false
})
export class Credito extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_credito'
  })
  id!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_cliente'
  })
  idCliente!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  cantidad!: number;

  @Column({
    type: DataType.STRING(200),
    allowNull: true
  })
  comentarios?: string;
}