import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'nomina',
  timestamps: false
})
export class Nomina extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_nomina'
  })
  id!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_empleado'
  })
  idEmpleado!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'fecha_pago'
  })
  fechaPago!: Date;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'salario_base'
  })
  salarioBase!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true
  })
  comisiones?: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    field: 'otras_percepciones'
  })
  otrasPercepciones?: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true
  })
  deducciones?: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_pago'
  })
  totalPago!: number;
}