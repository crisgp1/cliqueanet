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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.empleadoController = exports.EmpleadoController = void 0;
const usuario_model_1 = require("../models/usuario.model");
const empleado_model_1 = require("../models/empleado.model");
const tipo_identificacion_model_1 = require("../models/catalogs/tipo-identificacion.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
class EmpleadoController {
    // Obtener todos los empleados con sus datos de usuario
    obtenerEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const empleados = yield empleado_model_1.Empleado.findAll({
                    include: [
                        {
                            model: usuario_model_1.Usuario,
                            as: 'usuario',
                            attributes: { exclude: ['password'] }
                        },
                        {
                            model: tipo_identificacion_model_1.TipoIdentificacion,
                            as: 'tipoIdentificacion'
                        }
                    ]
                });
                res.status(200).json({
                    success: true,
                    data: empleados,
                    message: 'Empleados obtenidos exitosamente'
                });
            }
            catch (error) {
                console.error('Error al obtener empleados:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener los empleados',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Obtener un empleado por ID
    obtenerEmpleadoPorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const empleado = yield empleado_model_1.Empleado.findOne({
                    where: { id_empleado: id },
                    include: [
                        {
                            model: usuario_model_1.Usuario,
                            as: 'usuario',
                            attributes: { exclude: ['password'] }
                        },
                        {
                            model: tipo_identificacion_model_1.TipoIdentificacion,
                            as: 'tipoIdentificacion'
                        }
                    ]
                });
                if (!empleado) {
                    res.status(404).json({
                        success: false,
                        message: 'Empleado no encontrado'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: empleado,
                    message: 'Empleado obtenido exitosamente'
                });
            }
            catch (error) {
                console.error('Error al obtener empleado:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener el empleado',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Crear un nuevo empleado junto con su usuario
    crearEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { usuario: usuarioData, empleado: empleadoData } = req.body;
                // Encriptar contraseña
                const salt = yield bcrypt_1.default.genSalt(10);
                const hashedPassword = yield bcrypt_1.default.hash(usuarioData.password, salt);
                // Crear usuario
                const nuevoUsuario = yield usuario_model_1.Usuario.create(Object.assign(Object.assign({}, usuarioData), { password: hashedPassword, is_active: true, is_locked: false }));
                // Crear empleado asociado al usuario
                const nuevoEmpleado = yield empleado_model_1.Empleado.create(Object.assign(Object.assign({}, empleadoData), { id_usuario: nuevoUsuario.id }));
                // Obtener el empleado con sus relaciones
                const empleadoCompleto = yield empleado_model_1.Empleado.findOne({
                    where: { id_empleado: nuevoEmpleado.id_empleado },
                    include: [
                        {
                            model: usuario_model_1.Usuario,
                            as: 'usuario',
                            attributes: { exclude: ['password'] }
                        },
                        {
                            model: tipo_identificacion_model_1.TipoIdentificacion,
                            as: 'tipoIdentificacion'
                        }
                    ]
                });
                res.status(201).json({
                    success: true,
                    data: empleadoCompleto,
                    message: 'Empleado creado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al crear empleado:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al crear el empleado',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Actualizar un empleado
    actualizarEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { usuario: usuarioData, empleado: empleadoData } = req.body;
                const empleadoExistente = yield empleado_model_1.Empleado.findOne({
                    where: { id_empleado: id },
                    include: [
                        {
                            model: usuario_model_1.Usuario,
                            as: 'usuario'
                        }
                    ]
                });
                if (!empleadoExistente) {
                    res.status(404).json({
                        success: false,
                        message: 'Empleado no encontrado'
                    });
                    return;
                }
                // Actualizar datos del usuario si se proporcionan
                if (usuarioData && empleadoExistente.usuario) {
                    const datosUsuario = Object.assign({}, usuarioData);
                    if (usuarioData.password) {
                        const salt = yield bcrypt_1.default.genSalt(10);
                        datosUsuario.password = yield bcrypt_1.default.hash(usuarioData.password, salt);
                    }
                    yield usuario_model_1.Usuario.update(datosUsuario, {
                        where: { id_usuario: empleadoExistente.usuario.id }
                    });
                }
                // Actualizar datos del empleado
                yield empleadoExistente.update(empleadoData);
                // Obtener el empleado actualizado con sus relaciones
                const empleadoActualizado = yield empleado_model_1.Empleado.findOne({
                    where: { id_empleado: id },
                    include: [
                        {
                            model: usuario_model_1.Usuario,
                            as: 'usuario',
                            attributes: { exclude: ['password'] }
                        },
                        {
                            model: tipo_identificacion_model_1.TipoIdentificacion,
                            as: 'tipoIdentificacion'
                        }
                    ]
                });
                res.status(200).json({
                    success: true,
                    data: empleadoActualizado,
                    message: 'Empleado actualizado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al actualizar empleado:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar el empleado',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Desactivar un empleado (soft delete del usuario asociado)
    desactivarEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const empleado = yield empleado_model_1.Empleado.findOne({
                    where: { id_empleado: id },
                    include: [{ model: usuario_model_1.Usuario, as: 'usuario' }]
                });
                if (!empleado || !empleado.usuario) {
                    res.status(404).json({
                        success: false,
                        message: 'Empleado no encontrado'
                    });
                    return;
                }
                yield usuario_model_1.Usuario.update({ is_active: false }, { where: { id_usuario: empleado.usuario.id } });
                res.status(200).json({
                    success: true,
                    message: 'Empleado desactivado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al desactivar empleado:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al desactivar el empleado',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Reactivar un empleado
    reactivarEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const empleado = yield empleado_model_1.Empleado.findOne({
                    where: { id_empleado: id },
                    include: [{ model: usuario_model_1.Usuario, as: 'usuario' }]
                });
                if (!empleado || !empleado.usuario) {
                    res.status(404).json({
                        success: false,
                        message: 'Empleado no encontrado'
                    });
                    return;
                }
                yield usuario_model_1.Usuario.update({ is_active: true }, { where: { id_usuario: empleado.usuario.id } });
                res.status(200).json({
                    success: true,
                    message: 'Empleado reactivado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al reactivar empleado:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al reactivar el empleado',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
}
exports.EmpleadoController = EmpleadoController;
exports.empleadoController = new EmpleadoController();
