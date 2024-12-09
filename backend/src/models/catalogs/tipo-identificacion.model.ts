import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'tipos_identificacion',
  timestamps: false
})
export class TipoIdentificacion extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_tipo_identificacion'
  })
  id!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  nombre!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  descripcion?: string;
}