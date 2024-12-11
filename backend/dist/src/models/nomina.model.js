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
exports.Nomina = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
const empleado_model_1 = require("./empleado.model");
let Nomina = class Nomina extends sequelize_typescript_1.Model {
    // Métodos útiles
    calcularTotalPercepciones() {
        return this.salarioBase +
            (this.comisiones || 0) +
            (this.otrasPercepciones || 0);
    }
    calcularTotalDeducciones() {
        return this.deducciones || 0;
    }
    calcularTotalNeto() {
        return this.calcularTotalPercepciones() - this.calcularTotalDeducciones();
    }
    // Método para validar los montos
    validarMontos() {
        const totalCalculado = this.calcularTotalNeto();
        return Math.abs(totalCalculado - this.totalPago) < 0.01; // Permitir pequeñas diferencias por redondeo
    }
    // Método para obtener el resumen de la nómina
    getResumen() {
        const totalPercepciones = this.calcularTotalPercepciones();
        const totalDeducciones = this.calcularTotalDeducciones();
        return {
            percepciones: {
                salarioBase: this.salarioBase,
                comisiones: this.comisiones,
                otrasPercepciones: this.otrasPercepciones,
                total: totalPercepciones
            },
            deducciones: {
                total: totalDeducciones
            },
            totales: {
                totalPercepciones,
                totalDeducciones,
                totalNeto: this.totalPago
            }
        };
    }
    // Método estático para obtener el historial de nómina de un empleado
    static getHistorialNomina(idEmpleado, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = { id_empleado: idEmpleado };
            if ((options === null || options === void 0 ? void 0 : options.startDate) && (options === null || options === void 0 ? void 0 : options.endDate)) {
                where.fecha_pago = {
                    [sequelize_1.Op.between]: [options.startDate, options.endDate]
                };
            }
            const nominas = yield this.findAll({
                where,
                order: [['fecha_pago', 'DESC']],
                include: [{ model: empleado_model_1.Empleado, as: 'empleado' }]
            });
            const totales = nominas.reduce((acc, nomina) => ({
                salarioBase: acc.salarioBase + nomina.salarioBase,
                comisiones: acc.comisiones + (nomina.comisiones || 0),
                otrasPercepciones: acc.otrasPercepciones + (nomina.otrasPercepciones || 0),
                deducciones: acc.deducciones + (nomina.deducciones || 0),
                totalNeto: acc.totalNeto + nomina.totalPago
            }), {
                salarioBase: 0,
                comisiones: 0,
                otrasPercepciones: 0,
                deducciones: 0,
                totalNeto: 0
            });
            const count = nominas.length || 1;
            const promedios = {
                salarioBase: totales.salarioBase / count,
                comisiones: totales.comisiones / count,
                otrasPercepciones: totales.otrasPercepciones / count,
                deducciones: totales.deducciones / count,
                totalNeto: totales.totalNeto / count
            };
            return { nominas, totales, promedios };
        });
    }
    // Método estático para obtener análisis de comisiones
    static getAnalisisComisiones(idEmpleado, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                id_empleado: idEmpleado,
                comisiones: { [sequelize_1.Op.gt]: 0 }
            };
            if ((options === null || options === void 0 ? void 0 : options.startDate) && (options === null || options === void 0 ? void 0 : options.endDate)) {
                where.fecha_pago = {
                    [sequelize_1.Op.between]: [options.startDate, options.endDate]
                };
            }
            const nominas = yield this.findAll({
                where,
                order: [['fecha_pago', 'ASC']]
            });
            const comisionesPorMes = {};
            let totalComisiones = 0;
            nominas.forEach(nomina => {
                const mes = nomina.fechaPago.toISOString().slice(0, 7); // YYYY-MM
                comisionesPorMes[mes] = (comisionesPorMes[mes] || 0) + (nomina.comisiones || 0);
                totalComisiones += nomina.comisiones || 0;
            });
            const promedioComisiones = totalComisiones / (nominas.length || 1);
            // Calcular tendencia
            let tendencia = 'estable';
            if (nominas.length >= 3) {
                const primeras = nominas.slice(0, Math.floor(nominas.length / 2));
                const ultimas = nominas.slice(Math.floor(nominas.length / 2));
                const promedioInicial = primeras.reduce((sum, n) => sum + (n.comisiones || 0), 0) / primeras.length;
                const promedioFinal = ultimas.reduce((sum, n) => sum + (n.comisiones || 0), 0) / ultimas.length;
                const diferencia = promedioFinal - promedioInicial;
                if (diferencia > promedioInicial * 0.1)
                    tendencia = 'ascendente';
                else if (diferencia < -promedioInicial * 0.1)
                    tendencia = 'descendente';
            }
            return {
                totalComisiones,
                promedioComisiones,
                comisionesPorMes,
                tendencia
            };
        });
    }
};
exports.Nomina = Nomina;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_nomina'
    }),
    __metadata("design:type", Number)
], Nomina.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => empleado_model_1.Empleado),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'id_empleado',
        references: {
            model: 'empleados',
            key: 'id_empleado'
        }
    }),
    __metadata("design:type", Number)
], Nomina.prototype, "idEmpleado", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        field: 'fecha_pago',
        validate: {
            isDate: true,
            isAfter: '2020-01-01'
        }
    }),
    __metadata("design:type", Date)
], Nomina.prototype, "fechaPago", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
        field: 'salario_base',
        validate: {
            min: 0
        }
    }),
    __metadata("design:type", Number)
], Nomina.prototype, "salarioBase", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0
        }
    }),
    __metadata("design:type", Number)
], Nomina.prototype, "comisiones", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        field: 'otras_percepciones',
        validate: {
            min: 0
        }
    }),
    __metadata("design:type", Number)
], Nomina.prototype, "otrasPercepciones", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0
        }
    }),
    __metadata("design:type", Number)
], Nomina.prototype, "deducciones", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
        field: 'total_pago',
        validate: {
            min: 0
        }
    }),
    __metadata("design:type", Number)
], Nomina.prototype, "totalPago", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => empleado_model_1.Empleado, {
        foreignKey: 'id_empleado',
        as: 'empleado'
    }),
    __metadata("design:type", empleado_model_1.Empleado)
], Nomina.prototype, "empleado", void 0);
exports.Nomina = Nomina = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'nomina',
        timestamps: false
    })
], Nomina);
exports.default = Nomina;
