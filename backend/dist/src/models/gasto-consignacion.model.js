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
exports.GastoConsignacion = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const consignacion_model_1 = require("./consignacion.model");
let GastoConsignacion = class GastoConsignacion extends sequelize_typescript_1.Model {
    // Métodos útiles
    getMontoPorcentajeConsignatario() {
        return (this.costo_total * this.porcentaje_consignatario) / 100;
    }
    getMontoPorcentajeAgencia() {
        return (this.costo_total * this.porcentaje_agencia) / 100;
    }
    validarPorcentajes() {
        return this.porcentaje_consignatario + this.porcentaje_agencia === 100;
    }
    // Método para obtener el resumen del gasto
    getResumen() {
        return {
            concepto: this.concepto,
            costoTotal: this.costo_total,
            montoConsignatario: this.getMontoPorcentajeConsignatario(),
            montoAgencia: this.getMontoPorcentajeAgencia(),
            porcentajes: {
                consignatario: this.porcentaje_consignatario,
                agencia: this.porcentaje_agencia
            }
        };
    }
    // Método estático para obtener el resumen de gastos de una consignación
    static getResumenGastosConsignacion(idConsignacion) {
        return __awaiter(this, void 0, void 0, function* () {
            const gastos = yield this.findAll({
                where: { id_consignacion: idConsignacion }
            });
            const resumen = {
                totalGastos: 0,
                gastosPorConcepto: {},
                totalConsignatario: 0,
                totalAgencia: 0,
                porcentajePromedioConsignatario: 0,
                porcentajePromedioAgencia: 0
            };
            if (gastos.length === 0)
                return resumen;
            gastos.forEach(gasto => {
                // Total general
                resumen.totalGastos += gasto.costo_total;
                // Por concepto
                resumen.gastosPorConcepto[gasto.concepto] =
                    (resumen.gastosPorConcepto[gasto.concepto] || 0) + gasto.costo_total;
                // Totales por parte
                resumen.totalConsignatario += gasto.getMontoPorcentajeConsignatario();
                resumen.totalAgencia += gasto.getMontoPorcentajeAgencia();
                // Acumular porcentajes para promedio
                resumen.porcentajePromedioConsignatario += gasto.porcentaje_consignatario;
                resumen.porcentajePromedioAgencia += gasto.porcentaje_agencia;
            });
            // Calcular promedios
            resumen.porcentajePromedioConsignatario /= gastos.length;
            resumen.porcentajePromedioAgencia /= gastos.length;
            return resumen;
        });
    }
    // Método estático para validar si un gasto es válido
    static validarGasto(gasto) {
        const errores = [];
        if (!gasto.concepto || !['Reparación', 'Mantenimiento', 'Limpieza', 'Verificación', 'Trámite', 'Otro'].includes(gasto.concepto)) {
            errores.push('El concepto no es válido');
        }
        if (gasto.costo_total <= 0) {
            errores.push('El costo total debe ser mayor a 0');
        }
        if (gasto.porcentaje_consignatario < 0 || gasto.porcentaje_consignatario > 100) {
            errores.push('El porcentaje del consignatario debe estar entre 0 y 100');
        }
        if (gasto.porcentaje_agencia < 0 || gasto.porcentaje_agencia > 100) {
            errores.push('El porcentaje de la agencia debe estar entre 0 y 100');
        }
        if (gasto.porcentaje_consignatario + gasto.porcentaje_agencia !== 100) {
            errores.push('La suma de los porcentajes debe ser 100%');
        }
        return {
            valido: errores.length === 0,
            errores
        };
    }
};
exports.GastoConsignacion = GastoConsignacion;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_gasto'
    }),
    __metadata("design:type", Number)
], GastoConsignacion.prototype, "id_gasto", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => consignacion_model_1.Consignacion),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'id_consignacion',
        references: {
            model: 'consignaciones',
            key: 'id_consignacion'
        }
    }),
    __metadata("design:type", Number)
], GastoConsignacion.prototype, "id_consignacion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
        field: 'concepto',
        validate: {
            notEmpty: true,
            isIn: [['Reparación', 'Mantenimiento', 'Limpieza', 'Verificación', 'Trámite', 'Otro']]
        }
    }),
    __metadata("design:type", String)
], GastoConsignacion.prototype, "concepto", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
        field: 'costo_total',
        validate: {
            min: 0
        }
    }),
    __metadata("design:type", Number)
], GastoConsignacion.prototype, "costo_total", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(5, 2),
        allowNull: false,
        field: 'porcentaje_consignatario',
        validate: {
            min: 0,
            max: 100
        }
    }),
    __metadata("design:type", Number)
], GastoConsignacion.prototype, "porcentaje_consignatario", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(5, 2),
        allowNull: false,
        field: 'porcentaje_agencia',
        validate: {
            min: 0,
            max: 100
        }
    }),
    __metadata("design:type", Number)
], GastoConsignacion.prototype, "porcentaje_agencia", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => consignacion_model_1.Consignacion, {
        foreignKey: 'id_consignacion',
        as: 'consignacionGasto'
    }),
    __metadata("design:type", consignacion_model_1.Consignacion)
], GastoConsignacion.prototype, "consignacion", void 0);
exports.GastoConsignacion = GastoConsignacion = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'gastos_consignacion',
        timestamps: false
    })
], GastoConsignacion);
exports.default = GastoConsignacion;
