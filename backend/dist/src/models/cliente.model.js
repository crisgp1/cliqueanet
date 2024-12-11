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
exports.Cliente = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const tipo_identificacion_model_1 = require("./catalogs/tipo-identificacion.model");
const credito_model_1 = require("./credito.model");
const transaccion_model_1 = require("./transaccion.model");
const contacto_model_1 = require("./contacto.model");
const documento_model_1 = require("./documento.model");
let Cliente = class Cliente extends sequelize_typescript_1.Model {
    static validatePersonaFields(instance) {
        return __awaiter(this, void 0, void 0, function* () {
            if (instance.tipoPersona === 'Moral') {
                if (!instance.razonSocial) {
                    throw new Error('La razón social es obligatoria para personas morales');
                }
                if (!instance.rfc) {
                    throw new Error('El RFC es obligatorio para personas morales');
                }
                if (!instance.fechaConstitucion) {
                    throw new Error('La fecha de constitución es obligatoria para personas morales');
                }
                if (!instance.regimenFiscal) {
                    throw new Error('El régimen fiscal es obligatorio para personas morales');
                }
            }
            else if (instance.tipoPersona === 'Física') {
                if (!instance.curp) {
                    throw new Error('El CURP es obligatorio para personas físicas');
                }
            }
        });
    }
};
exports.Cliente = Cliente;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_cliente'
    }),
    __metadata("design:type", Number)
], Cliente.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false
    }),
    __metadata("design:type", String)
], Cliente.prototype, "nombre", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(18),
        allowNull: true,
        validate: {
            isValidCurp(value) {
                if (this.tipoPersona === 'Física' && !value) {
                    throw new Error('El CURP es obligatorio para personas físicas');
                }
            }
        }
    }),
    __metadata("design:type", String)
], Cliente.prototype, "curp", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => tipo_identificacion_model_1.TipoIdentificacion),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        field: 'id_tipo_identificacion',
        references: {
            model: 'tipos_identificacion',
            key: 'id_tipo_identificacion'
        }
    }),
    __metadata("design:type", Number)
], Cliente.prototype, "idTipoIdentificacion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        field: 'num_identificacion'
    }),
    __metadata("design:type", String)
], Cliente.prototype, "numIdentificacion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        field: 'fecha_nacimiento'
    }),
    __metadata("design:type", Date)
], Cliente.prototype, "fechaNacimiento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(20),
        allowNull: false
    }),
    __metadata("design:type", String)
], Cliente.prototype, "telefono", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false
    }),
    __metadata("design:type", String)
], Cliente.prototype, "correo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(200),
        allowNull: false
    }),
    __metadata("design:type", String)
], Cliente.prototype, "domicilio", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(10),
        allowNull: false,
        defaultValue: 'Física',
        field: 'tipo_persona',
        validate: {
            isIn: [['Física', 'Moral']]
        }
    }),
    __metadata("design:type", String)
], Cliente.prototype, "tipoPersona", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(200),
        allowNull: true,
        field: 'razon_social',
        validate: {
            isValidRazonSocial(value) {
                if (this.tipoPersona === 'Moral' && !value) {
                    throw new Error('La razón social es obligatoria para personas morales');
                }
            }
        }
    }),
    __metadata("design:type", String)
], Cliente.prototype, "razonSocial", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        field: 'representante_legal'
    }),
    __metadata("design:type", String)
], Cliente.prototype, "representanteLegal", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(13),
        allowNull: true,
        validate: {
            isValidRfc(value) {
                if (this.tipoPersona === 'Moral' && !value) {
                    throw new Error('El RFC es obligatorio para personas morales');
                }
                if (value && value.trim() !== '') {
                    if (value.length !== 12 && value.length !== 13) {
                        throw new Error('El RFC debe tener 12 o 13 caracteres');
                    }
                    if (!/^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(value)) {
                        throw new Error('El formato del RFC no es válido');
                    }
                }
            }
        }
    }),
    __metadata("design:type", String)
], Cliente.prototype, "rfc", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
        field: 'fecha_constitucion',
        validate: {
            isValidFechaConstitucion(value) {
                if (this.tipoPersona === 'Moral' && !value) {
                    throw new Error('La fecha de constitución es obligatoria para personas morales');
                }
            }
        }
    }),
    __metadata("design:type", Date)
], Cliente.prototype, "fechaConstitucion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        field: 'regimen_fiscal',
        validate: {
            isValidRegimenFiscal(value) {
                if (this.tipoPersona === 'Moral' && !value) {
                    throw new Error('El régimen fiscal es obligatorio para personas morales');
                }
            }
        }
    }),
    __metadata("design:type", String)
], Cliente.prototype, "regimenFiscal", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: true,
        field: 'acta_constitutiva_url'
    }),
    __metadata("design:type", String)
], Cliente.prototype, "actaConstitutivaUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: true,
        field: 'poder_notarial_url'
    }),
    __metadata("design:type", String)
], Cliente.prototype, "poderNotarialUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: true,
        field: 'comprobante_domicilio_url'
    }),
    __metadata("design:type", String)
], Cliente.prototype, "comprobanteDomicilioUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => tipo_identificacion_model_1.TipoIdentificacion, {
        foreignKey: 'id_tipo_identificacion'
    }),
    __metadata("design:type", tipo_identificacion_model_1.TipoIdentificacion)
], Cliente.prototype, "tipoIdentificacion", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => credito_model_1.Credito, {
        foreignKey: 'id_cliente'
    }),
    __metadata("design:type", Array)
], Cliente.prototype, "creditos", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => transaccion_model_1.Transaccion, {
        foreignKey: 'id_cliente'
    }),
    __metadata("design:type", Array)
], Cliente.prototype, "transacciones", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => contacto_model_1.Contacto, {
        foreignKey: 'id_cliente'
    }),
    __metadata("design:type", Array)
], Cliente.prototype, "contactos", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => documento_model_1.Documento, {
        foreignKey: 'id_cliente'
    }),
    __metadata("design:type", Array)
], Cliente.prototype, "documentos", void 0);
__decorate([
    sequelize_typescript_1.BeforeValidate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Cliente]),
    __metadata("design:returntype", Promise)
], Cliente, "validatePersonaFields", null);
exports.Cliente = Cliente = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'clientes',
        timestamps: false
    })
], Cliente);
exports.default = Cliente;
