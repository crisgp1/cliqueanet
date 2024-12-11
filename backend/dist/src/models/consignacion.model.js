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
exports.Consignacion = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const vehiculo_model_1 = require("./vehiculo.model");
const contacto_model_1 = require("./contacto.model");
const gasto_consignacion_model_1 = require("./gasto-consignacion.model");
let Consignacion = class Consignacion extends sequelize_typescript_1.Model {
    // Métodos útiles
    getNombreCompleto() {
        return `${this.nombreConsignatario} ${this.apellidosConsignatario}`;
    }
    getTotalGastos() {
        return __awaiter(this, void 0, void 0, function* () {
            const gastos = yield gasto_consignacion_model_1.GastoConsignacion.findAll({
                where: { id_consignacion: this.id }
            });
            return gastos.reduce((total, gasto) => total + gasto.costo_total, 0);
        });
    }
    getGastosPorTipo() {
        return __awaiter(this, void 0, void 0, function* () {
            const gastos = yield gasto_consignacion_model_1.GastoConsignacion.findAll({
                where: { id_consignacion: this.id }
            });
            return gastos.reduce((acc, gasto) => {
                acc[gasto.concepto] = (acc[gasto.concepto] || 0) + gasto.costo_total;
                return acc;
            }, {});
        });
    }
    getDistribucionGastos() {
        return __awaiter(this, void 0, void 0, function* () {
            const gastos = yield gasto_consignacion_model_1.GastoConsignacion.findAll({
                where: { id_consignacion: this.id }
            });
            const totalGastos = gastos.reduce((total, gasto) => total + gasto.costo_total, 0);
            const gastosPorTipo = gastos.reduce((acc, gasto) => {
                acc[gasto.concepto] = (acc[gasto.concepto] || 0) + gasto.costo_total;
                return acc;
            }, {});
            // Calcular porcentajes promedio
            const porcentajes = gastos.reduce((acc, gasto) => {
                acc.consignatario += gasto.porcentaje_consignatario;
                acc.agencia += gasto.porcentaje_agencia;
                return acc;
            }, { consignatario: 0, agencia: 0 });
            const totalGastosCount = gastos.length || 1;
            return {
                totalGastos,
                gastosPorTipo,
                porcentajeConsignatario: porcentajes.consignatario / totalGastosCount,
                porcentajeAgencia: porcentajes.agencia / totalGastosCount
            };
        });
    }
};
exports.Consignacion = Consignacion;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_consignacion'
    }),
    __metadata("design:type", Number)
], Consignacion.prototype, "id", void 0);
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
], Consignacion.prototype, "idVehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
        field: 'nombre_consignatario'
    }),
    __metadata("design:type", String)
], Consignacion.prototype, "nombreConsignatario", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
        field: 'apellidos_consignatario'
    }),
    __metadata("design:type", String)
], Consignacion.prototype, "apellidosConsignatario", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
        field: 'correo_consignatario'
    }),
    __metadata("design:type", String)
], Consignacion.prototype, "correoConsignatario", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(20),
        allowNull: false,
        field: 'telefono_consignatario'
    }),
    __metadata("design:type", String)
], Consignacion.prototype, "telefonoConsignatario", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
        field: 'origen_vehiculo_tipo',
        validate: {
            isIn: [['Particular', 'Agencia', 'Lote', 'Otro']]
        }
    }),
    __metadata("design:type", String)
], Consignacion.prototype, "origenVehiculoTipo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        field: 'origen_vehiculo_nombre'
    }),
    __metadata("design:type", String)
], Consignacion.prototype, "origenVehiculoNombre", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => vehiculo_model_1.Vehiculo, {
        foreignKey: 'id_vehiculo',
        as: 'vehiculoConsignado'
    }),
    __metadata("design:type", vehiculo_model_1.Vehiculo)
], Consignacion.prototype, "vehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => contacto_model_1.Contacto, {
        foreignKey: 'id_consignacion',
        as: 'contactosConsignacion'
    }),
    __metadata("design:type", Array)
], Consignacion.prototype, "contactos", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => gasto_consignacion_model_1.GastoConsignacion, {
        foreignKey: 'id_consignacion',
        as: 'gastosConsignacion'
    }),
    __metadata("design:type", Array)
], Consignacion.prototype, "gastos", void 0);
exports.Consignacion = Consignacion = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'consignaciones',
        timestamps: false
    })
], Consignacion);
exports.default = Consignacion;
