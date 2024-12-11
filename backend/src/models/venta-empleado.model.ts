import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Venta } from './venta.model';
import { Empleado } from './empleado.model';

// Tipos de comisión
export type TipoComision = 'Fija' | 'Porcentaje' | 'Mixta';

@Table({
  tableName: 'venta_empleados',
  timestamps: false
})
export class VentaEmpleado extends Model {
  @ForeignKey(() => Venta)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    field: 'id_venta',
    references: {
      model: 'ventas',
      key: 'id_venta'
    }
  })
  idVenta!: number;

  @ForeignKey(() => Empleado)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    field: 'id_empleado',
    references: {
      model: 'empleados',
      key: 'id_empleado'
    }
  })
  idEmpleado!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  })
  comision!: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    field: 'porcentaje_comision',
    validate: {
      min: 0,
      max: 100
    }
  })
  porcentajeComision!: number;

  // Relaciones
  @BelongsTo(() => Venta, {
    foreignKey: 'id_venta',
    as: 'venta'
  })
  venta?: Venta;

  @BelongsTo(() => Empleado, {
    foreignKey: 'id_empleado',
    as: 'empleado'
  })
  empleado?: Empleado;

  // Métodos útiles
  calcularComision(montoVenta: number): number {
    return (montoVenta * this.porcentajeComision) / 100;
  }

  async actualizarComision(montoVenta: number): Promise<void> {
    this.comision = this.calcularComision(montoVenta);
    await this.save();
  }

  // Método para validar la comisión
  validarComision(montoVenta: number): boolean {
    const comisionCalculada = this.calcularComision(montoVenta);
    return Math.abs(comisionCalculada - this.comision) < 0.01; // Permitir pequeñas diferencias por redondeo
  }

  // Método para obtener el resumen de la venta
  getResumenVenta(): {
    montoComision: number;
    porcentaje: number;
    rendimiento: 'Alto' | 'Medio' | 'Bajo';
  } {
    let rendimiento: 'Alto' | 'Medio' | 'Bajo' = 'Medio';
    
    if (this.porcentajeComision > 5) rendimiento = 'Alto';
    else if (this.porcentajeComision < 2) rendimiento = 'Bajo';

    return {
      montoComision: this.comision,
      porcentaje: this.porcentajeComision,
      rendimiento
    };
  }

  // Método estático para obtener el historial de ventas de un empleado
  static async getHistorialVentas(idEmpleado: number, options?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    ventas: VentaEmpleado[];
    totalComisiones: number;
    promedioComision: number;
    rendimientoGeneral: 'Alto' | 'Medio' | 'Bajo';
  }> {
    const where: any = { id_empleado: idEmpleado };

    if (options?.startDate && options?.endDate) {
      where['$venta.fecha$'] = {
        [Op.between]: [options.startDate, options.endDate]
      };
    }

    const ventas = await this.findAll({
      where,
      include: [
        { model: Venta, as: 'venta' },
        { model: Empleado, as: 'empleado' }
      ],
      order: [[{ model: Venta, as: 'venta' }, 'fecha', 'DESC']]
    });

    const totalComisiones = ventas.reduce((sum, venta) => sum + venta.comision, 0);
    const promedioComision = totalComisiones / (ventas.length || 1);
    const promedioProcentaje = ventas.reduce((sum, venta) => sum + venta.porcentajeComision, 0) / (ventas.length || 1);

    let rendimientoGeneral: 'Alto' | 'Medio' | 'Bajo' = 'Medio';
    if (promedioProcentaje > 5) rendimientoGeneral = 'Alto';
    else if (promedioProcentaje < 2) rendimientoGeneral = 'Bajo';

    return {
      ventas,
      totalComisiones,
      promedioComision,
      rendimientoGeneral
    };
  }

  // Método estático para obtener análisis de rendimiento
  static async getAnalisisRendimiento(idEmpleado: number, options?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalVentas: number;
    totalComisiones: number;
    promedioComisionPorVenta: number;
    mejorComision: number;
    peorComision: number;
    tendencia: 'Mejorando' | 'Estable' | 'Decreciendo';
    distribucionComisiones: {
      alta: number;
      media: number;
      baja: number;
    };
  }> {
    const where: any = { id_empleado: idEmpleado };

    if (options?.startDate && options?.endDate) {
      where['$venta.fecha$'] = {
        [Op.between]: [options.startDate, options.endDate]
      };
    }

    const ventas = await this.findAll({
      where,
      include: [{ model: Venta, as: 'venta' }],
      order: [[{ model: Venta, as: 'venta' }, 'fecha', 'ASC']]
    });

    const comisiones = ventas.map(v => v.comision);
    const totalComisiones = comisiones.reduce((sum, c) => sum + c, 0);
    const promedioComision = totalComisiones / (ventas.length || 1);

    // Análisis de tendencia
    let tendencia: 'Mejorando' | 'Estable' | 'Decreciendo' = 'Estable';
    if (ventas.length >= 3) {
      const mitad = Math.floor(ventas.length / 2);
      const primerasMitad = ventas.slice(0, mitad);
      const segundasMitad = ventas.slice(mitad);

      const promedioInicial = primerasMitad.reduce((sum, v) => sum + v.comision, 0) / primerasMitad.length;
      const promedioFinal = segundasMitad.reduce((sum, v) => sum + v.comision, 0) / segundasMitad.length;

      if (promedioFinal > promedioInicial * 1.1) tendencia = 'Mejorando';
      else if (promedioFinal < promedioInicial * 0.9) tendencia = 'Decreciendo';
    }

    // Distribución de comisiones
    const distribucionComisiones = {
      alta: ventas.filter(v => v.porcentajeComision > 5).length,
      media: ventas.filter(v => v.porcentajeComision >= 2 && v.porcentajeComision <= 5).length,
      baja: ventas.filter(v => v.porcentajeComision < 2).length
    };

    return {
      totalVentas: ventas.length,
      totalComisiones,
      promedioComisionPorVenta: promedioComision,
      mejorComision: Math.max(...comisiones),
      peorComision: Math.min(...comisiones),
      tendencia,
      distribucionComisiones
    };
  }
}

export default VentaEmpleado;