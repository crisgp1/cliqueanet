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
exports.TipoTransaccion = exports.PERMISOS_TIPO = exports.GRUPOS_TIPO = exports.DESCRIPCIONES_TIPO = exports.TIPOS_TRANSACCION = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
const transaccion_model_1 = require("../transaccion.model");
// Constantes para los tipos de transacciones
exports.TIPOS_TRANSACCION = {
    VENTA: 1,
    APARTADO: 2,
    PAGO_CREDITO: 3,
    TRASPASO: 4,
    CAMBIO: 5,
    CONSIGNACION: 6,
    DEVOLUCION: 7,
    CANCELACION: 8
};
// Descripciones de los tipos de transacción
exports.DESCRIPCIONES_TIPO = {
    1: 'Venta directa de vehículo',
    2: 'Apartado de vehículo con anticipo',
    3: 'Pago de crédito automotriz',
    4: 'Traspaso de propiedad del vehículo',
    5: 'Cambio o permuta de vehículos',
    6: 'Consignación de vehículo',
    7: 'Devolución de vehículo',
    8: 'Cancelación de transacción'
};
// Grupos de tipos relacionados
exports.GRUPOS_TIPO = {
    VENTAS: [exports.TIPOS_TRANSACCION.VENTA, exports.TIPOS_TRANSACCION.APARTADO],
    CREDITOS: [exports.TIPOS_TRANSACCION.PAGO_CREDITO],
    CAMBIOS: [exports.TIPOS_TRANSACCION.TRASPASO, exports.TIPOS_TRANSACCION.CAMBIO],
    CONSIGNACIONES: [exports.TIPOS_TRANSACCION.CONSIGNACION],
    CANCELACIONES: [exports.TIPOS_TRANSACCION.DEVOLUCION, exports.TIPOS_TRANSACCION.CANCELACION]
};
// Roles que pueden realizar cada tipo de transacción
exports.PERMISOS_TIPO = {
    1: ['Administrador', 'Ventas'],
    2: ['Administrador', 'Ventas'],
    3: ['Administrador', 'Finanzas'],
    4: ['Administrador'],
    5: ['Administrador', 'Ventas'],
    6: ['Administrador', 'Ventas'],
    7: ['Administrador'],
    8: ['Administrador']
};
let TipoTransaccion = class TipoTransaccion extends sequelize_typescript_1.Model {
    // Métodos de validación
    static isPagoCredito(idTipo) {
        return idTipo === exports.TIPOS_TRANSACCION.PAGO_CREDITO;
    }
    static isVenta(idTipo) {
        return idTipo === exports.TIPOS_TRANSACCION.VENTA;
    }
    static isApartado(idTipo) {
        return idTipo === exports.TIPOS_TRANSACCION.APARTADO;
    }
    static isTraspaso(idTipo) {
        return idTipo === exports.TIPOS_TRANSACCION.TRASPASO;
    }
    static isCambio(idTipo) {
        return idTipo === exports.TIPOS_TRANSACCION.CAMBIO;
    }
    static isConsignacion(idTipo) {
        return idTipo === exports.TIPOS_TRANSACCION.CONSIGNACION;
    }
    static isDevolucion(idTipo) {
        return idTipo === exports.TIPOS_TRANSACCION.DEVOLUCION;
    }
    static isCancelacion(idTipo) {
        return idTipo === exports.TIPOS_TRANSACCION.CANCELACION;
    }
    // Método para obtener el nombre del tipo
    static getNombreTipo(idTipo) {
        return exports.DESCRIPCIONES_TIPO[idTipo] || 'Desconocido';
    }
    // Método para validar si un ID de tipo es válido
    static isValidTipo(idTipo) {
        return Object.values(exports.TIPOS_TRANSACCION).includes(idTipo);
    }
    // Método para convertir un número a TipoTransaccionId
    static toTipoTransaccionId(idTipo) {
        return this.isValidTipo(idTipo) ? idTipo : null;
    }
    // Método para verificar permisos
    static tienePermiso(idTipo, rol) {
        var _a;
        return ((_a = exports.PERMISOS_TIPO[idTipo]) === null || _a === void 0 ? void 0 : _a.includes(rol)) || false;
    }
    // Método para obtener tipos relacionados
    static getTiposRelacionados(idTipo) {
        const grupoEncontrado = Object.values(exports.GRUPOS_TIPO).find(grupo => grupo.includes(idTipo));
        return grupoEncontrado ? [...grupoEncontrado] : [];
    }
    // Método para obtener estadísticas de uso
    static getEstadisticasUso(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const sequelize = new sequelize_typescript_1.Sequelize('');
            const where = {};
            if ((options === null || options === void 0 ? void 0 : options.startDate) && (options === null || options === void 0 ? void 0 : options.endDate)) {
                where.fecha = {
                    [sequelize_1.Op.between]: [options.startDate, options.endDate]
                };
            }
            const query = `
      SELECT id_tipo_transaccion, COUNT(*) as cantidad
      FROM transacciones
      ${where.fecha ? `WHERE fecha BETWEEN :startDate AND :endDate` : ''}
      GROUP BY id_tipo_transaccion
    `;
            const transacciones = yield sequelize.query(query, {
                replacements: where.fecha ? {
                    startDate: options === null || options === void 0 ? void 0 : options.startDate,
                    endDate: options === null || options === void 0 ? void 0 : options.endDate
                } : undefined,
                type: sequelize_1.QueryTypes.SELECT
            });
            const totalPorTipo = {};
            let total = 0;
            transacciones.forEach(t => {
                if (this.isValidTipo(t.id_tipo_transaccion)) {
                    const cantidad = parseInt(t.cantidad);
                    totalPorTipo[t.id_tipo_transaccion] = cantidad;
                    total += cantidad;
                }
            });
            const porcentajes = {};
            Object.entries(totalPorTipo).forEach(([tipo, cantidad]) => {
                const tipoId = parseInt(tipo);
                if (this.isValidTipo(tipoId)) {
                    porcentajes[tipoId] = (cantidad / total) * 100;
                }
            });
            // Calcular tendencias
            const tendencias = {};
            if ((options === null || options === void 0 ? void 0 : options.startDate) && (options === null || options === void 0 ? void 0 : options.endDate)) {
                const mitad = new Date((options.startDate.getTime() + options.endDate.getTime()) / 2);
                const [primerasMitad, segundasMitad] = yield Promise.all([
                    sequelize.query(`SELECT id_tipo_transaccion, COUNT(*) as cantidad
           FROM transacciones
           WHERE fecha < :fecha
           GROUP BY id_tipo_transaccion`, {
                        replacements: { fecha: mitad },
                        type: sequelize_1.QueryTypes.SELECT
                    }),
                    sequelize.query(`SELECT id_tipo_transaccion, COUNT(*) as cantidad
           FROM transacciones
           WHERE fecha >= :fecha
           GROUP BY id_tipo_transaccion`, {
                        replacements: { fecha: mitad },
                        type: sequelize_1.QueryTypes.SELECT
                    })
                ]);
                const cantidadesPrimeras = {};
                const cantidadesSegundas = {};
                primerasMitad.forEach(t => {
                    if (this.isValidTipo(t.id_tipo_transaccion)) {
                        cantidadesPrimeras[t.id_tipo_transaccion] = parseInt(t.cantidad);
                    }
                });
                segundasMitad.forEach(t => {
                    if (this.isValidTipo(t.id_tipo_transaccion)) {
                        cantidadesSegundas[t.id_tipo_transaccion] = parseInt(t.cantidad);
                    }
                });
                Object.keys(totalPorTipo).forEach(tipo => {
                    const tipoId = parseInt(tipo);
                    if (this.isValidTipo(tipoId)) {
                        const primera = cantidadesPrimeras[tipoId] || 0;
                        const segunda = cantidadesSegundas[tipoId] || 0;
                        const diferencia = segunda - primera;
                        if (diferencia > primera * 0.1)
                            tendencias[tipoId] = 'aumento';
                        else if (diferencia < -primera * 0.1)
                            tendencias[tipoId] = 'disminución';
                        else
                            tendencias[tipoId] = 'estable';
                    }
                });
            }
            const tiposMasUsados = Object.entries(totalPorTipo)
                .map(([id, cantidad]) => {
                const tipoId = parseInt(id);
                return this.isValidTipo(tipoId) ? {
                    id: tipoId,
                    cantidad
                } : null;
            })
                .filter((item) => item !== null)
                .sort((a, b) => b.cantidad - a.cantidad);
            return {
                totalPorTipo,
                porcentajes,
                tendencias,
                tiposMasUsados
            };
        });
    }
};
exports.TipoTransaccion = TipoTransaccion;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_tipo_transaccion'
    }),
    __metadata("design:type", Number)
], TipoTransaccion.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            isIn: [Object.values(exports.DESCRIPCIONES_TIPO)]
        }
    }),
    __metadata("design:type", String)
], TipoTransaccion.prototype, "nombre", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => transaccion_model_1.Transaccion, {
        foreignKey: 'id_tipo_transaccion',
        as: 'transacciones'
    }),
    __metadata("design:type", Array)
], TipoTransaccion.prototype, "transacciones", void 0);
exports.TipoTransaccion = TipoTransaccion = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'tipos_transaccion',
        timestamps: false
    })
], TipoTransaccion);
exports.default = TipoTransaccion;
