import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'contactos',
  timestamps: false
})
export class Contacto extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_contacto'
  })
  id!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'tipo_contacto'
  })
  tipoContacto!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  nombre!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  apellidos!: string;

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
    type: DataType.INTEGER,
    allowNull: true,
    field: 'id_cliente'
  })
  idCliente?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'id_consignacion'
  })
  idConsignacion?: number;
}