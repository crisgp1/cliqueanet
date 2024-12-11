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
exports.LoginHistory = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
const usuario_model_1 = require("./usuario.model");
const empleado_model_1 = require("./empleado.model");
let LoginHistory = class LoginHistory extends sequelize_typescript_1.Model {
    // Métodos útiles
    getLocationInfo() {
        return {
            country: this.country,
            city: this.city
        };
    }
    getDeviceInfo() {
        return {
            browser: this.browser,
            device: this.device,
            userAgent: this.user_agent
        };
    }
    // Método estático para obtener el historial de accesos de un usuario
    static getHistorialAccesos(idUsuario, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = { id_usuario: idUsuario };
            if ((options === null || options === void 0 ? void 0 : options.startDate) && (options === null || options === void 0 ? void 0 : options.endDate)) {
                where.fecha_login = {
                    [sequelize_1.Op.between]: [options.startDate, options.endDate]
                };
            }
            return yield this.findAll({
                where,
                order: [['fecha_login', 'DESC']],
                limit: options === null || options === void 0 ? void 0 : options.limit,
                include: [
                    { model: usuario_model_1.Usuario, as: 'usuario' },
                    { model: empleado_model_1.Empleado, as: 'empleado' }
                ]
            });
        });
    }
    // Método estático para detectar actividad sospechosa
    static detectarActividadSospechosa(idUsuario) {
        return __awaiter(this, void 0, void 0, function* () {
            const ultimasHoras = 24;
            const maxAccesosPorHora = 10;
            const maxPaisesDiferentes = 3;
            const fechaLimite = new Date();
            fechaLimite.setHours(fechaLimite.getHours() - ultimasHoras);
            const accesos = yield this.findAll({
                where: {
                    id_usuario: idUsuario,
                    fecha_login: {
                        [sequelize_1.Op.gte]: fechaLimite
                    }
                },
                order: [['fecha_login', 'DESC']]
            });
            const razones = [];
            // Verificar cantidad de accesos por hora
            const accesosPorHora = new Map();
            accesos.forEach(acceso => {
                const hora = acceso.fecha_login.getHours();
                accesosPorHora.set(hora, (accesosPorHora.get(hora) || 0) + 1);
            });
            const excesosHora = Array.from(accesosPorHora.entries())
                .filter(([_, cantidad]) => cantidad > maxAccesosPorHora);
            if (excesosHora.length > 0) {
                razones.push(`Exceso de accesos por hora: ${excesosHora.map(([hora, cant]) => `${cant} accesos a las ${hora}:00`).join(', ')}`);
            }
            // Verificar países diferentes
            const paises = new Set(accesos.map(a => a.country).filter(Boolean));
            if (paises.size > maxPaisesDiferentes) {
                razones.push(`Accesos desde ${paises.size} países diferentes en las últimas ${ultimasHoras} horas`);
            }
            // Verificar cambios rápidos de ubicación
            const accesosOrdenados = [...accesos].sort((a, b) => a.fecha_login.getTime() - b.fecha_login.getTime());
            for (let i = 1; i < accesosOrdenados.length; i++) {
                const tiempoEntreAccesos = accesosOrdenados[i].fecha_login.getTime() -
                    accesosOrdenados[i - 1].fecha_login.getTime();
                const minutosEntreAccesos = tiempoEntreAccesos / (1000 * 60);
                if (accesosOrdenados[i].country !== accesosOrdenados[i - 1].country &&
                    minutosEntreAccesos < 60) {
                    razones.push(`Cambio rápido de ubicación: de ${accesosOrdenados[i - 1].country} a ${accesosOrdenados[i].country} en ${Math.round(minutosEntreAccesos)} minutos`);
                }
            }
            return {
                actividadSospechosa: razones.length > 0,
                razones,
                accesos
            };
        });
    }
    // Método estático para obtener estadísticas de acceso
    static getEstadisticasAcceso(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if ((options === null || options === void 0 ? void 0 : options.startDate) && (options === null || options === void 0 ? void 0 : options.endDate)) {
                where.fecha_login = {
                    [sequelize_1.Op.between]: [options.startDate, options.endDate]
                };
            }
            if (options === null || options === void 0 ? void 0 : options.idUsuario) {
                where.id_usuario = options.idUsuario;
            }
            const accesos = yield this.findAll({ where });
            const accesosPorPais = {};
            const accesosPorDispositivo = {};
            const accesosPorNavegador = {};
            const accesosPorHora = {};
            accesos.forEach(acceso => {
                // Por país
                if (acceso.country) {
                    accesosPorPais[acceso.country] = (accesosPorPais[acceso.country] || 0) + 1;
                }
                // Por dispositivo
                if (acceso.device) {
                    accesosPorDispositivo[acceso.device] = (accesosPorDispositivo[acceso.device] || 0) + 1;
                }
                // Por navegador
                if (acceso.browser) {
                    accesosPorNavegador[acceso.browser] = (accesosPorNavegador[acceso.browser] || 0) + 1;
                }
                // Por hora
                const hora = acceso.fecha_login.getHours();
                accesosPorHora[hora] = (accesosPorHora[hora] || 0) + 1;
            });
            // Calcular promedio de accesos por día
            const diasTotales = (options === null || options === void 0 ? void 0 : options.startDate) && (options === null || options === void 0 ? void 0 : options.endDate)
                ? Math.ceil((options.endDate.getTime() - options.startDate.getTime()) / (1000 * 60 * 60 * 24))
                : 1;
            const horasMasActivas = Object.entries(accesosPorHora)
                .map(([hora, cantidad]) => ({ hora: parseInt(hora), cantidad }))
                .sort((a, b) => b.cantidad - a.cantidad)
                .slice(0, 5);
            return {
                totalAccesos: accesos.length,
                accesosPorPais,
                accesosPorDispositivo,
                accesosPorNavegador,
                promedioAccesosPorDia: accesos.length / diasTotales,
                horasMasActivas
            };
        });
    }
};
exports.LoginHistory = LoginHistory;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_login_history'
    }),
    __metadata("design:type", Number)
], LoginHistory.prototype, "id_login_history", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => usuario_model_1.Usuario),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'id_usuario',
        references: {
            model: 'usuarios',
            key: 'id_usuario'
        }
    }),
    __metadata("design:type", Number)
], LoginHistory.prototype, "id_usuario", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW,
        field: 'fecha_login'
    }),
    __metadata("design:type", Date)
], LoginHistory.prototype, "fecha_login", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(45),
        allowNull: false,
        field: 'ip_address',
        validate: {
            isIP: true
        }
    }),
    __metadata("design:type", String)
], LoginHistory.prototype, "ip_address", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: false,
        field: 'user_agent'
    }),
    __metadata("design:type", String)
], LoginHistory.prototype, "user_agent", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        field: 'browser'
    }),
    __metadata("design:type", String)
], LoginHistory.prototype, "browser", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        field: 'device'
    }),
    __metadata("design:type", String)
], LoginHistory.prototype, "device", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        field: 'country'
    }),
    __metadata("design:type", String)
], LoginHistory.prototype, "country", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        field: 'city'
    }),
    __metadata("design:type", String)
], LoginHistory.prototype, "city", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => empleado_model_1.Empleado),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: 'id_empleado',
        references: {
            model: 'empleados',
            key: 'id_empleado'
        }
    }),
    __metadata("design:type", Number)
], LoginHistory.prototype, "id_empleado", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => usuario_model_1.Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario'
    }),
    __metadata("design:type", usuario_model_1.Usuario)
], LoginHistory.prototype, "usuario", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => empleado_model_1.Empleado, {
        foreignKey: 'id_empleado',
        as: 'empleado'
    }),
    __metadata("design:type", empleado_model_1.Empleado)
], LoginHistory.prototype, "empleado", void 0);
exports.LoginHistory = LoginHistory = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'login_history',
        timestamps: false
    })
], LoginHistory);
exports.default = LoginHistory;
