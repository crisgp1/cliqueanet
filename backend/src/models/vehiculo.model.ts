import { Table, Column, Model, DataType, HasMany, HasOne } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Transaccion } from './transaccion.model';
import { Consignacion } from './consignacion.model';
import { Cita } from './cita.model';
import { Documento } from './documento.model';
import { AjusteValorVehiculo } from './ajuste-valor-vehiculo.model';

// Tipos comunes de marcas y modelos
export type MarcaVehiculo = 'Toyota' | 'Honda' | 'Nissan' | 'Volkswagen' | 'Ford' | 'Chevrolet' | 'Otro';

@Table({
  tableName: 'vehiculos',
  timestamps: false
})
export class Vehiculo extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_vehiculo'
  })
  id!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  })
  marca!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  })
  modelo!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'anio',
    validate: {
      min: 1900,
      max: new Date().getFullYear() + 1
    }
  })
  anio!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  })
  precio!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'num_serie',
    validate: {
      notEmpty: true,
      len: [17, 17] // VIN estándar
    }
  })
  numSerie!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  })
  color!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'num_motor',
    validate: {
      notEmpty: true
    }
  })
  numMotor!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'num_factura'
  })
  numFactura?: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true
  })
  placas?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'tarjeta_circulacion'
  })
  tarjetaCirculacion?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'comentarios_internos'
  })
  comentariosInternos?: string;

  // Relaciones
  @HasMany(() => Transaccion, { foreignKey: 'id_vehiculo', as: 'transacciones' })
  transacciones?: Transaccion[];

  @HasOne(() => Consignacion, { foreignKey: 'id_vehiculo', as: 'consignacionVehiculo' })
  consignacion?: Consignacion;

  @HasMany(() => Cita, { foreignKey: 'id_vehiculo', as: 'citas' })
  citas?: Cita[];

  @HasMany(() => Documento, { foreignKey: 'id_vehiculo', as: 'documentos' })
  documentos?: Documento[];

  @HasMany(() => AjusteValorVehiculo, { foreignKey: 'id_vehiculo', as: 'ajustes' })
  ajustesValor?: AjusteValorVehiculo[];

  // Métodos útiles
  getNombreCompleto(): string {
    return `${this.marca} ${this.modelo} ${this.anio}`;
  }

  async getValorActual(): Promise<number> {
    const ajustes = await this.getAjustesValor();
    const totalAjustes = ajustes?.reduce((total, ajuste) => total + ajuste.monto_ajuste, 0) || 0;
    return this.precio + totalAjustes;
  }

  async getAjustesValor(): Promise<AjusteValorVehiculo[]> {
    return await AjusteValorVehiculo.findAll({
      where: { id_vehiculo: this.id },
      order: [['fecha', 'DESC']]
    });
  }

  async getDocumentosPorTipo(tipo: string): Promise<Documento[]> {
    return await Documento.findAll({
      where: {
        id_vehiculo: this.id,
        tipo_documento: tipo
      },
      order: [['fecha_subida', 'DESC']]
    });
  }

  async getCitasPendientes(): Promise<Cita[]> {
    return await Cita.findAll({
      where: {
        id_vehiculo: this.id,
        fecha: {
          [Op.gte]: new Date()
        }
      },
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });
  }

  async getHistorialTransacciones(): Promise<Transaccion[]> {
    return await Transaccion.findAll({
      where: { id_vehiculo: this.id },
      include: [
        { model: Documento, as: 'documentos' }
      ],
      order: [['fecha', 'DESC']]
    });
  }

  // Método para verificar si el vehículo está en consignación
  async estaEnConsignacion(): Promise<boolean> {
    const consignacion = await Consignacion.findOne({
      where: { id_vehiculo: this.id }
    });
    return !!consignacion;
  }

  // Método para obtener el historial de precios
  async getHistorialPrecios(): Promise<{
    precioOriginal: number;
    ajustes: AjusteValorVehiculo[];
    precioActual: number;
  }> {
    const ajustes = await this.getAjustesValor();
    const precioActual = await this.getValorActual();

    return {
      precioOriginal: this.precio,
      ajustes,
      precioActual
    };
  }

  // Método estático para buscar vehículos disponibles
  static async getVehiculosDisponibles(filtros?: {
    marca?: string;
    modelo?: string;
    anioMin?: number;
    anioMax?: number;
    precioMin?: number;
    precioMax?: number;
  }): Promise<Vehiculo[]> {
    const where: any = {};

    if (filtros?.marca) where.marca = filtros.marca;
    if (filtros?.modelo) where.modelo = filtros.modelo;
    if (filtros?.anioMin) where.anio = { ...where.anio, [Op.gte]: filtros.anioMin };
    if (filtros?.anioMax) where.anio = { ...where.anio, [Op.lte]: filtros.anioMax };
    if (filtros?.precioMin) where.precio = { ...where.precio, [Op.gte]: filtros.precioMin };
    if (filtros?.precioMax) where.precio = { ...where.precio, [Op.lte]: filtros.precioMax };

    return await this.findAll({
      where,
      include: [
        {
          model: Transaccion,
          as: 'transacciones',
          required: false
        },
        {
          model: Consignacion,
          as: 'consignacionVehiculo',
          required: false
        }
      ],
      order: [['marca', 'ASC'], ['modelo', 'ASC'], ['anio', 'DESC']]
    });
  }
}

export default Vehiculo;