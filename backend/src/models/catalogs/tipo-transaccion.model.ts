import { Table, Column, Model, DataType } from 'sequelize-typescript';

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
    allowNull: false
  })
  nombre!: string;
}