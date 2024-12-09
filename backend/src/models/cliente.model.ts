import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'clientes',
  timestamps: false
})
export class Cliente extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_cliente'
  })
  id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  nombre!: string;

  @Column({
    type: DataType.STRING(18),
    allowNull: false
  })
  curp!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'id_tipo_identificacion'
  })
  idTipoIdentificacion!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'num_identificacion'
  })
  numIdentificacion!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'fecha_nacimiento'
  })
  fechaNacimiento!: Date;

  @Column({
    type: DataType.STRING(20),
    allowNull: false
  })
  telefono!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  correo!: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: false
  })
  domicilio!: string;
}