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
exports.Empleado = exports.DOCUMENTOS_REQUERIDOS = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
const usuario_model_1 = require("./usuario.model");
const tipo_identificacion_model_1 = require("./catalogs/tipo-identificacion.model");
const nomina_model_1 = require("./nomina.model");
const venta_model_1 = require("./venta.model");
const venta_empleado_model_1 = require("./venta-empleado.model");
const cita_model_1 = require("./cita.model");
const cita_empleado_model_1 = require("./cita-empleado.model");
const documento_model_1 = require("./documento.model");
// Tipos de documentos requeridos
exports.DOCUMENTOS_REQUERIDOS = [
    'Identificación',
    'CURP',
    'Comprobante de Domicilio',
    'Contrato Laboral',
    'Alta IMSS',
    'RFC'
];
let Empleado = class Empleado extends sequelize_typescript_1.Model {
    // Métodos útiles
    getNombreCompleto() {
        return this.nombre;
    }
    getEdad() {
        return Math.floor((new Date().getTime() - this.fechaNacimiento.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }
    getAntiguedad() {
        return Math.floor((new Date().getTime() - this.fechaContratacion.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }
    // Método para obtener resumen de ventas
    getResumenVentas(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = { id_empleado: this.id };
            if ((options === null || options === void 0 ? void 0 : options.startDate) && (options === null || options === void 0 ? void 0 : options.endDate)) {
                where.created_at = {
                    [sequelize_1.Op.between]: [options.startDate, options.endDate]
                };
            }
            const ventasEmpleado = yield venta_empleado_model_1.VentaEmpleado.findAll({
                where,
                include: [{ model: venta_model_1.Venta, as: 'venta' }]
            });
            const ventasPorMes = {};
            let montoTotal = 0;
            let comisionesTotal = 0;
            ventasEmpleado.forEach(ve => {
                var _a, _b;
                const fecha = (_a = ve.venta) === null || _a === void 0 ? void 0 : _a.fecha.toISOString().slice(0, 7); // YYYY-MM
                if (fecha) {
                    ventasPorMes[fecha] = (ventasPorMes[fecha] || 0) + 1;
                }
                montoTotal += ((_b = ve.venta) === null || _b === void 0 ? void 0 : _b.monto) || 0;
                comisionesTotal += ve.comision || 0;
            });
            return {
                totalVentas: ventasEmpleado.length,
                montoTotal,
                comisionesTotal,
                promedioComision: ventasEmpleado.length ? comisionesTotal / ventasEmpleado.length : 0,
                ventasPorMes
            };
        });
    }
    // Método para obtener resumen de nómina
    getResumenNomina(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = { id_empleado: this.id };
            if ((options === null || options === void 0 ? void 0 : options.startDate) && (options === null || options === void 0 ? void 0 : options.endDate)) {
                where.fecha_pago = {
                    [sequelize_1.Op.between]: [options.startDate, options.endDate]
                };
            }
            const nominas = yield nomina_model_1.Nomina.findAll({ where });
            const nominasPorMes = {};
            let salarioTotal = 0;
            let comisionesTotal = 0;
            let deduccionesTotal = 0;
            nominas.forEach(nomina => {
                const fecha = nomina.fechaPago.toISOString().slice(0, 7); // YYYY-MM
                nominasPorMes[fecha] = (nominasPorMes[fecha] || 0) + nomina.totalPago;
                salarioTotal += nomina.salarioBase;
                comisionesTotal += nomina.comisiones || 0;
                deduccionesTotal += nomina.deducciones || 0;
            });
            return {
                totalPagos: nominas.length,
                salarioPromedio: nominas.length ? salarioTotal / nominas.length : 0,
                comisionesTotal,
                deduccionesTotal,
                nominasPorMes
            };
        });
    }
    // Método para verificar documentos
    verificarDocumentos() {
        return __awaiter(this, void 0, void 0, function* () {
            const documentos = yield this.$get('documentos');
            const documentosFaltantes = [];
            const documentosVencidos = [];
            exports.DOCUMENTOS_REQUERIDOS.forEach(tipoDoc => {
                const documento = documentos === null || documentos === void 0 ? void 0 : documentos.find(d => d.tipoDocumento === tipoDoc);
                if (!documento) {
                    documentosFaltantes.push(tipoDoc);
                }
                else {
                    const validacion = documento.validarDocumento();
                    if (!validacion.valido) {
                        documentosVencidos.push(tipoDoc);
                    }
                }
            });
            return {
                completo: documentosFaltantes.length === 0 && documentosVencidos.length === 0,
                documentosFaltantes,
                documentosVencidos
            };
        });
    }
    // Método para obtener citas pendientes
    getCitasPendientes() {
        return __awaiter(this, void 0, void 0, function* () {
            const citasEmpleado = yield cita_empleado_model_1.CitaEmpleado.findAll({
                where: { id_empleado: this.id },
                include: [{
                        model: cita_model_1.Cita,
                        as: 'cita',
                        where: {
                            fecha: {
                                [sequelize_1.Op.gte]: new Date()
                            }
                        }
                    }]
            });
            return citasEmpleado.map(ce => ce.cita).sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
        });
    }
    // Método para obtener análisis de rendimiento
    getAnalisisRendimiento(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const resumenVentas = yield this.getResumenVentas(options);
            const mesesTotales = Object.keys(resumenVentas.ventasPorMes).length || 1;
            // Calcular tendencia
            const ventasPorMes = Object.entries(resumenVentas.ventasPorMes)
                .sort(([a], [b]) => a.localeCompare(b));
            let tendencia = 'Estable';
            if (ventasPorMes.length >= 3) {
                const primerasMitad = ventasPorMes.slice(0, Math.floor(ventasPorMes.length / 2));
                const segundasMitad = ventasPorMes.slice(Math.floor(ventasPorMes.length / 2));
                const promedioInicial = primerasMitad.reduce((sum, [_, val]) => sum + val, 0) / primerasMitad.length;
                const promedioFinal = segundasMitad.reduce((sum, [_, val]) => sum + val, 0) / segundasMitad.length;
                if (promedioFinal > promedioInicial * 1.1)
                    tendencia = 'Ascendente';
                else if (promedioFinal < promedioInicial * 0.9)
                    tendencia = 'Descendente';
            }
            // Calcular rendimiento
            const promedioVentasMensual = resumenVentas.totalVentas / mesesTotales;
            let rendimiento = 'Medio';
            if (promedioVentasMensual >= 5)
                rendimiento = 'Alto';
            else if (promedioVentasMensual <= 2)
                rendimiento = 'Bajo';
            return {
                ventasTotales: resumenVentas.totalVentas,
                montoTotalVentas: resumenVentas.montoTotal,
                comisionesTotales: resumenVentas.comisionesTotal,
                promedioVentasMensual,
                tendencia,
                rendimiento
            };
        });
    }
};
exports.Empleado = Empleado;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_empleado'
    }),
    __metadata("design:type", Number)
], Empleado.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => usuario_model_1.Usuario),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: 'id_usuario',
        references: {
            model: 'usuarios',
            key: 'id_usuario'
        }
    }),
    __metadata("design:type", Number)
], Empleado.prototype, "idUsuario", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => tipo_identificacion_model_1.TipoIdentificacion),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: 'id_tipo_identificacion',
        references: {
            model: 'tipos_identificacion',
            key: 'id_tipo_identificacion'
        }
    }),
    __metadata("design:type", Number)
], Empleado.prototype, "idTipoIdentificacion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    }),
    __metadata("design:type", String)
], Empleado.prototype, "nombre", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        field: 'num_identificacion',
        validate: {
            notEmpty: true
        }
    }),
    __metadata("design:type", String)
], Empleado.prototype, "numIdentificacion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        field: 'fecha_nacimiento',
        validate: {
            isDate: true,
            isBefore: new Date().toISOString(),
            isValidAge(value) {
                const age = Math.floor((new Date().getTime() - value.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                if (age < 18) {
                    throw new Error('El empleado debe ser mayor de edad');
                }
            }
        }
    }),
    __metadata("design:type", Date)
], Empleado.prototype, "fechaNacimiento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(20),
        allowNull: false,
        validate: {
            is: /^[0-9]{10}$/
        }
    }),
    __metadata("design:type", String)
], Empleado.prototype, "telefono", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(18),
        allowNull: false,
        validate: {
            is: /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/
        }
    }),
    __metadata("design:type", String)
], Empleado.prototype, "curp", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [10, 200]
        }
    }),
    __metadata("design:type", String)
], Empleado.prototype, "domicilio", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        field: 'fecha_contratacion',
        validate: {
            isDate: true,
            isNotFuture(value) {
                if (value > new Date()) {
                    throw new Error('La fecha de contratación no puede ser futura');
                }
            }
        }
    }),
    __metadata("design:type", Date)
], Empleado.prototype, "fechaContratacion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(20),
        allowNull: true,
        unique: true,
        field: 'num_empleado'
    }),
    __metadata("design:type", String)
], Empleado.prototype, "numEmpleado", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => usuario_model_1.Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario'
    }),
    __metadata("design:type", usuario_model_1.Usuario)
], Empleado.prototype, "usuario", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => tipo_identificacion_model_1.TipoIdentificacion, {
        foreignKey: 'id_tipo_identificacion',
        as: 'tipoIdentificacion'
    }),
    __metadata("design:type", tipo_identificacion_model_1.TipoIdentificacion)
], Empleado.prototype, "tipoIdentificacion", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => nomina_model_1.Nomina, {
        foreignKey: 'id_empleado',
        as: 'nominas'
    }),
    __metadata("design:type", Array)
], Empleado.prototype, "nominas", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => venta_model_1.Venta, {
        through: () => venta_empleado_model_1.VentaEmpleado,
        foreignKey: 'id_empleado',
        otherKey: 'id_venta',
        as: 'ventas'
    }),
    __metadata("design:type", Array)
], Empleado.prototype, "ventas", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => cita_model_1.Cita, {
        through: () => cita_empleado_model_1.CitaEmpleado,
        foreignKey: 'id_empleado',
        otherKey: 'id_cita',
        as: 'citas'
    }),
    __metadata("design:type", Array)
], Empleado.prototype, "citas", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => documento_model_1.Documento, {
        foreignKey: 'id_empleado',
        as: 'documentos'
    }),
    __metadata("design:type", Array)
], Empleado.prototype, "documentos", void 0);
exports.Empleado = Empleado = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'empleados',
        timestamps: false
    })
], Empleado);
exports.default = Empleado;
