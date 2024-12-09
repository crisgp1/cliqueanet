import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'consignaciones',
  timestamps: false
})
export class Consignacion extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_consignacion'
  })
  id!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_vehiculo'
  })
  idVehiculo!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'nombre_consignatario'
  })
  nombreConsignatario!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'apellidos_consignatario'
  })
  apellidosConsignatario!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'correo_consignatario'
  })
  correoConsignatario!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    field: 'telefono_consignatario'
  })
  telefonoConsignatario!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'origen_vehiculo_tipo'
  })
  origenVehiculoTipo?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'origen_vehiculo_nombre'
  })
  origenVehiculoNombre?: string;
}