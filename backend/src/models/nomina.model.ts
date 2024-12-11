import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Empleado } from './empleado.model';

// Tipos de percepciones y deducciones
export type TipoPercepcion = 'Salario' | 'Comisión' | 'Bono' | 'Aguinaldo' | 'Prima Vacacional' | 'Otro';
export type TipoDeduccion = 'ISR' | 'IMSS' | 'INFONAVIT' | 'Préstamo' | 'Otro';

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

  @ForeignKey(() => Empleado)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_empleado',
    references: {
      model: 'empleados',
      key: 'id_empleado'
    }
  })
  idEmpleado!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'fecha_pago',
    validate: {
      isDate: true,
      isAfter: '2020-01-01'
    }
  })
  fechaPago!: Date;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'salario_base',
    validate: {
      min: 0
    }
  })
  salarioBase!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0
    }
  })
  comisiones?: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'otras_percepciones',
    validate: {
      min: 0
    }
  })
  otrasPercepciones?: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0
    }
  })
  deducciones?: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_pago',
    validate: {
      min: 0
    }
  })
  totalPago!: number;

  // Relaciones
  @BelongsTo(() => Empleado, {
    foreignKey: 'id_empleado',
    as: 'empleado'
  })
  empleado?: Empleado;

  // Métodos útiles
  calcularTotalPercepciones(): number {
    return this.salarioBase + 
           (this.comisiones || 0) + 
           (this.otrasPercepciones || 0);
  }

  calcularTotalDeducciones(): number {
    return this.deducciones || 0;
  }

  calcularTotalNeto(): number {
    return this.calcularTotalPercepciones() - this.calcularTotalDeducciones();
  }

  // Método para validar los montos
  validarMontos(): boolean {
    const totalCalculado = this.calcularTotalNeto();
    return Math.abs(totalCalculado - this.totalPago) < 0.01; // Permitir pequeñas diferencias por redondeo
  }

  // Método para obtener el resumen de la nómina
  getResumen(): {
    percepciones: {
      salarioBase: number;
      comisiones?: number;
      otrasPercepciones?: number;
      total: number;
    };
    deducciones: {
      total: number;
    };
    totales: {
      totalPercepciones: number;
      totalDeducciones: number;
      totalNeto: number;
    };
  } {
    const totalPercepciones = this.calcularTotalPercepciones();
    const totalDeducciones = this.calcularTotalDeducciones();

    return {
      percepciones: {
        salarioBase: this.salarioBase,
        comisiones: this.comisiones,
        otrasPercepciones: this.otrasPercepciones,
        total: totalPercepciones
      },
      deducciones: {
        total: totalDeducciones
      },
      totales: {
        totalPercepciones,
        totalDeducciones,
        totalNeto: this.totalPago
      }
    };
  }

  // Método estático para obtener el historial de nómina de un empleado
  static async getHistorialNomina(idEmpleado: number, options?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    nominas: Nomina[];
    totales: {
      salarioBase: number;
      comisiones: number;
      otrasPercepciones: number;
      deducciones: number;
      totalNeto: number;
    };
    promedios: {
      salarioBase: number;
      comisiones: number;
      otrasPercepciones: number;
      deducciones: number;
      totalNeto: number;
    };
  }> {
    const where: any = { id_empleado: idEmpleado };

    if (options?.startDate && options?.endDate) {
      where.fecha_pago = {
        [Op.between]: [options.startDate, options.endDate]
      };
    }

    const nominas = await this.findAll({
      where,
      order: [['fecha_pago', 'DESC']],
      include: [{ model: Empleado, as: 'empleado' }]
    });

    const totales = nominas.reduce((acc, nomina) => ({
      salarioBase: acc.salarioBase + nomina.salarioBase,
      comisiones: acc.comisiones + (nomina.comisiones || 0),
      otrasPercepciones: acc.otrasPercepciones + (nomina.otrasPercepciones || 0),
      deducciones: acc.deducciones + (nomina.deducciones || 0),
      totalNeto: acc.totalNeto + nomina.totalPago
    }), {
      salarioBase: 0,
      comisiones: 0,
      otrasPercepciones: 0,
      deducciones: 0,
      totalNeto: 0
    });

    const count = nominas.length || 1;
    const promedios = {
      salarioBase: totales.salarioBase / count,
      comisiones: totales.comisiones / count,
      otrasPercepciones: totales.otrasPercepciones / count,
      deducciones: totales.deducciones / count,
      totalNeto: totales.totalNeto / count
    };

    return { nominas, totales, promedios };
  }

  // Método estático para obtener análisis de comisiones
  static async getAnalisisComisiones(idEmpleado: number, options?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalComisiones: number;
    promedioComisiones: number;
    comisionesPorMes: { [key: string]: number };
    tendencia: 'ascendente' | 'descendente' | 'estable';
  }> {
    const where: any = { 
      id_empleado: idEmpleado,
      comisiones: { [Op.gt]: 0 }
    };

    if (options?.startDate && options?.endDate) {
      where.fecha_pago = {
        [Op.between]: [options.startDate, options.endDate]
      };
    }

    const nominas = await this.findAll({
      where,
      order: [['fecha_pago', 'ASC']]
    });

    const comisionesPorMes: { [key: string]: number } = {};
    let totalComisiones = 0;

    nominas.forEach(nomina => {
      const mes = nomina.fechaPago.toISOString().slice(0, 7); // YYYY-MM
      comisionesPorMes[mes] = (comisionesPorMes[mes] || 0) + (nomina.comisiones || 0);
      totalComisiones += nomina.comisiones || 0;
    });

    const promedioComisiones = totalComisiones / (nominas.length || 1);

    // Calcular tendencia
    let tendencia: 'ascendente' | 'descendente' | 'estable' = 'estable';
    if (nominas.length >= 3) {
      const primeras = nominas.slice(0, Math.floor(nominas.length / 2));
      const ultimas = nominas.slice(Math.floor(nominas.length / 2));
      
      const promedioInicial = primeras.reduce((sum, n) => sum + (n.comisiones || 0), 0) / primeras.length;
      const promedioFinal = ultimas.reduce((sum, n) => sum + (n.comisiones || 0), 0) / ultimas.length;
      
      const diferencia = promedioFinal - promedioInicial;
      if (diferencia > promedioInicial * 0.1) tendencia = 'ascendente';
      else if (diferencia < -promedioInicial * 0.1) tendencia = 'descendente';
    }

    return {
      totalComisiones,
      promedioComisiones,
      comisionesPorMes,
      tendencia
    };
  }
}

export default Nomina;