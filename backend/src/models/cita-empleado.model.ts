import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Cita } from './cita.model';
import { Usuario } from './usuario.model';

@Table({
  tableName: 'citas_empleados',
  timestamps: false
})
export class CitaEmpleado extends Model {
  @ForeignKey(() => Cita)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    field: 'id_cita',
    references: {
      model: 'citas',
      key: 'id_cita'
    }
  })
  idCita!: number;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    field: 'id_empleado',
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  })
  idEmpleado!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'fecha_asignacion'
  })
  fechaAsignacion!: Date;

  // Relaciones
  @BelongsTo(() => Cita, {
    foreignKey: 'id_cita',
    as: 'cita'
  })
  cita?: Cita;

  @BelongsTo(() => Usuario, {
    foreignKey: 'id_empleado',
    as: 'empleado'
  })
  empleado?: Usuario;

  // Métodos útiles
  static async asignarEmpleadosACita(idCita: number, empleadosIds: number[]): Promise<CitaEmpleado[]> {
    // Eliminar asignaciones existentes
    await this.destroy({
      where: { id_cita: idCita }
    });

    // Crear nuevas asignaciones
    const asignaciones = await Promise.all(
      empleadosIds.map(idEmpleado =>
        this.create({
          idCita,
          idEmpleado,
          fechaAsignacion: new Date()
        })
      )
    );

    return asignaciones;
  }

  static async getEmpleadosPorCita(idCita: number): Promise<Usuario[]> {
    const asignaciones = await this.findAll({
      where: { id_cita: idCita },
      include: [{
        model: Usuario,
        as: 'empleado'
      }]
    });

    return asignaciones.map(asignacion => asignacion.empleado!);
  }

  static async getCitasPorEmpleado(idEmpleado: number, fecha?: Date): Promise<Cita[]> {
    const where: any = { id_empleado: idEmpleado };
    
    if (fecha) {
      where['$cita.fecha$'] = fecha;
    }

    const asignaciones = await this.findAll({
      where,
      include: [{
        model: Cita,
        as: 'cita',
        required: true
      }]
    });

    return asignaciones.map(asignacion => asignacion.cita!);
  }

  // Método para verificar si un empleado está disponible en una fecha y hora específica
  static async verificarDisponibilidadEmpleado(idEmpleado: number, fecha: Date, hora: string): Promise<boolean> {
    const citasEmpleado = await this.findAll({
      include: [{
        model: Cita,
        as: 'cita',
        where: {
          fecha,
          hora
        }
      }],
      where: {
        id_empleado: idEmpleado
      }
    });

    return citasEmpleado.length === 0;
  }

  // Método para obtener el historial de asignaciones de un empleado
  static async getHistorialAsignaciones(idEmpleado: number, fechaInicio: Date, fechaFin: Date): Promise<{
    totalCitas: number;
    citasPorTipo: { [key: string]: number };
    citasPorDia: { [key: string]: number };
  }> {
    const asignaciones = await this.findAll({
      include: [{
        model: Cita,
        as: 'cita',
        where: {
          fecha: {
            [Op.between]: [fechaInicio, fechaFin]
          }
        }
      }],
      where: {
        id_empleado: idEmpleado
      }
    });

    const resumen = {
      totalCitas: asignaciones.length,
      citasPorTipo: {} as { [key: string]: number },
      citasPorDia: {} as { [key: string]: number }
    };

    asignaciones.forEach(asignacion => {
      const cita = asignacion.cita!;
      // Contar por tipo
      resumen.citasPorTipo[cita.tipoCita] = (resumen.citasPorTipo[cita.tipoCita] || 0) + 1;
      
      // Contar por día
      const fecha = cita.fecha.toISOString().split('T')[0];
      resumen.citasPorDia[fecha] = (resumen.citasPorDia[fecha] || 0) + 1;
    });

    return resumen;
  }
}

export default CitaEmpleado;