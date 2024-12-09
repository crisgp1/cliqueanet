import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'venta_empleados',
  timestamps: false
})
export class VentaEmpleado extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    field: 'id_venta'
  })
  idVenta!: number;

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    field: 'id_empleado'
  })
  idEmpleado!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  comision!: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    field: 'porcentaje_comision'
  })
  porcentajeComision!: number;
}