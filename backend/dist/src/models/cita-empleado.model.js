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
exports.CitaEmpleado = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
const cita_model_1 = require("./cita.model");
const usuario_model_1 = require("./usuario.model");
let CitaEmpleado = class CitaEmpleado extends sequelize_typescript_1.Model {
    // Métodos útiles
    static asignarEmpleadosACita(idCita, empleadosIds) {
        return __awaiter(this, void 0, void 0, function* () {
            // Eliminar asignaciones existentes
            yield this.destroy({
                where: { id_cita: idCita }
            });
            // Crear nuevas asignaciones
            const asignaciones = yield Promise.all(empleadosIds.map(idEmpleado => this.create({
                idCita,
                idEmpleado,
                fechaAsignacion: new Date()
            })));
            return asignaciones;
        });
    }
    static getEmpleadosPorCita(idCita) {
        return __awaiter(this, void 0, void 0, function* () {
            const asignaciones = yield this.findAll({
                where: { id_cita: idCita },
                include: [{
                        model: usuario_model_1.Usuario,
                        as: 'empleado'
                    }]
            });
            return asignaciones.map(asignacion => asignacion.empleado);
        });
    }
    static getCitasPorEmpleado(idEmpleado, fecha) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = { id_empleado: idEmpleado };
            if (fecha) {
                where['$cita.fecha$'] = fecha;
            }
            const asignaciones = yield this.findAll({
                where,
                include: [{
                        model: cita_model_1.Cita,
                        as: 'cita',
                        required: true
                    }]
            });
            return asignaciones.map(asignacion => asignacion.cita);
        });
    }
    // Método para verificar si un empleado está disponible en una fecha y hora específica
    static verificarDisponibilidadEmpleado(idEmpleado, fecha, hora) {
        return __awaiter(this, void 0, void 0, function* () {
            const citasEmpleado = yield this.findAll({
                include: [{
                        model: cita_model_1.Cita,
                        as: 'cita',
                        where: {
                            fecha,
                            hora
                        }
                    }],
                where: {
                    id_empleado: idEmpleado
                }
            });
            return citasEmpleado.length === 0;
        });
    }
    // Método para obtener el historial de asignaciones de un empleado
    static getHistorialAsignaciones(idEmpleado, fechaInicio, fechaFin) {
        return __awaiter(this, void 0, void 0, function* () {
            const asignaciones = yield this.findAll({
                include: [{
                        model: cita_model_1.Cita,
                        as: 'cita',
                        where: {
                            fecha: {
                                [sequelize_1.Op.between]: [fechaInicio, fechaFin]
                            }
                        }
                    }],
                where: {
                    id_empleado: idEmpleado
                }
            });
            const resumen = {
                totalCitas: asignaciones.length,
                citasPorTipo: {},
                citasPorDia: {}
            };
            asignaciones.forEach(asignacion => {
                const cita = asignacion.cita;
                // Contar por tipo
                resumen.citasPorTipo[cita.tipoCita] = (resumen.citasPorTipo[cita.tipoCita] || 0) + 1;
                // Contar por día
                const fecha = cita.fecha.toISOString().split('T')[0];
                resumen.citasPorDia[fecha] = (resumen.citasPorDia[fecha] || 0) + 1;
            });
            return resumen;
        });
    }
};
exports.CitaEmpleado = CitaEmpleado;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => cita_model_1.Cita),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        field: 'id_cita',
        references: {
            model: 'citas',
            key: 'id_cita'
        }
    }),
    __metadata("design:type", Number)
], CitaEmpleado.prototype, "idCita", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => usuario_model_1.Usuario),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        field: 'id_empleado',
        references: {
            model: 'usuarios',
            key: 'id_usuario'
        }
    }),
    __metadata("design:type", Number)
], CitaEmpleado.prototype, "idEmpleado", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW,
        field: 'fecha_asignacion'
    }),
    __metadata("design:type", Date)
], CitaEmpleado.prototype, "fechaAsignacion", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => cita_model_1.Cita, {
        foreignKey: 'id_cita',
        as: 'cita'
    }),
    __metadata("design:type", cita_model_1.Cita)
], CitaEmpleado.prototype, "cita", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => usuario_model_1.Usuario, {
        foreignKey: 'id_empleado',
        as: 'empleado'
    }),
    __metadata("design:type", usuario_model_1.Usuario)
], CitaEmpleado.prototype, "empleado", void 0);
exports.CitaEmpleado = CitaEmpleado = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'citas_empleados',
        timestamps: false
    })
], CitaEmpleado);
exports.default = CitaEmpleado;
