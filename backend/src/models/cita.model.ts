import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import { Usuario } from './usuario.model';
import { Contacto } from './contacto.model';
import { Vehiculo } from './vehiculo.model';
import { CitaEmpleado } from './cita-empleado.model';
import { Op } from 'sequelize';

// Tipos de cita
export type TipoCita = 'Venta' | 'Prueba de Manejo' | 'Revisión' | 'Entrega' | 'Seguimiento';

@Table({
  tableName: 'citas',
  timestamps: false
})
export class Cita extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_cita'
  })
  id!: number;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_empleado_creador',
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  })
  idEmpleadoCreador!: number;

  @ForeignKey(() => Contacto)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_contacto',
    references: {
      model: 'contactos',
      key: 'id_contacto'
    }
  })
  idContacto!: number;

  @ForeignKey(() => Vehiculo)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'id_vehiculo',
    references: {
      model: 'vehiculos',
      key: 'id_vehiculo'
    }
  })
  idVehiculo?: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'tipo_cita',
    validate: {
      isIn: [['Venta', 'Prueba de Manejo', 'Revisión', 'Entrega', 'Seguimiento']]
    }
  })
  tipoCita!: TipoCita;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  fecha!: Date;

  @Column({
    type: DataType.TIME,
    allowNull: false
  })
  hora!: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: false
  })
  lugar!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      max: 3
    }
  })
  reagendaciones!: number;

  // Relaciones
  @BelongsTo(() => Usuario, {
    foreignKey: 'id_empleado_creador',
    as: 'creador'
  })
  creador!: Usuario;

  @BelongsTo(() => Contacto, {
    foreignKey: 'id_contacto',
    as: 'contactoCita'
  })
  contacto!: Contacto;

  @BelongsTo(() => Vehiculo, {
    foreignKey: 'id_vehiculo',
    as: 'vehiculoCita'
  })
  vehiculo?: Vehiculo;

  @BelongsToMany(() => Usuario, {
    through: () => CitaEmpleado,
    foreignKey: 'id_cita',
    otherKey: 'id_empleado',
    as: 'usuariosCita'
  })
  empleados?: Usuario[];

  // Métodos útiles
  async reagendar(nuevaFecha: Date, nuevaHora: string): Promise<void> {
    if (this.reagendaciones >= 3) {
      throw new Error('No se puede reagendar la cita más de 3 veces');
    }

    this.fecha = nuevaFecha;
    this.hora = nuevaHora;
    this.reagendaciones += 1;
    await this.save();
  }

  async asignarEmpleados(empleadosIds: number[]): Promise<void> {
    await CitaEmpleado.destroy({
      where: { id_cita: this.id }
    });

    await Promise.all(
      empleadosIds.map(idEmpleado =>
        CitaEmpleado.create({
          id_cita: this.id,
          id_empleado: idEmpleado,
          fecha_asignacion: new Date()
        })
      )
    );
  }

  static async getCitasDelDia(fecha: Date = new Date()): Promise<Cita[]> {
    const inicio = new Date(fecha.setHours(0, 0, 0, 0));
    const fin = new Date(fecha.setHours(23, 59, 59, 999));

    return await this.findAll({
      where: {
        fecha: {
          [Op.between]: [inicio, fin]
        }
      },
      include: [
        {
          model: Contacto,
          as: 'contactoCita'
        },
        {
          model: Vehiculo,
          as: 'vehiculoCita'
        },
        {
          model: Usuario,
          as: 'usuariosCita'
        }
      ],
      order: [['hora', 'ASC']]
    });
  }

  static async getCitasPorEmpleado(idEmpleado: number, inicio?: Date, fin?: Date): Promise<Cita[]> {
    const where: any = {
      '$usuariosCita.id$': idEmpleado
    };

    if (inicio && fin) {
      where.fecha = {
        [Op.between]: [inicio, fin]
      };
    }

    return await this.findAll({
      where,
      include: [
        {
          model: Contacto,
          as: 'contactoCita'
        },
        {
          model: Vehiculo,
          as: 'vehiculoCita'
        },
        {
          model: Usuario,
          as: 'usuariosCita'
        }
      ],
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });
  }

  // Método para verificar disponibilidad
  static async verificarDisponibilidad(fecha: Date, hora: string): Promise<boolean> {
    const citasExistentes = await this.count({
      where: {
        fecha,
        hora
      }
    });

    return citasExistentes === 0;
  }

  // Método para obtener el resumen de citas
  static async getResumenCitas(inicio: Date, fin: Date): Promise<{
    total: number;
    porTipo: { [key in TipoCita]?: number };
    reagendadas: number;
  }> {
    const citas = await this.findAll({
      where: {
        fecha: {
          [Op.between]: [inicio, fin]
        }
      }
    });

    const resumen = {
      total: citas.length,
      porTipo: {} as { [key in TipoCita]?: number },
      reagendadas: 0
    };

    citas.forEach(cita => {
      resumen.porTipo[cita.tipoCita] = (resumen.porTipo[cita.tipoCita] || 0) + 1;
      if (cita.reagendaciones > 0) {
        resumen.reagendadas++;
      }
    });

    return resumen;
  }
}

export default Cita;