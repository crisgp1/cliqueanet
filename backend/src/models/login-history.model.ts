import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Usuario } from './usuario.model';

@Table({
    tableName: 'login_history',
    timestamps: false
})
export class LoginHistory extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_login_history'
    })
    declare id_login_history: number;

    @ForeignKey(() => Usuario)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'id_empleado',
        references: {
            model: 'usuarios',
            key: 'id_empleado'
        }
    })
    declare id_empleado: number;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
        field: 'fecha_login'
    })
    declare fecha_login: Date;

    @Column({
        type: DataType.STRING(45),
        allowNull: false,
        field: 'ip_address'
    })
    declare ip_address: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        field: 'user_agent'
    })
    declare user_agent: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        field: 'browser'
    })
    declare browser: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        field: 'device'
    })
    declare device: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        field: 'country'
    })
    declare country: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        field: 'city'
    })
    declare city: string;

    @BelongsTo(() => Usuario, {
        foreignKey: 'id_empleado',
        as: 'empleado'
    })
    declare empleado?: Usuario;
}

// Aseguramos que el nombre de la exportación coincida con el nombre del archivo
export default LoginHistory;