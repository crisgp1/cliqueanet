import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'documentos',
  timestamps: false
})
export class Documento extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_documento'
  })
  id!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'id_empleado'
  })
  idEmpleado?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'id_cliente'
  })
  idCliente?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'id_vehiculo'
  })
  idVehiculo?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'id_transaccion'
  })
  idTransaccion?: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  url!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'tipo_documento'
  })
  tipoDocumento!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'fecha_subida'
  })
  fechaSubida!: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  descripcion?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'permisos_acceso'
  })
  permisosAcceso?: string;
}