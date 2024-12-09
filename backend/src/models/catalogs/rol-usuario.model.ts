import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'roles_usuario',
  timestamps: false
})
export class RolUsuario extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_rol'
  })
  id!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  nombre!: string;
}