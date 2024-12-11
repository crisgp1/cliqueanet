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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolUsuarioController = void 0;
const sequelize_1 = require("sequelize");
const rol_usuario_model_1 = require("../../models/catalogs/rol-usuario.model");
const usuario_model_1 = require("../../models/usuario.model");
class RolUsuarioController {
    // Crear un nuevo rol de usuario
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre } = req.body;
                // Validar campo requerido
                if (!nombre) {
                    res.status(400).json({
                        success: false,
                        message: 'El nombre es requerido'
                    });
                    return;
                }
                // Verificar si ya existe un rol con el mismo nombre
                const existingRol = yield rol_usuario_model_1.RolUsuario.findOne({ where: { nombre } });
                if (existingRol) {
                    res.status(400).json({
                        success: false,
                        message: 'Ya existe un rol con este nombre'
                    });
                    return;
                }
                const rolUsuario = yield rol_usuario_model_1.RolUsuario.create({ nombre });
                res.status(201).json({
                    success: true,
                    data: rolUsuario,
                    message: 'Rol de usuario creado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al crear rol de usuario:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al crear el rol de usuario',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Obtener todos los roles de usuario
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rolesUsuario = yield rol_usuario_model_1.RolUsuario.findAll({
                    order: [['nombre', 'ASC']]
                });
                res.status(200).json({
                    success: true,
                    data: rolesUsuario,
                    message: 'Roles de usuario recuperados exitosamente'
                });
            }
            catch (error) {
                console.error('Error al obtener roles de usuario:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener los roles de usuario',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Obtener un rol de usuario por ID
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const rolUsuario = yield rol_usuario_model_1.RolUsuario.findByPk(id);
                if (!rolUsuario) {
                    res.status(404).json({
                        success: false,
                        message: 'Rol de usuario no encontrado'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: rolUsuario,
                    message: 'Rol de usuario recuperado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al obtener rol de usuario:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener el rol de usuario',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Actualizar un rol de usuario
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { nombre } = req.body;
                const rolUsuario = yield rol_usuario_model_1.RolUsuario.findByPk(id);
                if (!rolUsuario) {
                    res.status(404).json({
                        success: false,
                        message: 'Rol de usuario no encontrado'
                    });
                    return;
                }
                // Validar campo requerido
                if (!nombre) {
                    res.status(400).json({
                        success: false,
                        message: 'El nombre es requerido'
                    });
                    return;
                }
                // Verificar si ya existe otro rol con el mismo nombre
                const existingRol = yield rol_usuario_model_1.RolUsuario.findOne({
                    where: {
                        nombre,
                        id: { [sequelize_1.Op.ne]: id } // Excluir el registro actual
                    }
                });
                if (existingRol) {
                    res.status(400).json({
                        success: false,
                        message: 'Ya existe otro rol con este nombre'
                    });
                    return;
                }
                yield rolUsuario.update({ nombre });
                res.status(200).json({
                    success: true,
                    data: rolUsuario,
                    message: 'Rol de usuario actualizado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al actualizar rol de usuario:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar el rol de usuario',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Eliminar un rol de usuario
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const rolUsuario = yield rol_usuario_model_1.RolUsuario.findByPk(id);
                if (!rolUsuario) {
                    res.status(404).json({
                        success: false,
                        message: 'Rol de usuario no encontrado'
                    });
                    return;
                }
                // Verificar si el rol está siendo usado por algún usuario
                const usuariosAsociados = yield usuario_model_1.Usuario.count({
                    where: { id_rol: id }
                });
                if (usuariosAsociados > 0) {
                    res.status(400).json({
                        success: false,
                        message: 'No se puede eliminar el rol porque está siendo usado por usuarios existentes'
                    });
                    return;
                }
                yield rolUsuario.destroy();
                res.status(200).json({
                    success: true,
                    message: 'Rol de usuario eliminado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al eliminar rol de usuario:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar el rol de usuario',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
}
exports.RolUsuarioController = RolUsuarioController;
