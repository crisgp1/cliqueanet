import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Cliente } from './cliente.model';
import { Consignacion } from './consignacion.model';
import { Cita } from './cita.model';

// Tipos de contacto
export type TipoContacto = 'Cliente' | 'Consignatario' | 'Referencia' | 'Familiar' | 'Otro';

@Table({
  tableName: 'contactos',
  timestamps: false
})
export class Contacto extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_contacto'
  })
  id!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'tipo_contacto',
    validate: {
      isIn: [['Cliente', 'Consignatario', 'Referencia', 'Familiar', 'Otro']]
    }
  })
  tipoContacto!: TipoContacto;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  nombre!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  apellidos!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false
  })
  telefono!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  correo!: string;

  @ForeignKey(() => Cliente)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'id_cliente',
    references: {
      model: 'clientes',
      key: 'id_cliente'
    }
  })
  idCliente?: number;

  @ForeignKey(() => Consignacion)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'id_consignacion',
    references: {
      model: 'consignaciones',
      key: 'id_consignacion'
    }
  })
  idConsignacion?: number;

  // Relaciones
  @BelongsTo(() => Cliente, {
    foreignKey: 'id_cliente',
    as: 'clienteContacto'
  })
  cliente?: Cliente;

  @BelongsTo(() => Consignacion, {
    foreignKey: 'id_consignacion',
    as: 'consignacionContacto'
  })
  consignacion?: Consignacion;

  @HasMany(() => Cita, {
    foreignKey: 'id_contacto',
    as: 'citasContacto'
  })
  citas?: Cita[];

  // Métodos útiles
  getNombreCompleto(): string {
    return `${this.nombre} ${this.apellidos}`;
  }

  async getCitasPendientes(): Promise<Cita[]> {
    const ahora = new Date();
    return await Cita.findAll({
      where: {
        id_contacto: this.id,
        fecha: {
          [Op.gte]: ahora
        }
      },
      order: [['fecha', 'ASC']]
    });
  }

  async getCitasHistoricas(): Promise<Cita[]> {
    const ahora = new Date();
    return await Cita.findAll({
      where: {
        id_contacto: this.id,
        fecha: {
          [Op.lt]: ahora
        }
      },
      order: [['fecha', 'DESC']]
    });
  }

  async getUltimaCita(): Promise<Cita | null> {
    return await Cita.findOne({
      where: {
        id_contacto: this.id
      },
      order: [['fecha', 'DESC']]
    });
  }

  async getProximaCita(): Promise<Cita | null> {
    const ahora = new Date();
    return await Cita.findOne({
      where: {
        id_contacto: this.id,
        fecha: {
          [Op.gte]: ahora
        }
      },
      order: [['fecha', 'ASC']]
    });
  }

  // Método para validar si el contacto está relacionado con un cliente o una consignación
  validarRelacion(): boolean {
    if (!this.idCliente && !this.idConsignacion) {
      throw new Error('El contacto debe estar relacionado con un cliente o una consignación');
    }
    if (this.idCliente && this.idConsignacion) {
      throw new Error('El contacto no puede estar relacionado con un cliente y una consignación al mismo tiempo');
    }
    return true;
  }

  // Método para obtener todas las citas en un rango de fechas
  async getCitasEnRango(fechaInicio: Date, fechaFin: Date): Promise<Cita[]> {
    return await Cita.findAll({
      where: {
        id_contacto: this.id,
        fecha: {
          [Op.between]: [fechaInicio, fechaFin]
        }
      },
      order: [['fecha', 'ASC']]
    });
  }

  // Método para obtener el resumen de citas
  async getResumenCitas(): Promise<{
    totalCitas: number;
    citasPendientes: number;
    citasHistoricas: number;
    proximaCita: Cita | null;
    ultimaCita: Cita | null;
  }> {
    const [citasPendientes, citasHistoricas, proximaCita, ultimaCita] = await Promise.all([
      this.getCitasPendientes(),
      this.getCitasHistoricas(),
      this.getProximaCita(),
      this.getUltimaCita()
    ]);

    return {
      totalCitas: citasPendientes.length + citasHistoricas.length,
      citasPendientes: citasPendientes.length,
      citasHistoricas: citasHistoricas.length,
      proximaCita,
      ultimaCita
    };
  }
}

export default Contacto;