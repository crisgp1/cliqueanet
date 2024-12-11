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
exports.Transaccion = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
const usuario_model_1 = require("./usuario.model");
const cliente_model_1 = require("./cliente.model");
const vehiculo_model_1 = require("./vehiculo.model");
const credito_model_1 = require("./credito.model");
const tipo_transaccion_model_1 = require("./catalogs/tipo-transaccion.model");
const venta_model_1 = require("./venta.model");
const documento_model_1 = require("./documento.model");
let Transaccion = class Transaccion extends sequelize_typescript_1.Model {
    // Métodos útiles
    isPagoCredito() {
        return this.idTipoTransaccion === 3; // ID 3 para pagos de crédito
    }
    // Método para obtener el estado de la transacción
    getEstadoTransaccion() {
        return __awaiter(this, void 0, void 0, function* () {
            const documentos = yield this.$get('documentos');
            if (!(documentos === null || documentos === void 0 ? void 0 : documentos.length))
                return 'Pendiente';
            const documentosRequeridos = ['Contrato', 'Factura'];
            const tieneDocumentosRequeridos = documentosRequeridos.every(tipo => documentos.some(doc => doc.tipoDocumento === tipo && doc.estado === 'aprobado'));
            if (tieneDocumentosRequeridos)
                return 'Completada';
            if (documentos.some(doc => doc.estado === 'rechazado'))
                return 'Cancelada';
            return 'En Proceso';
        });
    }
    // Método para obtener el resumen de la transacción
    getResumenTransaccion() {
        return __awaiter(this, void 0, void 0, function* () {
            const [tipoTransaccion, documentos, estado] = yield Promise.all([
                this.$get('tipoTransaccion'),
                this.$get('documentos'),
                this.getEstadoTransaccion()
            ]);
            const documentosEstado = {
                pendientes: (documentos === null || documentos === void 0 ? void 0 : documentos.filter(d => d.estado === 'pendiente').length) || 0,
                aprobados: (documentos === null || documentos === void 0 ? void 0 : documentos.filter(d => d.estado === 'aprobado').length) || 0,
                rechazados: (documentos === null || documentos === void 0 ? void 0 : documentos.filter(d => d.estado === 'rechazado').length) || 0
            };
            const resumen = {
                tipo: tipoTransaccion === null || tipoTransaccion === void 0 ? void 0 : tipoTransaccion.nombre,
                monto: this.monto,
                fecha: this.fecha,
                cliente: {
                    id: this.idCliente,
                    nombre: this.nombreCliente || ''
                },
                vehiculo: {
                    id: this.idVehiculo,
                    marca: this.marcaVehiculo || '',
                    modelo: this.modeloVehiculo || ''
                },
                documentos: documentosEstado,
                estado
            };
            if (this.idCredito) {
                const credito = yield this.$get('credito');
                resumen.credito = {
                    id: this.idCredito,
                    monto: (credito === null || credito === void 0 ? void 0 : credito.cantidad) || 0,
                    estado: credito ? 'Activo' : 'Pendiente'
                };
            }
            return resumen;
        });
    }
    // Método estático para obtener transacciones por período
    static getTransaccionesPorPeriodo(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if ((options === null || options === void 0 ? void 0 : options.startDate) && (options === null || options === void 0 ? void 0 : options.endDate)) {
                where.fecha = {
                    [sequelize_1.Op.between]: [options.startDate, options.endDate]
                };
            }
            if (options === null || options === void 0 ? void 0 : options.tipo) {
                where['$tipoTransaccion.nombre$'] = options.tipo;
            }
            if (options === null || options === void 0 ? void 0 : options.idCliente) {
                where.id_cliente = options.idCliente;
            }
            if (options === null || options === void 0 ? void 0 : options.idVehiculo) {
                where.id_vehiculo = options.idVehiculo;
            }
            const transacciones = yield this.findAll({
                where,
                include: [
                    { model: tipo_transaccion_model_1.TipoTransaccion, as: 'tipoTransaccion' },
                    { model: cliente_model_1.Cliente, as: 'cliente' },
                    { model: vehiculo_model_1.Vehiculo, as: 'vehiculo' },
                    { model: credito_model_1.Credito, as: 'credito' },
                    { model: documento_model_1.Documento, as: 'documentos' }
                ]
            });
            const transaccionesConEstado = yield Promise.all(transacciones.map((t) => __awaiter(this, void 0, void 0, function* () {
                return ({
                    transaccion: t,
                    estado: yield t.getEstadoTransaccion()
                });
            })));
            const montoTotal = transacciones.reduce((sum, t) => sum + t.monto, 0);
            const transaccionesPorTipo = transacciones.reduce((acc, t) => {
                var _a;
                const tipo = (_a = t.tipoTransaccion) === null || _a === void 0 ? void 0 : _a.nombre;
                acc[tipo] = (acc[tipo] || 0) + 1;
                return acc;
            }, {});
            const transaccionesPorEstado = transaccionesConEstado.reduce((acc, { estado }) => {
                acc[estado] = (acc[estado] || 0) + 1;
                return acc;
            }, {});
            return {
                transacciones,
                totalTransacciones: transacciones.length,
                montoTotal,
                promedioMonto: montoTotal / transacciones.length,
                transaccionesPorTipo,
                transaccionesPorEstado
            };
        });
    }
};
exports.Transaccion = Transaccion;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_transaccion'
    }),
    __metadata("design:type", Number)
], Transaccion.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        primaryKey: true,
        field: 'fecha',
        validate: {
            isDate: true,
            isAfter: '2020-01-01'
        }
    }),
    __metadata("design:type", Date)
], Transaccion.prototype, "fecha", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => usuario_model_1.Usuario),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'id_usuario',
        references: {
            model: 'usuarios',
            key: 'id_usuario'
        }
    }),
    __metadata("design:type", Number)
], Transaccion.prototype, "idUsuario", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => cliente_model_1.Cliente),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'id_cliente',
        references: {
            model: 'clientes',
            key: 'id_cliente'
        }
    }),
    __metadata("design:type", Number)
], Transaccion.prototype, "idCliente", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => vehiculo_model_1.Vehiculo),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'id_vehiculo',
        references: {
            model: 'vehiculos',
            key: 'id_vehiculo'
        }
    }),
    __metadata("design:type", Number)
], Transaccion.prototype, "idVehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => credito_model_1.Credito),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: 'id_credito',
        references: {
            model: 'creditos',
            key: 'id_credito'
        }
    }),
    __metadata("design:type", Number)
], Transaccion.prototype, "idCredito", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => tipo_transaccion_model_1.TipoTransaccion),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'id_tipo_transaccion',
        references: {
            model: 'tipos_transaccion',
            key: 'id_tipo_transaccion'
        }
    }),
    __metadata("design:type", Number)
], Transaccion.prototype, "idTipoTransaccion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'monto',
        validate: {
            min: 0
        }
    }),
    __metadata("design:type", Number)
], Transaccion.prototype, "monto", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        field: 'nombre_cliente'
    }),
    __metadata("design:type", String)
], Transaccion.prototype, "nombreCliente", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
        field: 'marca_vehiculo'
    }),
    __metadata("design:type", String)
], Transaccion.prototype, "marcaVehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
        field: 'modelo_vehiculo'
    }),
    __metadata("design:type", String)
], Transaccion.prototype, "modeloVehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => usuario_model_1.Usuario, { foreignKey: 'id_usuario', as: 'usuarioTransaccion' }),
    __metadata("design:type", usuario_model_1.Usuario)
], Transaccion.prototype, "usuario", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => cliente_model_1.Cliente, { foreignKey: 'id_cliente', as: 'cliente' }),
    __metadata("design:type", cliente_model_1.Cliente)
], Transaccion.prototype, "cliente", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => vehiculo_model_1.Vehiculo, { foreignKey: 'id_vehiculo', as: 'vehiculo' }),
    __metadata("design:type", vehiculo_model_1.Vehiculo)
], Transaccion.prototype, "vehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => credito_model_1.Credito, { foreignKey: 'id_credito', as: 'credito' }),
    __metadata("design:type", credito_model_1.Credito)
], Transaccion.prototype, "credito", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => tipo_transaccion_model_1.TipoTransaccion, { foreignKey: 'id_tipo_transaccion', as: 'tipoTransaccion' }),
    __metadata("design:type", tipo_transaccion_model_1.TipoTransaccion)
], Transaccion.prototype, "tipoTransaccion", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => venta_model_1.Venta, { foreignKey: 'id_transaccion', as: 'venta' }),
    __metadata("design:type", venta_model_1.Venta)
], Transaccion.prototype, "venta", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => documento_model_1.Documento, { foreignKey: 'id_transaccion', as: 'documentos' }),
    __metadata("design:type", Array)
], Transaccion.prototype, "documentos", void 0);
exports.Transaccion = Transaccion = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'transacciones',
        timestamps: false,
        schema: 'public',
        comment: 'Tabla particionada por fecha'
    })
], Transaccion);
exports.default = Transaccion;
