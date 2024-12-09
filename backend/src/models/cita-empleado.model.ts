import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'citas_empleados',
  timestamps: false
})
export class CitaEmpleado extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    field: 'id_cita'
  })
  idCita!: number;

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    field: 'id_empleado'
  })
  idEmpleado!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'fecha_asignacion'
  })
  fechaAsignacion!: Date;
}