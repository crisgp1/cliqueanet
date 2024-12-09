import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'citas',
  timestamps: false
})
export class Cita extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_cita'
  })
  id!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_empleado_creador'
  })
  idEmpleadoCreador!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_contacto'
  })
  idContacto!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'id_vehiculo'
  })
  idVehiculo?: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'tipo_cita'
  })
  tipoCita!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  fecha!: Date;

  @Column({
    type: DataType.TIME,
    allowNull: false
  })
  hora!: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: false
  })
  lugar!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
  })
  reagendaciones!: number;
}