"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var Usuario_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const types_1 = require("../types");
const UAParser = __importStar(require("ua-parser-js"));
const geoip = __importStar(require("geoip-lite"));
const login_history_model_1 = require("./login-history.model");
const empleado_model_1 = require("./empleado.model");
const tipo_identificacion_model_1 = require("./catalogs/tipo-identificacion.model");
const rol_usuario_model_1 = require("./catalogs/rol-usuario.model");
// Mapeo entre IDs de rol y RolUsuario enum
const rolMapping = {
    1: types_1.RolUsuario.Administrador,
    2: types_1.RolUsuario.Ventas,
    3: types_1.RolUsuario.RRHH,
    4: types_1.RolUsuario.Gerente_general,
    5: types_1.RolUsuario.Capturista
};
let Usuario = Usuario_1 = class Usuario extends sequelize_typescript_1.Model {
    // Método para obtener el rol como enum
    getRolEnum() {
        return rolMapping[this.id_rol] || types_1.RolUsuario.Capturista;
    }
    static recordLoginHistory(usuario, ip_address, user_agent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parser = new UAParser.UAParser();
                parser.setUA(user_agent);
                const result = parser.getResult();
                const geo = geoip.lookup(ip_address);
                const browser = `${result.browser.name || ''} ${result.browser.version || ''}`.trim();
                const device = `${result.device.vendor || ''} ${result.device.model || ''} ${result.os.name || ''}`.trim();
                yield login_history_model_1.LoginHistory.create({
                    id_usuario: usuario.id,
                    fecha_login: new Date(),
                    ip_address,
                    user_agent,
                    browser,
                    device,
                    country: (geo === null || geo === void 0 ? void 0 : geo.country) || 'Unknown',
                    city: (geo === null || geo === void 0 ? void 0 : geo.city) || 'Unknown'
                });
            }
            catch (error) {
                console.error('Error al registrar historial de login:', error);
                // No lanzamos el error para no interrumpir el login
            }
        });
    }
    // Método estático para el login
    static login(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const whereClause = credentials.employeeId
                    ? { '$empleado.num_empleado$': credentials.employeeId }
                    : { correo: credentials.correo };
                console.log('🔍 Buscando usuario con:', whereClause);
                const usuario = yield Usuario_1.findOne({
                    where: whereClause,
                    include: [{
                            model: empleado_model_1.Empleado,
                            as: 'empleado'
                        }]
                });
                if (!usuario) {
                    console.log('❌ Usuario no encontrado');
                    return null;
                }
                console.log('✅ Usuario encontrado, verificando contraseña');
                const isPasswordValid = yield (0, auth_middleware_1.comparePassword)(credentials.password, usuario.password);
                if (!isPasswordValid) {
                    console.log('❌ Contraseña inválida');
                    return null;
                }
                console.log('✅ Contraseña válida, generando token');
                const token = (0, auth_middleware_1.generarToken)({
                    id_usuario: usuario.id,
                    rol: usuario.getRolEnum()
                });
                // Registrar el historial de login si se proporcionaron los datos
                if (credentials.ip_address && credentials.user_agent) {
                    yield this.recordLoginHistory(usuario, credentials.ip_address, credentials.user_agent);
                }
                // Obtener el último login
                const lastLogin = yield login_history_model_1.LoginHistory.findOne({
                    where: { id_usuario: usuario.id },
                    order: [['fecha_login', 'DESC']]
                });
                // Excluir la contraseña de la respuesta
                const _a = usuario.toJSON(), { password } = _a, usuarioSinPassword = __rest(_a, ["password"]);
                console.log('✅ Login exitoso');
                return {
                    token,
                    usuario: usuarioSinPassword,
                    lastLogin
                };
            }
            catch (error) {
                console.error('❌ Error en login:', error);
                throw new Error(`Error en el login: ${error.message}`);
            }
        });
    }
};
exports.Usuario = Usuario;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_usuario'
    }),
    __metadata("design:type", Number)
], Usuario.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
        unique: true
    }),
    __metadata("design:type", String)
], Usuario.prototype, "correo", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => tipo_identificacion_model_1.TipoIdentificacion),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        field: 'id_tipo_identificacion',
        allowNull: true
    }),
    __metadata("design:type", Number)
], Usuario.prototype, "idTipoIdentificacion", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => rol_usuario_model_1.RolUsuario),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'id_rol'
    }),
    __metadata("design:type", Number)
], Usuario.prototype, "id_rol", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: false
    }),
    __metadata("design:type", String)
], Usuario.prototype, "password", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
    }),
    __metadata("design:type", Boolean)
], Usuario.prototype, "is_active", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_locked'
    }),
    __metadata("design:type", Boolean)
], Usuario.prototype, "is_locked", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
        field: 'last_login'
    }),
    __metadata("design:type", Date)
], Usuario.prototype, "last_login", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'failed_attempts'
    }),
    __metadata("design:type", Number)
], Usuario.prototype, "failed_attempts", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
        field: 'password_changed_at'
    }),
    __metadata("design:type", Date)
], Usuario.prototype, "password_changed_at", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: true,
        field: 'reset_password_token'
    }),
    __metadata("design:type", String)
], Usuario.prototype, "reset_password_token", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
        field: 'reset_password_expires_at'
    }),
    __metadata("design:type", Date)
], Usuario.prototype, "reset_password_expires_at", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: 'created_by',
        references: {
            model: 'usuarios',
            key: 'id_usuario'
        }
    }),
    __metadata("design:type", Number)
], Usuario.prototype, "created_by", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
        field: 'auth_provider'
    }),
    __metadata("design:type", String)
], Usuario.prototype, "auth_provider", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        field: 'auth_provider_id'
    }),
    __metadata("design:type", String)
], Usuario.prototype, "auth_provider_id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
        unique: true
    }),
    __metadata("design:type", String)
], Usuario.prototype, "username", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'two_factor_enabled'
    }),
    __metadata("design:type", Boolean)
], Usuario.prototype, "two_factor_enabled", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        field: 'two_factor_secret'
    }),
    __metadata("design:type", String)
], Usuario.prototype, "two_factor_secret", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => tipo_identificacion_model_1.TipoIdentificacion),
    __metadata("design:type", tipo_identificacion_model_1.TipoIdentificacion)
], Usuario.prototype, "tipoIdentificacion", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => rol_usuario_model_1.RolUsuario, { foreignKey: 'id_rol' }),
    __metadata("design:type", rol_usuario_model_1.RolUsuario)
], Usuario.prototype, "rol", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => login_history_model_1.LoginHistory, {
        foreignKey: 'id_usuario',
        as: 'historialLogin'
    }),
    __metadata("design:type", Array)
], Usuario.prototype, "historialLogin", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => empleado_model_1.Empleado, {
        foreignKey: 'id_usuario',
        as: 'empleado'
    }),
    __metadata("design:type", empleado_model_1.Empleado)
], Usuario.prototype, "empleado", void 0);
exports.Usuario = Usuario = Usuario_1 = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'usuarios',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    })
], Usuario);
exports.default = Usuario;
