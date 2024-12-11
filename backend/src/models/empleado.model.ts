import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, BelongsToMany } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Usuario } from './usuario.model';
import { TipoIdentificacion } from './catalogs/tipo-identificacion.model';
import { Nomina } from './nomina.model';
import { Venta } from './venta.model';
import { VentaEmpleado } from './venta-empleado.model';
import { Cita } from './cita.model';
import { CitaEmpleado } from './cita-empleado.model';
import { Documento } from './documento.model';

// Estados del empleado
export type EstadoEmpleado = 'Activo' | 'Inactivo' | 'Vacaciones' | 'Incapacidad' | 'Baja';

// Tipos de documentos requeridos
export const DOCUMENTOS_REQUERIDOS = [
    'Identificación',
    'CURP',
    'Comprobante de Domicilio',
    'Contrato Laboral',
    'Alta IMSS',
    'RFC'
] as const;

@Table({
    tableName: 'empleados',
    timestamps: false
})
export class Empleado extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_empleado'
    })
    id!: number;

    @ForeignKey(() => Usuario)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'id_usuario',
        references: {
            model: 'usuarios',
            key: 'id_usuario'
        }
    })
    idUsuario?: number;

    @ForeignKey(() => TipoIdentificacion)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'id_tipo_identificacion',
        references: {
            model: 'tipos_identificacion',
            key: 'id_tipo_identificacion'
        }
    })
    idTipoIdentificacion?: number;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    })
    nombre!: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        field: 'num_identificacion',
        validate: {
            notEmpty: true
        }
    })
    numIdentificacion!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'fecha_nacimiento',
        validate: {
            isDate: true,
            isBefore: new Date().toISOString(),
            isValidAge(value: Date) {
                const age = Math.floor((new Date().getTime() - value.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                if (age < 18) {
                    throw new Error('El empleado debe ser mayor de edad');
                }
            }
        }
    })
    fechaNacimiento!: Date;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        validate: {
            is: /^[0-9]{10}$/
        }
    })
    telefono!: string;

    @Column({
        type: DataType.STRING(18),
        allowNull: false,
        validate: {
            is: /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/
        }
    })
    curp!: string;

    @Column({
        type: DataType.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [10, 200]
        }
    })
    domicilio!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'fecha_contratacion',
        validate: {
            isDate: true,
            isNotFuture(value: Date) {
                if (value > new Date()) {
                    throw new Error('La fecha de contratación no puede ser futura');
                }
            }
        }
    })
    fechaContratacion!: Date;

    @Column({
        type: DataType.STRING(20),
        allowNull: true,
        unique: true,
        field: 'num_empleado'
    })
    numEmpleado?: string;

    // Relaciones
    @BelongsTo(() => Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario'
    })
    usuario?: Usuario;

    @BelongsTo(() => TipoIdentificacion, {
        foreignKey: 'id_tipo_identificacion',
        as: 'tipoIdentificacion'
    })
    tipoIdentificacion?: TipoIdentificacion;

    @HasMany(() => Nomina, {
        foreignKey: 'id_empleado',
        as: 'nominas'
    })
    nominas?: Nomina[];

    @BelongsToMany(() => Venta, {
        through: () => VentaEmpleado,
        foreignKey: 'id_empleado',
        otherKey: 'id_venta',
        as: 'ventas'
    })
    ventas?: Venta[];

    @BelongsToMany(() => Cita, {
        through: () => CitaEmpleado,
        foreignKey: 'id_empleado',
        otherKey: 'id_cita',
        as: 'citas'
    })
    citas?: Cita[];

    @HasMany(() => Documento, {
        foreignKey: 'id_empleado',
        as: 'documentos'
    })
    documentos?: Documento[];

    // Métodos útiles
    getNombreCompleto(): string {
        return this.nombre;
    }

    getEdad(): number {
        return Math.floor((new Date().getTime() - this.fechaNacimiento.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }

    getAntiguedad(): number {
        return Math.floor((new Date().getTime() - this.fechaContratacion.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }

    // Método para obtener resumen de ventas
    async getResumenVentas(options?: {
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        totalVentas: number;
        montoTotal: number;
        comisionesTotal: number;
        promedioComision: number;
        ventasPorMes: Record<string, number>;
    }> {
        const where: any = { id_empleado: this.id };
        
        if (options?.startDate && options?.endDate) {
            where.created_at = {
                [Op.between]: [options.startDate, options.endDate]
            };
        }

        const ventasEmpleado = await VentaEmpleado.findAll({
            where,
            include: [{ model: Venta, as: 'venta' }]
        });

        const ventasPorMes: Record<string, number> = {};
        let montoTotal = 0;
        let comisionesTotal = 0;

        ventasEmpleado.forEach(ve => {
            const fecha = ve.venta?.fecha.toISOString().slice(0, 7); // YYYY-MM
            if (fecha) {
                ventasPorMes[fecha] = (ventasPorMes[fecha] || 0) + 1;
            }
            montoTotal += ve.venta?.monto || 0;
            comisionesTotal += ve.comision || 0;
        });

        return {
            totalVentas: ventasEmpleado.length,
            montoTotal,
            comisionesTotal,
            promedioComision: ventasEmpleado.length ? comisionesTotal / ventasEmpleado.length : 0,
            ventasPorMes
        };
    }

    // Método para obtener resumen de nómina
    async getResumenNomina(options?: {
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        totalPagos: number;
        salarioPromedio: number;
        comisionesTotal: number;
        deduccionesTotal: number;
        nominasPorMes: Record<string, number>;
    }> {
        const where: any = { id_empleado: this.id };
        
        if (options?.startDate && options?.endDate) {
            where.fecha_pago = {
                [Op.between]: [options.startDate, options.endDate]
            };
        }

        const nominas = await Nomina.findAll({ where });

        const nominasPorMes: Record<string, number> = {};
        let salarioTotal = 0;
        let comisionesTotal = 0;
        let deduccionesTotal = 0;

        nominas.forEach(nomina => {
            const fecha = nomina.fechaPago.toISOString().slice(0, 7); // YYYY-MM
            nominasPorMes[fecha] = (nominasPorMes[fecha] || 0) + nomina.totalPago;
            salarioTotal += nomina.salarioBase;
            comisionesTotal += nomina.comisiones || 0;
            deduccionesTotal += nomina.deducciones || 0;
        });

        return {
            totalPagos: nominas.length,
            salarioPromedio: nominas.length ? salarioTotal / nominas.length : 0,
            comisionesTotal,
            deduccionesTotal,
            nominasPorMes
        };
    }

    // Método para verificar documentos
    async verificarDocumentos(): Promise<{
        completo: boolean;
        documentosFaltantes: string[];
        documentosVencidos: string[];
    }> {
        const documentos = await this.$get('documentos');
        const documentosFaltantes: string[] = [];
        const documentosVencidos: string[] = [];

        DOCUMENTOS_REQUERIDOS.forEach(tipoDoc => {
            const documento = documentos?.find(d => d.tipoDocumento === tipoDoc);
            if (!documento) {
                documentosFaltantes.push(tipoDoc);
            } else {
                const validacion = documento.validarDocumento();
                if (!validacion.valido) {
                    documentosVencidos.push(tipoDoc);
                }
            }
        });

        return {
            completo: documentosFaltantes.length === 0 && documentosVencidos.length === 0,
            documentosFaltantes,
            documentosVencidos
        };
    }

    // Método para obtener citas pendientes
    async getCitasPendientes(): Promise<Cita[]> {
        const citasEmpleado = await CitaEmpleado.findAll({
            where: { id_empleado: this.id },
            include: [{
                model: Cita,
                as: 'cita',
                where: {
                    fecha: {
                        [Op.gte]: new Date()
                    }
                }
            }]
        });

        return citasEmpleado.map(ce => ce.cita!).sort((a, b) => 
            a.fecha.getTime() - b.fecha.getTime()
        );
    }

    // Método para obtener análisis de rendimiento
    async getAnalisisRendimiento(options?: {
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        ventasTotales: number;
        montoTotalVentas: number;
        comisionesTotales: number;
        promedioVentasMensual: number;
        tendencia: 'Ascendente' | 'Estable' | 'Descendente';
        rendimiento: 'Alto' | 'Medio' | 'Bajo';
    }> {
        const resumenVentas = await this.getResumenVentas(options);
        const mesesTotales = Object.keys(resumenVentas.ventasPorMes).length || 1;

        // Calcular tendencia
        const ventasPorMes = Object.entries(resumenVentas.ventasPorMes)
            .sort(([a], [b]) => a.localeCompare(b));
        
        let tendencia: 'Ascendente' | 'Estable' | 'Descendente' = 'Estable';
        if (ventasPorMes.length >= 3) {
            const primerasMitad = ventasPorMes.slice(0, Math.floor(ventasPorMes.length / 2));
            const segundasMitad = ventasPorMes.slice(Math.floor(ventasPorMes.length / 2));
            
            const promedioInicial = primerasMitad.reduce((sum, [_, val]) => sum + val, 0) / primerasMitad.length;
            const promedioFinal = segundasMitad.reduce((sum, [_, val]) => sum + val, 0) / segundasMitad.length;
            
            if (promedioFinal > promedioInicial * 1.1) tendencia = 'Ascendente';
            else if (promedioFinal < promedioInicial * 0.9) tendencia = 'Descendente';
        }

        // Calcular rendimiento
        const promedioVentasMensual = resumenVentas.totalVentas / mesesTotales;
        let rendimiento: 'Alto' | 'Medio' | 'Bajo' = 'Medio';
        if (promedioVentasMensual >= 5) rendimiento = 'Alto';
        else if (promedioVentasMensual <= 2) rendimiento = 'Bajo';

        return {
            ventasTotales: resumenVentas.totalVentas,
            montoTotalVentas: resumenVentas.montoTotal,
            comisionesTotales: resumenVentas.comisionesTotal,
            promedioVentasMensual,
            tendencia,
            rendimiento
        };
    }
}

export default Empleado;