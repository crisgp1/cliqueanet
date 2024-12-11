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
exports.Contacto = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
const cliente_model_1 = require("./cliente.model");
const consignacion_model_1 = require("./consignacion.model");
const cita_model_1 = require("./cita.model");
let Contacto = class Contacto extends sequelize_typescript_1.Model {
    // Métodos útiles
    getNombreCompleto() {
        return `${this.nombre} ${this.apellidos}`;
    }
    getCitasPendientes() {
        return __awaiter(this, void 0, void 0, function* () {
            const ahora = new Date();
            return yield cita_model_1.Cita.findAll({
                where: {
                    id_contacto: this.id,
                    fecha: {
                        [sequelize_1.Op.gte]: ahora
                    }
                },
                order: [['fecha', 'ASC']]
            });
        });
    }
    getCitasHistoricas() {
        return __awaiter(this, void 0, void 0, function* () {
            const ahora = new Date();
            return yield cita_model_1.Cita.findAll({
                where: {
                    id_contacto: this.id,
                    fecha: {
                        [sequelize_1.Op.lt]: ahora
                    }
                },
                order: [['fecha', 'DESC']]
            });
        });
    }
    getUltimaCita() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield cita_model_1.Cita.findOne({
                where: {
                    id_contacto: this.id
                },
                order: [['fecha', 'DESC']]
            });
        });
    }
    getProximaCita() {
        return __awaiter(this, void 0, void 0, function* () {
            const ahora = new Date();
            return yield cita_model_1.Cita.findOne({
                where: {
                    id_contacto: this.id,
                    fecha: {
                        [sequelize_1.Op.gte]: ahora
                    }
                },
                order: [['fecha', 'ASC']]
            });
        });
    }
    // Método para validar si el contacto está relacionado con un cliente o una consignación
    validarRelacion() {
        if (!this.idCliente && !this.idConsignacion) {
            throw new Error('El contacto debe estar relacionado con un cliente o una consignación');
        }
        if (this.idCliente && this.idConsignacion) {
            throw new Error('El contacto no puede estar relacionado con un cliente y una consignación al mismo tiempo');
        }
        return true;
    }
    // Método para obtener todas las citas en un rango de fechas
    getCitasEnRango(fechaInicio, fechaFin) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield cita_model_1.Cita.findAll({
                where: {
                    id_contacto: this.id,
                    fecha: {
                        [sequelize_1.Op.between]: [fechaInicio, fechaFin]
                    }
                },
                order: [['fecha', 'ASC']]
            });
        });
    }
    // Método para obtener el resumen de citas
    getResumenCitas() {
        return __awaiter(this, void 0, void 0, function* () {
            const [citasPendientes, citasHistoricas, proximaCita, ultimaCita] = yield Promise.all([
                this.getCitasPendientes(),
                this.getCitasHistoricas(),
                this.getProximaCita(),
                this.getUltimaCita()
            ]);
            return {
                totalCitas: citasPendientes.length + citasHistoricas.length,
                citasPendientes: citasPendientes.length,
                citasHistoricas: citasHistoricas.length,
                proximaCita,
                ultimaCita
            };
        });
    }
};
exports.Contacto = Contacto;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_contacto'
    }),
    __metadata("design:type", Number)
], Contacto.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        field: 'tipo_contacto',
        validate: {
            isIn: [['Cliente', 'Consignatario', 'Referencia', 'Familiar', 'Otro']]
        }
    }),
    __metadata("design:type", String)
], Contacto.prototype, "tipoContacto", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false
    }),
    __metadata("design:type", String)
], Contacto.prototype, "nombre", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false
    }),
    __metadata("design:type", String)
], Contacto.prototype, "apellidos", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(20),
        allowNull: false
    }),
    __metadata("design:type", String)
], Contacto.prototype, "telefono", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false
    }),
    __metadata("design:type", String)
], Contacto.prototype, "correo", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => cliente_model_1.Cliente),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: 'id_cliente',
        references: {
            model: 'clientes',
            key: 'id_cliente'
        }
    }),
    __metadata("design:type", Number)
], Contacto.prototype, "idCliente", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => consignacion_model_1.Consignacion),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: 'id_consignacion',
        references: {
            model: 'consignaciones',
            key: 'id_consignacion'
        }
    }),
    __metadata("design:type", Number)
], Contacto.prototype, "idConsignacion", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => cliente_model_1.Cliente, {
        foreignKey: 'id_cliente',
        as: 'clienteContacto'
    }),
    __metadata("design:type", cliente_model_1.Cliente)
], Contacto.prototype, "cliente", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => consignacion_model_1.Consignacion, {
        foreignKey: 'id_consignacion',
        as: 'consignacionContacto'
    }),
    __metadata("design:type", consignacion_model_1.Consignacion)
], Contacto.prototype, "consignacion", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => cita_model_1.Cita, {
        foreignKey: 'id_contacto',
        as: 'citasContacto'
    }),
    __metadata("design:type", Array)
], Contacto.prototype, "citas", void 0);
exports.Contacto = Contacto = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'contactos',
        timestamps: false
    })
], Contacto);
exports.default = Contacto;
