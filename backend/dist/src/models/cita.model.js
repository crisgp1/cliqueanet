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
exports.Cita = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const usuario_model_1 = require("./usuario.model");
const contacto_model_1 = require("./contacto.model");
const vehiculo_model_1 = require("./vehiculo.model");
const cita_empleado_model_1 = require("./cita-empleado.model");
const sequelize_1 = require("sequelize");
let Cita = class Cita extends sequelize_typescript_1.Model {
    // Métodos útiles
    reagendar(nuevaFecha, nuevaHora) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.reagendaciones >= 3) {
                throw new Error('No se puede reagendar la cita más de 3 veces');
            }
            this.fecha = nuevaFecha;
            this.hora = nuevaHora;
            this.reagendaciones += 1;
            yield this.save();
        });
    }
    asignarEmpleados(empleadosIds) {
        return __awaiter(this, void 0, void 0, function* () {
            yield cita_empleado_model_1.CitaEmpleado.destroy({
                where: { id_cita: this.id }
            });
            yield Promise.all(empleadosIds.map(idEmpleado => cita_empleado_model_1.CitaEmpleado.create({
                id_cita: this.id,
                id_empleado: idEmpleado,
                fecha_asignacion: new Date()
            })));
        });
    }
    static getCitasDelDia() {
        return __awaiter(this, arguments, void 0, function* (fecha = new Date()) {
            const inicio = new Date(fecha.setHours(0, 0, 0, 0));
            const fin = new Date(fecha.setHours(23, 59, 59, 999));
            return yield this.findAll({
                where: {
                    fecha: {
                        [sequelize_1.Op.between]: [inicio, fin]
                    }
                },
                include: [
                    {
                        model: contacto_model_1.Contacto,
                        as: 'contactoCita'
                    },
                    {
                        model: vehiculo_model_1.Vehiculo,
                        as: 'vehiculoCita'
                    },
                    {
                        model: usuario_model_1.Usuario,
                        as: 'usuariosCita'
                    }
                ],
                order: [['hora', 'ASC']]
            });
        });
    }
    static getCitasPorEmpleado(idEmpleado, inicio, fin) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                '$usuariosCita.id$': idEmpleado
            };
            if (inicio && fin) {
                where.fecha = {
                    [sequelize_1.Op.between]: [inicio, fin]
                };
            }
            return yield this.findAll({
                where,
                include: [
                    {
                        model: contacto_model_1.Contacto,
                        as: 'contactoCita'
                    },
                    {
                        model: vehiculo_model_1.Vehiculo,
                        as: 'vehiculoCita'
                    },
                    {
                        model: usuario_model_1.Usuario,
                        as: 'usuariosCita'
                    }
                ],
                order: [['fecha', 'ASC'], ['hora', 'ASC']]
            });
        });
    }
    // Método para verificar disponibilidad
    static verificarDisponibilidad(fecha, hora) {
        return __awaiter(this, void 0, void 0, function* () {
            const citasExistentes = yield this.count({
                where: {
                    fecha,
                    hora
                }
            });
            return citasExistentes === 0;
        });
    }
    // Método para obtener el resumen de citas
    static getResumenCitas(inicio, fin) {
        return __awaiter(this, void 0, void 0, function* () {
            const citas = yield this.findAll({
                where: {
                    fecha: {
                        [sequelize_1.Op.between]: [inicio, fin]
                    }
                }
            });
            const resumen = {
                total: citas.length,
                porTipo: {},
                reagendadas: 0
            };
            citas.forEach(cita => {
                resumen.porTipo[cita.tipoCita] = (resumen.porTipo[cita.tipoCita] || 0) + 1;
                if (cita.reagendaciones > 0) {
                    resumen.reagendadas++;
                }
            });
            return resumen;
        });
    }
};
exports.Cita = Cita;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_cita'
    }),
    __metadata("design:type", Number)
], Cita.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => usuario_model_1.Usuario),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'id_empleado_creador',
        references: {
            model: 'usuarios',
            key: 'id_usuario'
        }
    }),
    __metadata("design:type", Number)
], Cita.prototype, "idEmpleadoCreador", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => contacto_model_1.Contacto),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'id_contacto',
        references: {
            model: 'contactos',
            key: 'id_contacto'
        }
    }),
    __metadata("design:type", Number)
], Cita.prototype, "idContacto", void 0);
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
], Cita.prototype, "idVehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        field: 'tipo_cita',
        validate: {
            isIn: [['Venta', 'Prueba de Manejo', 'Revisión', 'Entrega', 'Seguimiento']]
        }
    }),
    __metadata("design:type", String)
], Cita.prototype, "tipoCita", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false
    }),
    __metadata("design:type", Date)
], Cita.prototype, "fecha", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TIME,
        allowNull: false
    }),
    __metadata("design:type", String)
], Cita.prototype, "hora", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(200),
        allowNull: false
    }),
    __metadata("design:type", String)
], Cita.prototype, "lugar", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            max: 3
        }
    }),
    __metadata("design:type", Number)
], Cita.prototype, "reagendaciones", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => usuario_model_1.Usuario, {
        foreignKey: 'id_empleado_creador',
        as: 'creador'
    }),
    __metadata("design:type", usuario_model_1.Usuario)
], Cita.prototype, "creador", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => contacto_model_1.Contacto, {
        foreignKey: 'id_contacto',
        as: 'contactoCita'
    }),
    __metadata("design:type", contacto_model_1.Contacto)
], Cita.prototype, "contacto", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => vehiculo_model_1.Vehiculo, {
        foreignKey: 'id_vehiculo',
        as: 'vehiculoCita'
    }),
    __metadata("design:type", vehiculo_model_1.Vehiculo)
], Cita.prototype, "vehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => usuario_model_1.Usuario, {
        through: () => cita_empleado_model_1.CitaEmpleado,
        foreignKey: 'id_cita',
        otherKey: 'id_empleado',
        as: 'usuariosCita'
    }),
    __metadata("design:type", Array)
], Cita.prototype, "empleados", void 0);
exports.Cita = Cita = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'citas',
        timestamps: false
    })
], Cita);
exports.default = Cita;
