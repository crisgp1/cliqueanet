"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Documento = exports.VALIDACION_DOCUMENTOS = exports.DOCUMENTOS_REQUERIDOS = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
const transaccion_model_1 = require("./transaccion.model");
const cliente_model_1 = require("./cliente.model");
const vehiculo_model_1 = require("./vehiculo.model");
const usuario_model_1 = require("./usuario.model");
// Constantes para documentos requeridos por tipo de transacción
exports.DOCUMENTOS_REQUERIDOS = {
    VENTA: ['Identificación', 'Comprobante de Domicilio', 'Factura', 'Contrato'],
    CREDITO: ['Identificación', 'Comprobante de Domicilio', 'Comprobante de Ingresos', 'Estado de Cuenta'],
    CONSIGNACION: ['Identificación', 'Comprobante de Domicilio', 'Carta Responsiva', 'Contrato'],
    PERSONA_MORAL: ['Acta Constitutiva', 'Poder Notarial', 'RFC', 'Comprobante de Domicilio']
};
// Configuración de validación por tipo de documento
exports.VALIDACION_DOCUMENTOS = {
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
let Documento = class Documento extends sequelize_typescript_1.Model {
    // Métodos útiles
    getTransaccionCompleta() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.idTransaccion || !this.fechaTransaccion) {
                return null;
            }
            return yield transaccion_model_1.Transaccion.findOne({
                where: {
                    id: this.idTransaccion,
                    fecha: this.fechaTransaccion
                }
            });
        });
    }
    // Método para cambiar el estado del documento
    cambiarEstado(nuevoEstado, idUsuario, comentario) {
        return __awaiter(this, void 0, void 0, function* () {
            this.estado = nuevoEstado;
            this.idEmpleado = idUsuario;
            if (comentario) {
                this.descripcion = this.descripcion
                    ? `${this.descripcion}\n[${new Date().toISOString()}] ${comentario}`
                    : `[${new Date().toISOString()}] ${comentario}`;
            }
            yield this.save();
        });
    }
    // Método para verificar permisos de acceso
    tieneAcceso(idUsuario) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.permisosAcceso === 'público') {
                return true;
            }
            if (this.permisosAcceso === 'privado') {
                return this.idEmpleado === idUsuario;
            }
            const usuario = yield usuario_model_1.Usuario.findByPk(idUsuario);
            if (!usuario)
                return false;
            return [1, 2].includes(usuario.id_rol);
        });
    }
    // Método para validar el documento según su tipo
    validarDocumento() {
        const errores = [];
        const validacion = exports.VALIDACION_DOCUMENTOS[this.tipoDocumento];
        // Validar extensión
        const extension = this.url.substring(this.url.lastIndexOf('.'));
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
    static getDocumentosPorTipoYEntidad(tipo, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = { tipo_documento: tipo };
            if (params.idCliente)
                where.id_cliente = params.idCliente;
            if (params.idVehiculo)
                where.id_vehiculo = params.idVehiculo;
            if (params.idTransaccion) {
                where.id_transaccion = params.idTransaccion;
                if (params.fechaTransaccion)
                    where.fecha_transaccion = params.fechaTransaccion;
            }
            return yield this.findAll({
                where,
                include: [
                    { model: usuario_model_1.Usuario, as: 'usuarioDocumento' },
                    { model: cliente_model_1.Cliente, as: 'clienteDocumento' },
                    { model: vehiculo_model_1.Vehiculo, as: 'vehiculoDocumento' }
                ],
                order: [['fecha_subida', 'DESC']]
            });
        });
    }
    // Método para obtener documentos pendientes
    static getDocumentosPendientes() {
        return __awaiter(this, arguments, void 0, function* (diasAntiguedad = 30) {
            return yield this.findAll({
                where: {
                    estado: 'pendiente',
                    fecha_subida: {
                        [sequelize_1.Op.gte]: new Date(new Date().setDate(new Date().getDate() - diasAntiguedad))
                    }
                },
                include: [
                    { model: usuario_model_1.Usuario, as: 'usuarioDocumento' },
                    { model: cliente_model_1.Cliente, as: 'clienteDocumento' },
                    { model: vehiculo_model_1.Vehiculo, as: 'vehiculoDocumento' }
                ],
                order: [['fecha_subida', 'ASC']]
            });
        });
    }
    // Método para verificar documentos requeridos
    static verificarDocumentosRequeridos(tipoTransaccion, idCliente) {
        return __awaiter(this, void 0, void 0, function* () {
            const documentosRequeridos = exports.DOCUMENTOS_REQUERIDOS[tipoTransaccion];
            const documentosExistentes = yield this.findAll({
                where: {
                    id_cliente: idCliente,
                    tipo_documento: {
                        [sequelize_1.Op.in]: documentosRequeridos
                    },
                    estado: 'aprobado'
                }
            });
            const documentosFaltantes = [];
            const documentosVencidos = [];
            documentosRequeridos.forEach(tipoDoc => {
                const documento = documentosExistentes.find(d => d.tipoDocumento === tipoDoc);
                if (!documento) {
                    documentosFaltantes.push(tipoDoc);
                }
                else {
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
        });
    }
};
exports.Documento = Documento;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_documento'
    }),
    __metadata("design:type", Number)
], Documento.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => usuario_model_1.Usuario),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: 'id_empleado',
        references: {
            model: 'usuarios',
            key: 'id_usuario'
        }
    }),
    __metadata("design:type", Number)
], Documento.prototype, "idEmpleado", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => cliente_model_1.Cliente),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: 'id_cliente',
        references: {
            model: 'clientes',
            key: 'id_cliente'
        }
    }),
    __metadata("design:type", Number)
], Documento.prototype, "idCliente", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => vehiculo_model_1.Vehiculo),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: 'id_vehiculo',
        references: {
            model: 'vehiculos',
            key: 'id_vehiculo'
        }
    }),
    __metadata("design:type", Number)
], Documento.prototype, "idVehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => transaccion_model_1.Transaccion),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: 'id_transaccion'
    }),
    __metadata("design:type", Number)
], Documento.prototype, "idTransaccion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
        field: 'fecha_transaccion'
    }),
    __metadata("design:type", Date)
], Documento.prototype, "fechaTransaccion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: false,
        validate: {
            isUrl: true,
            notEmpty: true
        }
    }),
    __metadata("design:type", String)
], Documento.prototype, "url", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        field: 'tipo_documento',
        validate: {
            isIn: [Object.keys(exports.VALIDACION_DOCUMENTOS)]
        }
    }),
    __metadata("design:type", String)
], Documento.prototype, "tipoDocumento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW,
        field: 'fecha_subida'
    }),
    __metadata("design:type", Date)
], Documento.prototype, "fechaSubida", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true
    }),
    __metadata("design:type", String)
], Documento.prototype, "descripcion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
        field: 'permisos_acceso',
        defaultValue: 'privado',
        validate: {
            isIn: [['público', 'privado', 'restringido']]
        }
    }),
    __metadata("design:type", String)
], Documento.prototype, "permisosAcceso", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('pendiente', 'aprobado', 'rechazado'),
        allowNull: false,
        defaultValue: 'pendiente',
        field: 'estado'
    }),
    __metadata("design:type", String)
], Documento.prototype, "estado", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => usuario_model_1.Usuario, { foreignKey: 'id_empleado', as: 'usuarioDocumento' }),
    __metadata("design:type", usuario_model_1.Usuario)
], Documento.prototype, "usuario", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => cliente_model_1.Cliente, { foreignKey: 'id_cliente', as: 'clienteDocumento' }),
    __metadata("design:type", cliente_model_1.Cliente)
], Documento.prototype, "cliente", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => vehiculo_model_1.Vehiculo, { foreignKey: 'id_vehiculo', as: 'vehiculoDocumento' }),
    __metadata("design:type", vehiculo_model_1.Vehiculo)
], Documento.prototype, "vehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => transaccion_model_1.Transaccion, {
        foreignKey: 'id_transaccion',
        targetKey: 'id',
        as: 'transaccionDocumento',
        constraints: false
    }),
    __metadata("design:type", transaccion_model_1.Transaccion)
], Documento.prototype, "transaccion", void 0);
exports.Documento = Documento = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'documentos',
        timestamps: false
    })
], Documento);
exports.default = Documento;
