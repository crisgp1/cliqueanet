"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioController = void 0;
const usuario_model_1 = __importDefault(require("../models/usuario.model"));
const types_1 = require("../types");
const auth_middleware_1 = require("../middlewares/auth.middleware");
class UsuarioController {
    constructor() {
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🚀 Login request received:', req.body);
                const credentials = Object.assign(Object.assign({}, req.body), { ip_address: req.realIP // Usar la IP real del middleware
                 });
                // Validar que se proporcione al menos un método de identificación
                if (!credentials.employeeId && !credentials.correo) {
                    console.log('❌ No se proporcionó método de identificación');
                    res.status(400).json({
                        success: false,
                        message: 'Debe proporcionar un número de empleado o correo electrónico'
                    });
                    return;
                }
                // Validar contraseña
                if (!credentials.password) {
                    console.log('❌ No se proporcionó contraseña');
                    res.status(400).json({
                        success: false,
                        message: 'Debe proporcionar una contraseña'
                    });
                    return;
                }
                console.log('✅ Validaciones pasadas, intentando login');
                const result = yield usuario_model_1.default.login(credentials);
                if (!result) {
                    console.log('❌ Login fallido: credenciales inválidas');
                    res.status(401).json({
                        success: false,
                        message: 'Credenciales inválidas'
                    });
                    return;
                }
                console.log('✅ Login exitoso');
                res.status(200).json({
                    success: true,
                    data: result,
                    message: 'Login exitoso'
                });
            }
            catch (error) {
                console.error('❌ Error en el proceso de login:', error);
                res.status(500).json({
                    success: false,
                    error: error.message,
                    message: 'Error en el proceso de login'
                });
            }
        });
        this.crearUsuario = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const usuarioData = req.body;
                // Validar contraseña
                if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(usuarioData.password)) {
                    res.status(400).json({
                        success: false,
                        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número'
                    });
                    return;
                }
                // Hash de la contraseña
                usuarioData.password = yield (0, auth_middleware_1.hashPassword)(usuarioData.password);
                const nuevoUsuario = yield usuario_model_1.default.create(usuarioData);
                // Excluir la contraseña de la respuesta
                const _a = nuevoUsuario.toJSON(), { password } = _a, usuarioSinPassword = __rest(_a, ["password"]);
                res.status(201).json({
                    success: true,
                    data: usuarioSinPassword,
                    message: 'Usuario creado exitosamente'
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    message: 'Error al crear usuario'
                });
            }
        });
        this.obtenerUsuarioPorId = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const usuario = yield usuario_model_1.default.findByPk(id, {
                    attributes: { exclude: ['password'] }
                });
                if (!usuario) {
                    res.status(404).json({
                        success: false,
                        message: `Usuario con ID ${id} no encontrado`
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: usuario
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    message: 'Error al obtener usuario'
                });
            }
        });
        this.obtenerTodosUsuarios = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const usuarios = yield usuario_model_1.default.findAll({
                    attributes: { exclude: ['password'] }
                });
                res.status(200).json({
                    success: true,
                    data: usuarios
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    message: 'Error al obtener usuarios'
                });
            }
        });
        this.actualizarUsuario = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const usuarioData = req.body;
                // Si se actualiza la contraseña, validar y hashear
                if (usuarioData.password) {
                    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(usuarioData.password)) {
                        res.status(400).json({
                            success: false,
                            message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número'
                        });
                        return;
                    }
                    usuarioData.password = yield (0, auth_middleware_1.hashPassword)(usuarioData.password);
                }
                const [numRows, [usuarioActualizado]] = yield usuario_model_1.default.update(usuarioData, {
                    where: { id_empleado: id },
                    returning: true
                });
                if (numRows === 0) {
                    res.status(404).json({
                        success: false,
                        message: `Usuario con ID ${id} no encontrado`
                    });
                    return;
                }
                // Excluir la contraseña de la respuesta
                const _a = usuarioActualizado.toJSON(), { password } = _a, usuarioSinPassword = __rest(_a, ["password"]);
                res.status(200).json({
                    success: true,
                    data: usuarioSinPassword,
                    message: 'Usuario actualizado exitosamente'
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    message: 'Error al actualizar usuario'
                });
            }
        });
        this.eliminarUsuario = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const numRows = yield usuario_model_1.default.destroy({
                    where: { id_empleado: id }
                });
                if (numRows === 0) {
                    res.status(404).json({
                        success: false,
                        message: `Usuario con ID ${id} no encontrado`
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Usuario eliminado exitosamente'
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                    message: 'Error al eliminar usuario'
                });
            }
        });
        this.buscarUsuariosPorRol = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const rolId = parseInt(req.params.rol);
                if (isNaN(rolId) || !Object.values(types_1.RolUsuario).includes(rolId)) {
                    res.status(400).json({
                        success: false,
                        message: 'Rol inválido'
                    });
                    return;
                }
                const usuarios = yield usuario_model_1.default.findAll({
                    where: { id_rol: rolId },
                    attributes: { exclude: ['password'] }
                });
                res.status(200).json({
                    success: true,
                    data: usuarios
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    message: 'Error al buscar usuarios por rol'
                });
            }
        });
        this.buscarUsuarioPorCorreo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { correo } = req.params;
                const usuario = yield usuario_model_1.default.findOne({
                    where: { correo },
                    attributes: { exclude: ['password'] }
                });
                if (!usuario) {
                    res.status(404).json({
                        success: false,
                        message: `Usuario con correo ${correo} no encontrado`
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: usuario
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    message: 'Error al buscar usuario por correo'
                });
            }
        });
    }
}
exports.UsuarioController = UsuarioController;
