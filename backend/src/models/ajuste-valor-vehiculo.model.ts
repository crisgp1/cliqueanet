import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import sequelize from '../config/database';
import { Vehiculo } from './vehiculo.model';

@Table({
    tableName: 'ajustes_valor_vehiculo',
    timestamps: false
})
export class AjusteValorVehiculo extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_ajuste'
    })
    declare id_ajuste: number;

    @ForeignKey(() => Vehiculo)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'id_vehiculo'
    })
    declare id_vehiculo: number;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        field: 'concepto'
    })
    declare concepto: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
        field: 'monto_ajuste'
    })
    declare monto_ajuste: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'detalle'
    })
    declare detalle: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
        field: 'fecha'
    })
    declare fecha: Date;

    @BelongsTo(() => Vehiculo)
    declare vehiculo: Vehiculo;
}

export default AjusteValorVehiculo;