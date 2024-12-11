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
exports.AjusteValorVehiculo = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const vehiculo_model_1 = require("./vehiculo.model");
let AjusteValorVehiculo = class AjusteValorVehiculo extends sequelize_typescript_1.Model {
    // Métodos útiles
    esPositivo() {
        return this.monto_ajuste > 0;
    }
    esNegativo() {
        return this.monto_ajuste < 0;
    }
    // Método para obtener el impacto porcentual sobre el valor original
    getPorcentajeImpacto() {
        return __awaiter(this, void 0, void 0, function* () {
            const vehiculo = yield this.$get('vehiculo');
            if (!vehiculo)
                return 0;
            return (this.monto_ajuste / vehiculo.precio) * 100;
        });
    }
    // Método para obtener el resumen del ajuste
    getResumen() {
        return __awaiter(this, void 0, void 0, function* () {
            const impactoPorcentual = yield this.getPorcentajeImpacto();
            return {
                tipo: this.concepto,
                monto: this.monto_ajuste,
                impactoPorcentual,
                fecha: this.fecha,
                detalle: this.detalle
            };
        });
    }
    // Método estático para obtener el historial de ajustes de un vehículo
    static getHistorialAjustes(idVehiculo) {
        return __awaiter(this, void 0, void 0, function* () {
            const ajustes = yield this.findAll({
                where: { id_vehiculo: idVehiculo },
                order: [['fecha', 'DESC']]
            });
            const totalAjustes = ajustes.reduce((sum, ajuste) => sum + ajuste.monto_ajuste, 0);
            const ajustesPositivos = ajustes
                .filter(ajuste => ajuste.monto_ajuste > 0)
                .reduce((sum, ajuste) => sum + ajuste.monto_ajuste, 0);
            const ajustesNegativos = ajustes
                .filter(ajuste => ajuste.monto_ajuste < 0)
                .reduce((sum, ajuste) => sum + ajuste.monto_ajuste, 0);
            return {
                ajustes,
                totalAjustes,
                ajustesPositivos,
                ajustesNegativos
            };
        });
    }
    // Método estático para obtener estadísticas de ajustes por tipo
    static getEstadisticasPorTipo(idVehiculo) {
        return __awaiter(this, void 0, void 0, function* () {
            const ajustes = yield this.findAll({
                where: { id_vehiculo: idVehiculo }
            });
            const estadisticas = {};
            ajustes.forEach(ajuste => {
                if (!estadisticas[ajuste.concepto]) {
                    estadisticas[ajuste.concepto] = {
                        cantidad: 0,
                        montoTotal: 0,
                        promedio: 0
                    };
                }
                estadisticas[ajuste.concepto].cantidad++;
                estadisticas[ajuste.concepto].montoTotal += ajuste.monto_ajuste;
            });
            // Calcular promedios
            Object.keys(estadisticas).forEach(tipo => {
                estadisticas[tipo].promedio = estadisticas[tipo].montoTotal / estadisticas[tipo].cantidad;
            });
            return estadisticas;
        });
    }
};
exports.AjusteValorVehiculo = AjusteValorVehiculo;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_ajuste'
    }),
    __metadata("design:type", Number)
], AjusteValorVehiculo.prototype, "id_ajuste", void 0);
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
], AjusteValorVehiculo.prototype, "id_vehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
        field: 'concepto',
        validate: {
            notEmpty: true,
            isIn: [['Depreciación', 'Reparación', 'Mejora', 'Daño', 'Otro']]
        }
    }),
    __metadata("design:type", String)
], AjusteValorVehiculo.prototype, "concepto", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
        field: 'monto_ajuste',
        validate: {
            notNull: true
        }
    }),
    __metadata("design:type", Number)
], AjusteValorVehiculo.prototype, "monto_ajuste", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
        field: 'detalle'
    }),
    __metadata("design:type", String)
], AjusteValorVehiculo.prototype, "detalle", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW,
        field: 'fecha'
    }),
    __metadata("design:type", Date)
], AjusteValorVehiculo.prototype, "fecha", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => vehiculo_model_1.Vehiculo, {
        foreignKey: 'id_vehiculo',
        as: 'vehiculoAjuste'
    }),
    __metadata("design:type", vehiculo_model_1.Vehiculo)
], AjusteValorVehiculo.prototype, "vehiculo", void 0);
exports.AjusteValorVehiculo = AjusteValorVehiculo = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'ajustes_valor_vehiculo',
        timestamps: false
    })
], AjusteValorVehiculo);
exports.default = AjusteValorVehiculo;
