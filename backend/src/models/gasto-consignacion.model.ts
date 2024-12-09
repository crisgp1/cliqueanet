import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import sequelize from '../config/database';
import { Consignacion } from './consignacion.model';

@Table({
    tableName: 'gastos_consignacion',
    timestamps: false
})
export class GastoConsignacion extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_gasto'
    })
    declare id_gasto: number;

    @ForeignKey(() => Consignacion)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'id_consignacion'
    })
    declare id_consignacion: number;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        field: 'concepto'
    })
    declare concepto: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
        field: 'costo_total'
    })
    declare costo_total: number;

    @Column({
        type: DataType.DECIMAL(5, 2),
        allowNull: false,
        field: 'porcentaje_consignatario'
    })
    declare porcentaje_consignatario: number;

    @Column({
        type: DataType.DECIMAL(5, 2),
        allowNull: false,
        field: 'porcentaje_agencia'
    })
    declare porcentaje_agencia: number;

    @BelongsTo(() => Consignacion)
    declare consignacion: Consignacion;
}

sequelize.addModels([GastoConsignacion]);

export default GastoConsignacion;