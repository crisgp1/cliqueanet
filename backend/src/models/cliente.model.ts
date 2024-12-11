import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, BeforeValidate } from 'sequelize-typescript';
import { TipoIdentificacion } from './catalogs/tipo-identificacion.model';
import { Credito } from './credito.model';
import { Transaccion } from './transaccion.model';
import { Contacto } from './contacto.model';
import { Documento } from './documento.model';

@Table({
  tableName: 'clientes',
  timestamps: false
})
export class Cliente extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_cliente'
  })
  id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  nombre!: string;

  @Column({
    type: DataType.STRING(18),
    allowNull: true,
    validate: {
      isValidCurp(value: string) {
        if (this.tipoPersona === 'Física' && !value) {
          throw new Error('El CURP es obligatorio para personas físicas');
        }
      }
    }
  })
  curp!: string;

  @ForeignKey(() => TipoIdentificacion)
  @Column({
    type: DataType.INTEGER,
    field: 'id_tipo_identificacion',
    references: {
      model: 'tipos_identificacion',
      key: 'id_tipo_identificacion'
    }
  })
  idTipoIdentificacion?: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'num_identificacion'
  })
  numIdentificacion!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'fecha_nacimiento'
  })
  fechaNacimiento!: Date;

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

  @Column({
    type: DataType.STRING(200),
    allowNull: false
  })
  domicilio!: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    defaultValue: 'Física',
    field: 'tipo_persona',
    validate: {
      isIn: [['Física', 'Moral']]
    }
  })
  tipoPersona!: 'Física' | 'Moral';

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
    field: 'razon_social',
    validate: {
      isValidRazonSocial(value: string) {
        if (this.tipoPersona === 'Moral' && !value) {
          throw new Error('La razón social es obligatoria para personas morales');
        }
      }
    }
  })
  razonSocial?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'representante_legal'
  })
  representanteLegal?: string;

  @Column({
    type: DataType.STRING(13),
    allowNull: true,
    validate: {
      isValidRfc(value: string) {
        if (this.tipoPersona === 'Moral' && !value) {
          throw new Error('El RFC es obligatorio para personas morales');
        }
        if (value && value.trim() !== '') {
          if (value.length !== 12 && value.length !== 13) {
            throw new Error('El RFC debe tener 12 o 13 caracteres');
          }
          if (!/^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(value)) {
            throw new Error('El formato del RFC no es válido');
          }
        }
      }
    }
  })
  rfc?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'fecha_constitucion',
    validate: {
      isValidFechaConstitucion(value: Date) {
        if (this.tipoPersona === 'Moral' && !value) {
          throw new Error('La fecha de constitución es obligatoria para personas morales');
        }
      }
    }
  })
  fechaConstitucion?: Date;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'regimen_fiscal',
    validate: {
      isValidRegimenFiscal(value: string) {
        if (this.tipoPersona === 'Moral' && !value) {
          throw new Error('El régimen fiscal es obligatorio para personas morales');
        }
      }
    }
  })
  regimenFiscal?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: 'acta_constitutiva_url'
  })
  actaConstitutivaUrl?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: 'poder_notarial_url'
  })
  poderNotarialUrl?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: 'comprobante_domicilio_url'
  })
  comprobanteDomicilioUrl?: string;

  // Relaciones
  @BelongsTo(() => TipoIdentificacion, {
    foreignKey: 'id_tipo_identificacion'
  })
  tipoIdentificacion?: TipoIdentificacion;

  @HasMany(() => Credito, {
    foreignKey: 'id_cliente'
  })
  creditos?: Credito[];

  @HasMany(() => Transaccion, {
    foreignKey: 'id_cliente'
  })
  transacciones?: Transaccion[];

  @HasMany(() => Contacto, {
    foreignKey: 'id_cliente'
  })
  contactos?: Contacto[];

  @HasMany(() => Documento, {
    foreignKey: 'id_cliente'
  })
  documentos?: Documento[];

  @BeforeValidate
  static async validatePersonaFields(instance: Cliente) {
    if (instance.tipoPersona === 'Moral') {
      if (!instance.razonSocial) {
        throw new Error('La razón social es obligatoria para personas morales');
      }
      if (!instance.rfc) {
        throw new Error('El RFC es obligatorio para personas morales');
      }
      if (!instance.fechaConstitucion) {
        throw new Error('La fecha de constitución es obligatoria para personas morales');
      }
      if (!instance.regimenFiscal) {
        throw new Error('El régimen fiscal es obligatorio para personas morales');
      }
    } else if (instance.tipoPersona === 'Física') {
      if (!instance.curp) {
        throw new Error('El CURP es obligatorio para personas físicas');
      }
    }
  }
}

export default Cliente;