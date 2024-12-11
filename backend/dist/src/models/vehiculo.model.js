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
exports.Vehiculo = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
const transaccion_model_1 = require("./transaccion.model");
const consignacion_model_1 = require("./consignacion.model");
const cita_model_1 = require("./cita.model");
const documento_model_1 = require("./documento.model");
const ajuste_valor_vehiculo_model_1 = require("./ajuste-valor-vehiculo.model");
let Vehiculo = class Vehiculo extends sequelize_typescript_1.Model {
    // Métodos útiles
    getNombreCompleto() {
        return `${this.marca} ${this.modelo} ${this.anio}`;
    }
    getValorActual() {
        return __awaiter(this, void 0, void 0, function* () {
            const ajustes = yield this.getAjustesValor();
            const totalAjustes = (ajustes === null || ajustes === void 0 ? void 0 : ajustes.reduce((total, ajuste) => total + ajuste.monto_ajuste, 0)) || 0;
            return this.precio + totalAjustes;
        });
    }
    getAjustesValor() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ajuste_valor_vehiculo_model_1.AjusteValorVehiculo.findAll({
                where: { id_vehiculo: this.id },
                order: [['fecha', 'DESC']]
            });
        });
    }
    getDocumentosPorTipo(tipo) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield documento_model_1.Documento.findAll({
                where: {
                    id_vehiculo: this.id,
                    tipo_documento: tipo
                },
                order: [['fecha_subida', 'DESC']]
            });
        });
    }
    getCitasPendientes() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield cita_model_1.Cita.findAll({
                where: {
                    id_vehiculo: this.id,
                    fecha: {
                        [sequelize_1.Op.gte]: new Date()
                    }
                },
                order: [['fecha', 'ASC'], ['hora', 'ASC']]
            });
        });
    }
    getHistorialTransacciones() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield transaccion_model_1.Transaccion.findAll({
                where: { id_vehiculo: this.id },
                include: [
                    { model: documento_model_1.Documento, as: 'documentos' }
                ],
                order: [['fecha', 'DESC']]
            });
        });
    }
    // Método para verificar si el vehículo está en consignación
    estaEnConsignacion() {
        return __awaiter(this, void 0, void 0, function* () {
            const consignacion = yield consignacion_model_1.Consignacion.findOne({
                where: { id_vehiculo: this.id }
            });
            return !!consignacion;
        });
    }
    // Método para obtener el historial de precios
    getHistorialPrecios() {
        return __awaiter(this, void 0, void 0, function* () {
            const ajustes = yield this.getAjustesValor();
            const precioActual = yield this.getValorActual();
            return {
                precioOriginal: this.precio,
                ajustes,
                precioActual
            };
        });
    }
    // Método estático para buscar vehículos disponibles
    static getVehiculosDisponibles(filtros) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (filtros === null || filtros === void 0 ? void 0 : filtros.marca)
                where.marca = filtros.marca;
            if (filtros === null || filtros === void 0 ? void 0 : filtros.modelo)
                where.modelo = filtros.modelo;
            if (filtros === null || filtros === void 0 ? void 0 : filtros.anioMin)
                where.anio = Object.assign(Object.assign({}, where.anio), { [sequelize_1.Op.gte]: filtros.anioMin });
            if (filtros === null || filtros === void 0 ? void 0 : filtros.anioMax)
                where.anio = Object.assign(Object.assign({}, where.anio), { [sequelize_1.Op.lte]: filtros.anioMax });
            if (filtros === null || filtros === void 0 ? void 0 : filtros.precioMin)
                where.precio = Object.assign(Object.assign({}, where.precio), { [sequelize_1.Op.gte]: filtros.precioMin });
            if (filtros === null || filtros === void 0 ? void 0 : filtros.precioMax)
                where.precio = Object.assign(Object.assign({}, where.precio), { [sequelize_1.Op.lte]: filtros.precioMax });
            return yield this.findAll({
                where,
                include: [
                    {
                        model: transaccion_model_1.Transaccion,
                        as: 'transacciones',
                        required: false
                    },
                    {
                        model: consignacion_model_1.Consignacion,
                        as: 'consignacionVehiculo',
                        required: false
                    }
                ],
                order: [['marca', 'ASC'], ['modelo', 'ASC'], ['anio', 'DESC']]
            });
        });
    }
};
exports.Vehiculo = Vehiculo;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_vehiculo'
    }),
    __metadata("design:type", Number)
], Vehiculo.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }),
    __metadata("design:type", String)
], Vehiculo.prototype, "marca", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }),
    __metadata("design:type", String)
], Vehiculo.prototype, "modelo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'anio',
        validate: {
            min: 1900,
            max: new Date().getFullYear() + 1
        }
    }),
    __metadata("design:type", Number)
], Vehiculo.prototype, "anio", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    }),
    __metadata("design:type", Number)
], Vehiculo.prototype, "precio", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        field: 'num_serie',
        validate: {
            notEmpty: true,
            len: [17, 17] // VIN estándar
        }
    }),
    __metadata("design:type", String)
], Vehiculo.prototype, "numSerie", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }),
    __metadata("design:type", String)
], Vehiculo.prototype, "color", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        field: 'num_motor',
        validate: {
            notEmpty: true
        }
    }),
    __metadata("design:type", String)
], Vehiculo.prototype, "numMotor", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
        field: 'num_factura'
    }),
    __metadata("design:type", String)
], Vehiculo.prototype, "numFactura", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(20),
        allowNull: true
    }),
    __metadata("design:type", String)
], Vehiculo.prototype, "placas", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
        field: 'tarjeta_circulacion'
    }),
    __metadata("design:type", String)
], Vehiculo.prototype, "tarjetaCirculacion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
        field: 'comentarios_internos'
    }),
    __metadata("design:type", String)
], Vehiculo.prototype, "comentariosInternos", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => transaccion_model_1.Transaccion, { foreignKey: 'id_vehiculo', as: 'transacciones' }),
    __metadata("design:type", Array)
], Vehiculo.prototype, "transacciones", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => consignacion_model_1.Consignacion, { foreignKey: 'id_vehiculo', as: 'consignacionVehiculo' }),
    __metadata("design:type", consignacion_model_1.Consignacion)
], Vehiculo.prototype, "consignacion", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => cita_model_1.Cita, { foreignKey: 'id_vehiculo', as: 'citas' }),
    __metadata("design:type", Array)
], Vehiculo.prototype, "citas", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => documento_model_1.Documento, { foreignKey: 'id_vehiculo', as: 'documentos' }),
    __metadata("design:type", Array)
], Vehiculo.prototype, "documentos", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => ajuste_valor_vehiculo_model_1.AjusteValorVehiculo, { foreignKey: 'id_vehiculo', as: 'ajustes' }),
    __metadata("design:type", Array)
], Vehiculo.prototype, "ajustesValor", void 0);
exports.Vehiculo = Vehiculo = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'vehiculos',
        timestamps: false
    })
], Vehiculo);
exports.default = Vehiculo;
