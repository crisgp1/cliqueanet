import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Cliente } from './cliente.model';
import { Transaccion } from './transaccion.model';

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

  // Relaciones
  @BelongsTo(() => Cliente, {
    foreignKey: 'id_cliente'
  })
  cliente?: Cliente;

  @HasMany(() => Transaccion, {
    foreignKey: 'id_credito'
  })
  transacciones?: Transaccion[];
}

export default Credito;