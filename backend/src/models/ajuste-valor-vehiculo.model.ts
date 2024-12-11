import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Vehiculo } from './vehiculo.model';

// Tipos de ajustes comunes
export type TipoAjuste = 'Depreciación' | 'Reparación' | 'Mejora' | 'Daño' | 'Otro';

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
    id_ajuste!: number;

    @ForeignKey(() => Vehiculo)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'id_vehiculo',
        references: {
            model: 'vehiculos',
            key: 'id_vehiculo'
        }
    })
    id_vehiculo!: number;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        field: 'concepto',
        validate: {
            notEmpty: true,
            isIn: [['Depreciación', 'Reparación', 'Mejora', 'Daño', 'Otro']]
        }
    })
    concepto!: TipoAjuste;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
        field: 'monto_ajuste',
        validate: {
            notNull: true
        }
    })
    monto_ajuste!: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'detalle'
    })
    detalle?: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
        field: 'fecha'
    })
    fecha!: Date;

    // Relaciones
    @BelongsTo(() => Vehiculo, {
        foreignKey: 'id_vehiculo',
        as: 'vehiculoAjuste'
    })
    vehiculo!: Vehiculo;

    // Métodos útiles
    esPositivo(): boolean {
        return this.monto_ajuste > 0;
    }

    esNegativo(): boolean {
        return this.monto_ajuste < 0;
    }

    // Método para obtener el impacto porcentual sobre el valor original
    async getPorcentajeImpacto(): Promise<number> {
        const vehiculo = await this.$get('vehiculo');
        if (!vehiculo) return 0;
        return (this.monto_ajuste / vehiculo.precio) * 100;
    }

    // Método para obtener el resumen del ajuste
    async getResumen(): Promise<{
        tipo: TipoAjuste;
        monto: number;
        impactoPorcentual: number;
        fecha: Date;
        detalle?: string;
    }> {
        const impactoPorcentual = await this.getPorcentajeImpacto();
        
        return {
            tipo: this.concepto,
            monto: this.monto_ajuste,
            impactoPorcentual,
            fecha: this.fecha,
            detalle: this.detalle
        };
    }

    // Método estático para obtener el historial de ajustes de un vehículo
    static async getHistorialAjustes(idVehiculo: number): Promise<{
        ajustes: AjusteValorVehiculo[];
        totalAjustes: number;
        ajustesPositivos: number;
        ajustesNegativos: number;
    }> {
        const ajustes = await this.findAll({
            where: { id_vehiculo: idVehiculo },
            order: [['fecha', 'DESC']]
        });

        const totalAjustes = ajustes.reduce((sum, ajuste) => sum + ajuste.monto_ajuste, 0);
        const ajustesPositivos = ajustes
            .filter(ajuste => ajuste.monto_ajuste > 0)
            .reduce((sum, ajuste) => sum + ajuste.monto_ajuste, 0);
        const ajustesNegativos = ajustes
            .filter(ajuste => ajuste.monto_ajuste < 0)
            .reduce((sum, ajuste) => sum + ajuste.monto_ajuste, 0);

        return {
            ajustes,
            totalAjustes,
            ajustesPositivos,
            ajustesNegativos
        };
    }

    // Método estático para obtener estadísticas de ajustes por tipo
    static async getEstadisticasPorTipo(idVehiculo: number): Promise<{
        [key in TipoAjuste]?: {
            cantidad: number;
            montoTotal: number;
            promedio: number;
        };
    }> {
        const ajustes = await this.findAll({
            where: { id_vehiculo: idVehiculo }
        });

        const estadisticas: any = {};

        ajustes.forEach(ajuste => {
            if (!estadisticas[ajuste.concepto]) {
                estadisticas[ajuste.concepto] = {
                    cantidad: 0,
                    montoTotal: 0,
                    promedio: 0
                };
            }

            estadisticas[ajuste.concepto].cantidad++;
            estadisticas[ajuste.concepto].montoTotal += ajuste.monto_ajuste;
        });

        // Calcular promedios
        Object.keys(estadisticas).forEach(tipo => {
            estadisticas[tipo].promedio = estadisticas[tipo].montoTotal / estadisticas[tipo].cantidad;
        });

        return estadisticas;
    }
}

export default AjusteValorVehiculo;