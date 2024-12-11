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
exports.TipoIdentificacion = exports.REGLAS_IDENTIFICACION = exports.TIPOS_IDENTIFICACION = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
const usuario_model_1 = require("../usuario.model");
const cliente_model_1 = require("../cliente.model");
// Constantes para los tipos de identificación
exports.TIPOS_IDENTIFICACION = {
    INE: 1,
    PASAPORTE: 2,
    CEDULA: 3,
    LICENCIA: 4,
    CARTILLA: 5,
    OTRO: 6
};
// Descripciones y reglas por tipo
exports.REGLAS_IDENTIFICACION = {
    [exports.TIPOS_IDENTIFICACION.INE]: {
        nombre: 'INE/IFE',
        descripcion: 'Credencial para votar emitida por el INE',
        formatoNumero: /^[A-Z]{6}[0-9]{8}[A-Z][0-9]{3}$/,
        vigenciaAnios: 10,
        requiereImagen: true
    },
    [exports.TIPOS_IDENTIFICACION.PASAPORTE]: {
        nombre: 'Pasaporte',
        descripcion: 'Pasaporte mexicano vigente',
        formatoNumero: /^[A-Z][0-9]{8}$/,
        vigenciaAnios: 10,
        requiereImagen: true
    },
    [exports.TIPOS_IDENTIFICACION.CEDULA]: {
        nombre: 'Cédula Profesional',
        descripcion: 'Cédula profesional emitida por la SEP',
        formatoNumero: /^[0-9]{7,8}$/,
        vigenciaAnios: null, // No expira
        requiereImagen: true
    },
    [exports.TIPOS_IDENTIFICACION.LICENCIA]: {
        nombre: 'Licencia de Conducir',
        descripcion: 'Licencia de conducir vigente',
        formatoNumero: /^[A-Z0-9]{10,13}$/,
        vigenciaAnios: 3,
        requiereImagen: true
    },
    [exports.TIPOS_IDENTIFICACION.CARTILLA]: {
        nombre: 'Cartilla Militar',
        descripcion: 'Cartilla del Servicio Militar Nacional',
        formatoNumero: /^[A-Z][0-9]{8}$/,
        vigenciaAnios: null, // No expira
        requiereImagen: true
    },
    [exports.TIPOS_IDENTIFICACION.OTRO]: {
        nombre: 'Otro',
        descripcion: 'Otro tipo de identificación oficial',
        formatoNumero: null,
        vigenciaAnios: null,
        requiereImagen: true
    }
};
let TipoIdentificacion = class TipoIdentificacion extends sequelize_typescript_1.Model {
    // Métodos útiles
    static getNombreTipo(idTipo) {
        var _a;
        return ((_a = exports.REGLAS_IDENTIFICACION[idTipo]) === null || _a === void 0 ? void 0 : _a.nombre) || 'Desconocido';
    }
    static getReglas(idTipo) {
        return exports.REGLAS_IDENTIFICACION[idTipo];
    }
    // Método para validar el formato del número de identificación
    static validarFormato(idTipo, numero) {
        const reglas = exports.REGLAS_IDENTIFICACION[idTipo];
        if (!reglas || !reglas.formatoNumero)
            return true; // Si no hay formato definido, se considera válido
        return reglas.formatoNumero.test(numero);
    }
    // Método para verificar vigencia
    static estaVigente(idTipo, fechaEmision) {
        const reglas = exports.REGLAS_IDENTIFICACION[idTipo];
        if (!reglas || !reglas.vigenciaAnios)
            return true; // Si no hay vigencia definida, se considera vigente
        const fechaVencimiento = new Date(fechaEmision);
        fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + reglas.vigenciaAnios);
        return fechaVencimiento > new Date();
    }
    // Método para obtener estadísticas de uso
    static getEstadisticasUso(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const sequelize = new sequelize_typescript_1.Sequelize('');
            const where = {};
            if ((options === null || options === void 0 ? void 0 : options.startDate) && (options === null || options === void 0 ? void 0 : options.endDate)) {
                where.created_at = {
                    [sequelize_1.Op.between]: [options.startDate, options.endDate]
                };
            }
            // Obtener estadísticas de clientes
            const clientesQuery = `
      SELECT id_tipo_identificacion, COUNT(*) as cantidad
      FROM clientes
      ${where.created_at ? 'WHERE created_at BETWEEN :startDate AND :endDate' : ''}
      GROUP BY id_tipo_identificacion
    `;
            const usuariosQuery = `
      SELECT id_tipo_identificacion, COUNT(*) as cantidad
      FROM usuarios
      ${where.created_at ? 'WHERE created_at BETWEEN :startDate AND :endDate' : ''}
      GROUP BY id_tipo_identificacion
    `;
            const [clientes, usuarios] = yield Promise.all([
                sequelize.query(clientesQuery, {
                    replacements: where.created_at ? {
                        startDate: options === null || options === void 0 ? void 0 : options.startDate,
                        endDate: options === null || options === void 0 ? void 0 : options.endDate
                    } : undefined,
                    type: sequelize_1.QueryTypes.SELECT
                }),
                sequelize.query(usuariosQuery, {
                    replacements: where.created_at ? {
                        startDate: options === null || options === void 0 ? void 0 : options.startDate,
                        endDate: options === null || options === void 0 ? void 0 : options.endDate
                    } : undefined,
                    type: sequelize_1.QueryTypes.SELECT
                })
            ]);
            const totalPorTipo = {};
            const distribucionClientes = {};
            const distribucionUsuarios = {};
            let total = 0;
            // Procesar estadísticas de clientes
            clientes.forEach(c => {
                const idTipo = c.id_tipo_identificacion;
                const cantidad = parseInt(c.cantidad);
                distribucionClientes[idTipo] = cantidad;
                totalPorTipo[idTipo] = (totalPorTipo[idTipo] || 0) + cantidad;
                total += cantidad;
            });
            // Procesar estadísticas de usuarios
            usuarios.forEach(u => {
                const idTipo = u.id_tipo_identificacion;
                const cantidad = parseInt(u.cantidad);
                distribucionUsuarios[idTipo] = cantidad;
                totalPorTipo[idTipo] = (totalPorTipo[idTipo] || 0) + cantidad;
                total += cantidad;
            });
            // Calcular porcentajes
            const porcentajes = {};
            Object.entries(totalPorTipo).forEach(([tipo, cantidad]) => {
                const tipoId = parseInt(tipo);
                porcentajes[tipoId] = (cantidad / total) * 100;
            });
            // Ordenar por más usados
            const masUsados = Object.entries(totalPorTipo)
                .map(([id, cantidad]) => ({
                id: parseInt(id),
                cantidad
            }))
                .sort((a, b) => b.cantidad - a.cantidad);
            return {
                totalPorTipo,
                porcentajes,
                masUsados,
                distribucionClientes,
                distribucionUsuarios
            };
        });
    }
};
exports.TipoIdentificacion = TipoIdentificacion;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_tipo_identificacion'
    }),
    __metadata("design:type", Number)
], TipoIdentificacion.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            isIn: [Object.values(exports.REGLAS_IDENTIFICACION).map(r => r.nombre)]
        }
    }),
    __metadata("design:type", String)
], TipoIdentificacion.prototype, "nombre", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true
    }),
    __metadata("design:type", String)
], TipoIdentificacion.prototype, "descripcion", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => usuario_model_1.Usuario, {
        foreignKey: 'id_tipo_identificacion',
        as: 'usuarios'
    }),
    __metadata("design:type", Array)
], TipoIdentificacion.prototype, "usuarios", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => cliente_model_1.Cliente, {
        foreignKey: 'id_tipo_identificacion',
        as: 'clientes'
    }),
    __metadata("design:type", Array)
], TipoIdentificacion.prototype, "clientes", void 0);
exports.TipoIdentificacion = TipoIdentificacion = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'tipos_identificacion',
        timestamps: false
    })
], TipoIdentificacion);
exports.default = TipoIdentificacion;
