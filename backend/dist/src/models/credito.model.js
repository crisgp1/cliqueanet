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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Credito = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const cliente_model_1 = require("./cliente.model");
const transaccion_model_1 = require("./transaccion.model");
let Credito = class Credito extends sequelize_typescript_1.Model {
};
exports.Credito = Credito;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_credito'
    }),
    __metadata("design:type", Number)
], Credito.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => cliente_model_1.Cliente),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'id_cliente',
        references: {
            model: 'clientes',
            key: 'id_cliente'
        }
    }),
    __metadata("design:type", Number)
], Credito.prototype, "idCliente", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false
    }),
    __metadata("design:type", Number)
], Credito.prototype, "cantidad", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(200),
        allowNull: true
    }),
    __metadata("design:type", String)
], Credito.prototype, "comentarios", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => cliente_model_1.Cliente, {
        foreignKey: 'id_cliente'
    }),
    __metadata("design:type", cliente_model_1.Cliente)
], Credito.prototype, "cliente", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => transaccion_model_1.Transaccion, {
        foreignKey: 'id_credito'
    }),
    __metadata("design:type", Array)
], Credito.prototype, "transacciones", void 0);
exports.Credito = Credito = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'creditos',
        timestamps: false
    })
], Credito);
exports.default = Credito;
