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
exports.VentaEmpleado = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
const venta_model_1 = require("./venta.model");
const empleado_model_1 = require("./empleado.model");
let VentaEmpleado = class VentaEmpleado extends sequelize_typescript_1.Model {
    // Métodos útiles
    calcularComision(montoVenta) {
        return (montoVenta * this.porcentajeComision) / 100;
    }
    actualizarComision(montoVenta) {
        return __awaiter(this, void 0, void 0, function* () {
            this.comision = this.calcularComision(montoVenta);
            yield this.save();
        });
    }
    // Método para validar la comisión
    validarComision(montoVenta) {
        const comisionCalculada = this.calcularComision(montoVenta);
        return Math.abs(comisionCalculada - this.comision) < 0.01; // Permitir pequeñas diferencias por redondeo
    }
    // Método para obtener el resumen de la venta
    getResumenVenta() {
        let rendimiento = 'Medio';
        if (this.porcentajeComision > 5)
            rendimiento = 'Alto';
        else if (this.porcentajeComision < 2)
            rendimiento = 'Bajo';
        return {
            montoComision: this.comision,
            porcentaje: this.porcentajeComision,
            rendimiento
        };
    }
    // Método estático para obtener el historial de ventas de un empleado
    static getHistorialVentas(idEmpleado, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = { id_empleado: idEmpleado };
            if ((options === null || options === void 0 ? void 0 : options.startDate) && (options === null || options === void 0 ? void 0 : options.endDate)) {
                where['$venta.fecha$'] = {
                    [sequelize_1.Op.between]: [options.startDate, options.endDate]
                };
            }
            const ventas = yield this.findAll({
                where,
                include: [
                    { model: venta_model_1.Venta, as: 'venta' },
                    { model: empleado_model_1.Empleado, as: 'empleado' }
                ],
                order: [[{ model: venta_model_1.Venta, as: 'venta' }, 'fecha', 'DESC']]
            });
            const totalComisiones = ventas.reduce((sum, venta) => sum + venta.comision, 0);
            const promedioComision = totalComisiones / (ventas.length || 1);
            const promedioProcentaje = ventas.reduce((sum, venta) => sum + venta.porcentajeComision, 0) / (ventas.length || 1);
            let rendimientoGeneral = 'Medio';
            if (promedioProcentaje > 5)
                rendimientoGeneral = 'Alto';
            else if (promedioProcentaje < 2)
                rendimientoGeneral = 'Bajo';
            return {
                ventas,
                totalComisiones,
                promedioComision,
                rendimientoGeneral
            };
        });
    }
    // Método estático para obtener análisis de rendimiento
    static getAnalisisRendimiento(idEmpleado, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = { id_empleado: idEmpleado };
            if ((options === null || options === void 0 ? void 0 : options.startDate) && (options === null || options === void 0 ? void 0 : options.endDate)) {
                where['$venta.fecha$'] = {
                    [sequelize_1.Op.between]: [options.startDate, options.endDate]
                };
            }
            const ventas = yield this.findAll({
                where,
                include: [{ model: venta_model_1.Venta, as: 'venta' }],
                order: [[{ model: venta_model_1.Venta, as: 'venta' }, 'fecha', 'ASC']]
            });
            const comisiones = ventas.map(v => v.comision);
            const totalComisiones = comisiones.reduce((sum, c) => sum + c, 0);
            const promedioComision = totalComisiones / (ventas.length || 1);
            // Análisis de tendencia
            let tendencia = 'Estable';
            if (ventas.length >= 3) {
                const mitad = Math.floor(ventas.length / 2);
                const primerasMitad = ventas.slice(0, mitad);
                const segundasMitad = ventas.slice(mitad);
                const promedioInicial = primerasMitad.reduce((sum, v) => sum + v.comision, 0) / primerasMitad.length;
                const promedioFinal = segundasMitad.reduce((sum, v) => sum + v.comision, 0) / segundasMitad.length;
                if (promedioFinal > promedioInicial * 1.1)
                    tendencia = 'Mejorando';
                else if (promedioFinal < promedioInicial * 0.9)
                    tendencia = 'Decreciendo';
            }
            // Distribución de comisiones
            const distribucionComisiones = {
                alta: ventas.filter(v => v.porcentajeComision > 5).length,
                media: ventas.filter(v => v.porcentajeComision >= 2 && v.porcentajeComision <= 5).length,
                baja: ventas.filter(v => v.porcentajeComision < 2).length
            };
            return {
                totalVentas: ventas.length,
                totalComisiones,
                promedioComisionPorVenta: promedioComision,
                mejorComision: Math.max(...comisiones),
                peorComision: Math.min(...comisiones),
                tendencia,
                distribucionComisiones
            };
        });
    }
};
exports.VentaEmpleado = VentaEmpleado;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => venta_model_1.Venta),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        field: 'id_venta',
        references: {
            model: 'ventas',
            key: 'id_venta'
        }
    }),
    __metadata("design:type", Number)
], VentaEmpleado.prototype, "idVenta", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => empleado_model_1.Empleado),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        field: 'id_empleado',
        references: {
            model: 'empleados',
            key: 'id_empleado'
        }
    }),
    __metadata("design:type", Number)
], VentaEmpleado.prototype, "idEmpleado", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    }),
    __metadata("design:type", Number)
], VentaEmpleado.prototype, "comision", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(5, 2),
        allowNull: false,
        field: 'porcentaje_comision',
        validate: {
            min: 0,
            max: 100
        }
    }),
    __metadata("design:type", Number)
], VentaEmpleado.prototype, "porcentajeComision", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => venta_model_1.Venta, {
        foreignKey: 'id_venta',
        as: 'venta'
    }),
    __metadata("design:type", venta_model_1.Venta)
], VentaEmpleado.prototype, "venta", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => empleado_model_1.Empleado, {
        foreignKey: 'id_empleado',
        as: 'empleado'
    }),
    __metadata("design:type", empleado_model_1.Empleado)
], VentaEmpleado.prototype, "empleado", void 0);
exports.VentaEmpleado = VentaEmpleado = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'venta_empleados',
        timestamps: false
    })
], VentaEmpleado);
exports.default = VentaEmpleado;
