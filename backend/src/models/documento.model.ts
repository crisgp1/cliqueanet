// documento.model.ts

import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Transaccion } from './transaccion.model';
import { Cliente } from './cliente.model';
import { Vehiculo } from './vehiculo.model';
import { Usuario } from './usuario.model';

// Estados de documento
export type DocumentoEstado = 'pendiente' | 'aprobado' | 'rechazado';

// Tipos de documento
export type TipoDocumento = 
  'Identificación' | 
  'Comprobante de Domicilio' | 
  'Factura' | 
  'Contrato' | 
  'Carta Responsiva' | 
  'Poder Notarial' |
  'Acta Constitutiva' |
  'RFC' |
  'CURP' |
  'Comprobante de Ingresos' |
  'Estado de Cuenta' |
  'Otro';

// Permisos de acceso
export type PermisosAcceso = 'público' | 'privado' | 'restringido';

// Extensiones permitidas
export type ExtensionArchivo = '.pdf' | '.jpg' | '.png' | '.xml';

// Tipo para la configuración de validación
type ValidacionDocumento = {
  extensionesPermitidas: ExtensionArchivo[];
  tamañoMaximoMB: number;
  vigenciaRequerida?: boolean;
  antiguedadMaximaMeses?: number;
  requiereVerificacion?: boolean;
  requiereFirma?: boolean;
};

// Constantes para documentos requeridos por tipo de transacción
export const DOCUMENTOS_REQUERIDOS = {
  VENTA: ['Identificación', 'Comprobante de Domicilio', 'Factura', 'Contrato'],
  CREDITO: ['Identificación', 'Comprobante de Domicilio', 'Comprobante de Ingresos', 'Estado de Cuenta'],
  CONSIGNACION: ['Identificación', 'Comprobante de Domicilio', 'Carta Responsiva', 'Contrato'],
  PERSONA_MORAL: ['Acta Constitutiva', 'Poder Notarial', 'RFC', 'Comprobante de Domicilio']
} as const;

// Configuración de validación por tipo de documento
export const VALIDACION_DOCUMENTOS: Record<TipoDocumento, ValidacionDocumento> = {
  'Identificación': {
    extensionesPermitidas: ['.pdf', '.jpg', '.png'],
    tamañoMaximoMB: 5,
    vigenciaRequerida: true,
    antiguedadMaximaMeses: 60,
    requiereVerificacion: true
  },
  'Comprobante de Domicilio': {
    extensionesPermitidas: ['.pdf', '.jpg', '.png'],
    tamañoMaximoMB: 5,
    vigenciaRequerida: true,
    antiguedadMaximaMeses: 3
  },
  'Factura': {
    extensionesPermitidas: ['.pdf', '.xml'],
    tamañoMaximoMB: 10,
    requiereVerificacion: true
  },
  'Contrato': {
    extensionesPermitidas: ['.pdf'],
    tamañoMaximoMB: 10,
    requiereFirma: true
  },
  'Carta Responsiva': {
    extensionesPermitidas: ['.pdf'],
    tamañoMaximoMB: 5,
    requiereFirma: true
  },
  'Poder Notarial': {
    extensionesPermitidas: ['.pdf'],
    tamañoMaximoMB: 10,
    requiereVerificacion: true
  },
  'Acta Constitutiva': {
    extensionesPermitidas: ['.pdf'],
    tamañoMaximoMB: 10,
    requiereVerificacion: true
  },
  'RFC': {
    extensionesPermitidas: ['.pdf'],
    tamañoMaximoMB: 5,
    requiereVerificacion: true
  },
  'CURP': {
    extensionesPermitidas: ['.pdf'],
    tamañoMaximoMB: 2,
    requiereVerificacion: true
  },
  'Comprobante de Ingresos': {
    extensionesPermitidas: ['.pdf'],
    tamañoMaximoMB: 5,
    vigenciaRequerida: true,
    antiguedadMaximaMeses: 3
  },
  'Estado de Cuenta': {
    extensionesPermitidas: ['.pdf'],
    tamañoMaximoMB: 10,
    vigenciaRequerida: true,
    antiguedadMaximaMeses: 3
  },
  'Otro': {
    extensionesPermitidas: ['.pdf', '.jpg', '.png'],
    tamañoMaximoMB: 10
  }
};

@Table({
  tableName: 'documentos',
  timestamps: false
})
export class Documento extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_documento'
  })
  id!: number;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'id_empleado',
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  })
  idEmpleado?: number;

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

  @ForeignKey(() => Transaccion)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'id_transaccion',
    references: {
      model: 'transacciones',
      key: 'id_transaccion'
    }
  })
  idTransaccion?: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'fecha_transaccion'
  })
  fechaTransaccion?: Date;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  })
  url!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'tipo_documento',
    validate: {
      isIn: [Object.keys(VALIDACION_DOCUMENTOS)]
    }
  })
  tipoDocumento!: TipoDocumento;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'fecha_subida'
  })
  fechaSubida!: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  descripcion?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'permisos_acceso',
    defaultValue: 'privado',
    validate: {
      isIn: [['público', 'privado', 'restringido']]
    }
  })
  permisosAcceso?: PermisosAcceso;

  @Column({
    type: DataType.ENUM('pendiente', 'aprobado', 'rechazado'),
    allowNull: false,
    defaultValue: 'pendiente',
    field: 'estado'
  })
  estado!: DocumentoEstado;

  // Relaciones
  @BelongsTo(() => Usuario, { foreignKey: 'id_empleado', as: 'usuarioDocumento' })
  usuario?: Usuario;

  @BelongsTo(() => Cliente, { foreignKey: 'id_cliente', as: 'clienteDocumento' })
  cliente?: Cliente;

  @BelongsTo(() => Vehiculo, { foreignKey: 'id_vehiculo', as: 'vehiculoDocumento' })
  vehiculo?: Vehiculo;

  @BelongsTo(() => Transaccion, {
    foreignKey: 'id_transaccion',
    targetKey: 'id',
    as: 'transaccionDocumento',
    constraints: false
  })
  transaccion?: Transaccion;

  // Métodos útiles
  async getTransaccionCompleta() {
    if (!this.idTransaccion || !this.fechaTransaccion) {
      return null;
    }

    return await Transaccion.findOne({
      where: {
        id: this.idTransaccion,
        fecha: this.fechaTransaccion
      }
    });
  }

  // Método para cambiar el estado del documento
  async cambiarEstado(nuevoEstado: DocumentoEstado, idUsuario: number, comentario?: string): Promise<void> {
    this.estado = nuevoEstado;
    this.idEmpleado = idUsuario;
    if (comentario) {
      this.descripcion = this.descripcion 
        ? `${this.descripcion}\n[${new Date().toISOString()}] ${comentario}`
        : `[${new Date().toISOString()}] ${comentario}`;
    }
    await this.save();
  }

  // Método para verificar permisos de acceso
  async tieneAcceso(idUsuario: number): Promise<boolean> {
    if (this.permisosAcceso === 'público') {
      return true;
    }

    if (this.permisosAcceso === 'privado') {
      return this.idEmpleado === idUsuario;
    }

    const usuario = await Usuario.findByPk(idUsuario);
    if (!usuario) return false;
    return [1, 2].includes(usuario.id_rol);
  }

  // Método para validar el documento según su tipo
  validarDocumento(): { valido: boolean; errores: string[] } {
    const errores: string[] = [];
    const validacion = VALIDACION_DOCUMENTOS[this.tipoDocumento];
    
    // Validar extensión
    const extension = this.url.substring(this.url.lastIndexOf('.')) as ExtensionArchivo;
    if (!validacion.extensionesPermitidas.includes(extension)) {
      errores.push(`Extensión no permitida. Permitidas: ${validacion.extensionesPermitidas.join(', ')}`);
    }

    // Validar vigencia si es requerida
    if (validacion.vigenciaRequerida && validacion.antiguedadMaximaMeses) {
      const fechaLimite = new Date();
      fechaLimite.setMonth(fechaLimite.getMonth() - validacion.antiguedadMaximaMeses);
      if (this.fechaSubida < fechaLimite) {
        errores.push(`Documento vencido. Antigüedad máxima: ${validacion.antiguedadMaximaMeses} meses`);
      }
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  // Método para obtener documentos por tipo y entidad
  static async getDocumentosPorTipoYEntidad(
    tipo: TipoDocumento,
    params: {
      idCliente?: number;
      idVehiculo?: number;
      idTransaccion?: number;
      fechaTransaccion?: Date;
    }
  ): Promise<Documento[]> {
    const where: any = { tipo_documento: tipo };

    if (params.idCliente) where.id_cliente = params.idCliente;
    if (params.idVehiculo) where.idVehiculo = params.idVehiculo;
    if (params.idTransaccion) {
      where.id_transaccion = params.idTransaccion;
      if (params.fechaTransaccion) where.fecha_transaccion = params.fechaTransaccion;
    }

    return await this.findAll({
      where,
      include: [
        { model: Usuario, as: 'usuarioDocumento' },
        { model: Cliente, as: 'clienteDocumento' },
        { model: Vehiculo, as: 'vehiculoDocumento' }
      ],
      order: [['fecha_subida', 'DESC']]
    });
  }

  // Método para obtener documentos pendientes
  static async getDocumentosPendientes(diasAntiguedad: number = 30): Promise<Documento[]> {
    return await this.findAll({
      where: {
        estado: 'pendiente',
        fecha_subida: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - diasAntiguedad))
        }
      },
      include: [
        { model: Usuario, as: 'usuarioDocumento' },
        { model: Cliente, as: 'clienteDocumento' },
        { model: Vehiculo, as: 'vehiculoDocumento' }
      ],
      order: [['fecha_subida', 'ASC']]
    });
  }

  // Método para verificar documentos requeridos
  static async verificarDocumentosRequeridos(
    tipoTransaccion: keyof typeof DOCUMENTOS_REQUERIDOS,
    idCliente: number
  ): Promise<{
    completo: boolean;
    documentosFaltantes: string[];
    documentosVencidos: string[];
  }> {
    const documentosRequeridos = DOCUMENTOS_REQUERIDOS[tipoTransaccion];
    const documentosExistentes = await this.findAll({
      where: {
        id_cliente: idCliente,
        tipo_documento: {
          [Op.in]: documentosRequeridos
        },
        estado: 'aprobado'
      }
    });

    const documentosFaltantes: string[] = [];
    const documentosVencidos: string[] = [];

    documentosRequeridos.forEach(tipoDoc => {
      const documento = documentosExistentes.find(d => d.tipoDocumento === tipoDoc);
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
}

export default Documento;