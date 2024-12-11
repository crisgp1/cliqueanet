import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Consignacion } from './consignacion.model';

// Tipos de conceptos comunes para gastos
export type ConceptoGasto = 'Reparación' | 'Mantenimiento' | 'Limpieza' | 'Verificación' | 'Trámite' | 'Otro';

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
    id_gasto!: number;

    @ForeignKey(() => Consignacion)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'id_consignacion',
        references: {
            model: 'consignaciones',
            key: 'id_consignacion'
        }
    })
    id_consignacion!: number;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        field: 'concepto',
        validate: {
            notEmpty: true,
            isIn: [['Reparación', 'Mantenimiento', 'Limpieza', 'Verificación', 'Trámite', 'Otro']]
        }
    })
    concepto!: ConceptoGasto;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
        field: 'costo_total',
        validate: {
            min: 0
        }
    })
    costo_total!: number;

    @Column({
        type: DataType.DECIMAL(5, 2),
        allowNull: false,
        field: 'porcentaje_consignatario',
        validate: {
            min: 0,
            max: 100
        }
    })
    porcentaje_consignatario!: number;

    @Column({
        type: DataType.DECIMAL(5, 2),
        allowNull: false,
        field: 'porcentaje_agencia',
        validate: {
            min: 0,
            max: 100
        }
    })
    porcentaje_agencia!: number;

    // Relaciones
    @BelongsTo(() => Consignacion, {
        foreignKey: 'id_consignacion',
        as: 'consignacionGasto'
    })
    consignacion!: Consignacion;

    // Métodos útiles
    getMontoPorcentajeConsignatario(): number {
        return (this.costo_total * this.porcentaje_consignatario) / 100;
    }

    getMontoPorcentajeAgencia(): number {
        return (this.costo_total * this.porcentaje_agencia) / 100;
    }

    validarPorcentajes(): boolean {
        return this.porcentaje_consignatario + this.porcentaje_agencia === 100;
    }

    // Método para obtener el resumen del gasto
    getResumen(): {
        concepto: ConceptoGasto;
        costoTotal: number;
        montoConsignatario: number;
        montoAgencia: number;
        porcentajes: {
            consignatario: number;
            agencia: number;
        };
    } {
        return {
            concepto: this.concepto,
            costoTotal: this.costo_total,
            montoConsignatario: this.getMontoPorcentajeConsignatario(),
            montoAgencia: this.getMontoPorcentajeAgencia(),
            porcentajes: {
                consignatario: this.porcentaje_consignatario,
                agencia: this.porcentaje_agencia
            }
        };
    }

    // Método estático para obtener el resumen de gastos de una consignación
    static async getResumenGastosConsignacion(idConsignacion: number): Promise<{
        totalGastos: number;
        gastosPorConcepto: { [key in ConceptoGasto]?: number };
        totalConsignatario: number;
        totalAgencia: number;
        porcentajePromedioConsignatario: number;
        porcentajePromedioAgencia: number;
    }> {
        const gastos = await this.findAll({
            where: { id_consignacion: idConsignacion }
        });

        const resumen = {
            totalGastos: 0,
            gastosPorConcepto: {} as { [key in ConceptoGasto]?: number },
            totalConsignatario: 0,
            totalAgencia: 0,
            porcentajePromedioConsignatario: 0,
            porcentajePromedioAgencia: 0
        };

        if (gastos.length === 0) return resumen;

        gastos.forEach(gasto => {
            // Total general
            resumen.totalGastos += gasto.costo_total;

            // Por concepto
            resumen.gastosPorConcepto[gasto.concepto] = 
                (resumen.gastosPorConcepto[gasto.concepto] || 0) + gasto.costo_total;

            // Totales por parte
            resumen.totalConsignatario += gasto.getMontoPorcentajeConsignatario();
            resumen.totalAgencia += gasto.getMontoPorcentajeAgencia();

            // Acumular porcentajes para promedio
            resumen.porcentajePromedioConsignatario += gasto.porcentaje_consignatario;
            resumen.porcentajePromedioAgencia += gasto.porcentaje_agencia;
        });

        // Calcular promedios
        resumen.porcentajePromedioConsignatario /= gastos.length;
        resumen.porcentajePromedioAgencia /= gastos.length;

        return resumen;
    }

    // Método estático para validar si un gasto es válido
    static validarGasto(gasto: {
        concepto: ConceptoGasto;
        costo_total: number;
        porcentaje_consignatario: number;
        porcentaje_agencia: number;
    }): { valido: boolean; errores: string[] } {
        const errores: string[] = [];

        if (!gasto.concepto || !['Reparación', 'Mantenimiento', 'Limpieza', 'Verificación', 'Trámite', 'Otro'].includes(gasto.concepto)) {
            errores.push('El concepto no es válido');
        }

        if (gasto.costo_total <= 0) {
            errores.push('El costo total debe ser mayor a 0');
        }

        if (gasto.porcentaje_consignatario < 0 || gasto.porcentaje_consignatario > 100) {
            errores.push('El porcentaje del consignatario debe estar entre 0 y 100');
        }

        if (gasto.porcentaje_agencia < 0 || gasto.porcentaje_agencia > 100) {
            errores.push('El porcentaje de la agencia debe estar entre 0 y 100');
        }

        if (gasto.porcentaje_consignatario + gasto.porcentaje_agencia !== 100) {
            errores.push('La suma de los porcentajes debe ser 100%');
        }

        return {
            valido: errores.length === 0,
            errores
        };
    }
}

export default GastoConsignacion;