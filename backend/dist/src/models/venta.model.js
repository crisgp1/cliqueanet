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
exports.Venta = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
const transaccion_model_1 = require("./transaccion.model");
const empleado_model_1 = require("./empleado.model");
const venta_empleado_model_1 = require("./venta-empleado.model");
const documento_model_1 = require("./documento.model");
let Venta = class Venta extends sequelize_typescript_1.Model {
    // Métodos útiles
    getTotalComisiones() {
        return __awaiter(this, void 0, void 0, function* () {
            const ventaEmpleados = yield this.$get('ventaEmpleados');
            return (ventaEmpleados === null || ventaEmpleados === void 0 ? void 0 : ventaEmpleados.reduce((total, ve) => total + (ve.comision || 0), 0)) || 0;
        });
    }
    getMontoVenta() {
        return __awaiter(this, void 0, void 0, function* () {
            const transaccion = yield this.$get('transaccion', {
                include: [{ model: documento_model_1.Documento, as: 'documentos' }]
            });
            return (transaccion === null || transaccion === void 0 ? void 0 : transaccion.monto) || 0;
        });
    }
    // Método para obtener el estado de la venta
    getEstadoVenta() {
        return __awaiter(this, void 0, void 0, function* () {
            const transaccion = yield this.$get('transaccion');
            const documentos = yield this.$get('documentos');
            if (!transaccion)
                return 'Pendiente';
            const documentosRequeridos = ['Contrato', 'Factura'];
            const tieneDocumentosRequeridos = documentosRequeridos.every(tipo => documentos === null || documentos === void 0 ? void 0 : documentos.some(doc => doc.tipoDocumento === tipo && doc.estado === 'aprobado'));
            if (tieneDocumentosRequeridos)
                return 'Completada';
            if (documentos === null || documentos === void 0 ? void 0 : documentos.some(doc => doc.estado === 'rechazado'))
                return 'Cancelada';
            return 'En Proceso';
        });
    }
    // Método para obtener el resumen de la venta
    getResumenVenta() {
        return __awaiter(this, void 0, void 0, function* () {
            const [montoVenta, totalComisiones, documentos, estado] = yield Promise.all([
                this.getMontoVenta(),
                this.getTotalComisiones(),
                this.$get('documentos'),
                this.getEstadoVenta()
            ]);
            const documentosEstado = {
                pendientes: (documentos === null || documentos === void 0 ? void 0 : documentos.filter(d => d.estado === 'pendiente').length) || 0,
                aprobados: (documentos === null || documentos === void 0 ? void 0 : documentos.filter(d => d.estado === 'aprobado').length) || 0,
                rechazados: (documentos === null || documentos === void 0 ? void 0 : documentos.filter(d => d.estado === 'rechazado').length) || 0
            };
            const ventaEmpleados = yield this.$get('ventaEmpleados');
            return {
                montoVenta,
                totalComisiones,
                porcentajeComisiones: montoVenta ? (totalComisiones / montoVenta) * 100 : 0,
                empleadosParticipantes: (ventaEmpleados === null || ventaEmpleados === void 0 ? void 0 : ventaEmpleados.length) || 0,
                documentosEstado,
                estado
            };
        });
    }
    // Método estático para obtener ventas por período
    static getVentasPorPeriodo(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if ((options === null || options === void 0 ? void 0 : options.startDate) && (options === null || options === void 0 ? void 0 : options.endDate)) {
                where['$transaccion.fecha$'] = {
                    [sequelize_1.Op.between]: [options.startDate, options.endDate]
                };
            }
            const ventas = yield this.findAll({
                where,
                include: [
                    {
                        model: transaccion_model_1.Transaccion,
                        as: 'transaccion',
                        required: true
                    },
                    {
                        model: venta_empleado_model_1.VentaEmpleado,
                        as: 'ventaEmpleados'
                    },
                    {
                        model: documento_model_1.Documento,
                        as: 'documentos'
                    }
                ]
            });
            const ventasConEstado = yield Promise.all(ventas.map((venta) => __awaiter(this, void 0, void 0, function* () {
                return ({
                    venta,
                    estado: yield venta.getEstadoVenta()
                });
            })));
            const ventasFiltradas = (options === null || options === void 0 ? void 0 : options.estado)
                ? ventasConEstado.filter(v => v.estado === options.estado).map(v => v.venta)
                : ventas;
            const montoTotal = yield ventasFiltradas.reduce((promise, venta) => __awaiter(this, void 0, void 0, function* () { return (yield promise) + (yield venta.getMontoVenta()); }), Promise.resolve(0));
            const comisionesTotal = yield ventasFiltradas.reduce((promise, venta) => __awaiter(this, void 0, void 0, function* () { return (yield promise) + (yield venta.getTotalComisiones()); }), Promise.resolve(0));
            const ventasPorEstado = ventasConEstado.reduce((acc, { estado }) => {
                acc[estado] = (acc[estado] || 0) + 1;
                return acc;
            }, {});
            return {
                ventas: ventasFiltradas,
                totalVentas: ventasFiltradas.length,
                montoTotal,
                comisionesTotal,
                promedioComisiones: ventasFiltradas.length ? comisionesTotal / ventasFiltradas.length : 0,
                ventasPorEstado
            };
        });
    }
};
exports.Venta = Venta;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_venta'
    }),
    __metadata("design:type", Number)
], Venta.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => transaccion_model_1.Transaccion),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'id_transaccion',
        references: {
            model: 'transacciones',
            key: 'id_transaccion'
        }
    }),
    __metadata("design:type", Number)
], Venta.prototype, "idTransaccion", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => transaccion_model_1.Transaccion, {
        foreignKey: 'id_transaccion',
        as: 'transaccion'
    }),
    __metadata("design:type", transaccion_model_1.Transaccion)
], Venta.prototype, "transaccion", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => empleado_model_1.Empleado, {
        through: () => venta_empleado_model_1.VentaEmpleado,
        foreignKey: 'id_venta',
        otherKey: 'id_empleado',
        as: 'empleados'
    }),
    __metadata("design:type", Array)
], Venta.prototype, "empleados", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => venta_empleado_model_1.VentaEmpleado, {
        foreignKey: 'id_venta',
        as: 'ventaEmpleados'
    }),
    __metadata("design:type", Array)
], Venta.prototype, "ventaEmpleados", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => documento_model_1.Documento, {
        foreignKey: 'id_transaccion',
        as: 'documentos'
    }),
    __metadata("design:type", Array)
], Venta.prototype, "documentos", void 0);
exports.Venta = Venta = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'ventas',
        timestamps: false
    })
], Venta);
exports.default = Venta;
