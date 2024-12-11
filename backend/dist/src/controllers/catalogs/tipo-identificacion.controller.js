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
exports.TipoIdentificacionController = void 0;
const sequelize_1 = require("sequelize");
const tipo_identificacion_model_1 = require("../../models/catalogs/tipo-identificacion.model");
const usuario_model_1 = require("../../models/usuario.model");
const cliente_model_1 = require("../../models/cliente.model");
class TipoIdentificacionController {
    // Crear un nuevo tipo de identificación
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, descripcion } = req.body;
                // Validar campo requerido
                if (!nombre) {
                    res.status(400).json({
                        success: false,
                        message: 'El nombre es requerido'
                    });
                    return;
                }
                // Verificar si ya existe un tipo con el mismo nombre
                const existingTipo = yield tipo_identificacion_model_1.TipoIdentificacion.findOne({ where: { nombre } });
                if (existingTipo) {
                    res.status(400).json({
                        success: false,
                        message: 'Ya existe un tipo de identificación con este nombre'
                    });
                    return;
                }
                const tipoIdentificacion = yield tipo_identificacion_model_1.TipoIdentificacion.create({
                    nombre,
                    descripcion
                });
                res.status(201).json({
                    success: true,
                    data: tipoIdentificacion,
                    message: 'Tipo de identificación creado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al crear tipo de identificación:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al crear el tipo de identificación',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Obtener todos los tipos de identificación
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tiposIdentificacion = yield tipo_identificacion_model_1.TipoIdentificacion.findAll({
                    order: [['nombre', 'ASC']]
                });
                res.status(200).json({
                    success: true,
                    data: tiposIdentificacion,
                    message: 'Tipos de identificación recuperados exitosamente'
                });
            }
            catch (error) {
                console.error('Error al obtener tipos de identificación:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener los tipos de identificación',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Obtener un tipo de identificación por ID
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const tipoIdentificacion = yield tipo_identificacion_model_1.TipoIdentificacion.findByPk(id);
                if (!tipoIdentificacion) {
                    res.status(404).json({
                        success: false,
                        message: 'Tipo de identificación no encontrado'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: tipoIdentificacion,
                    message: 'Tipo de identificación recuperado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al obtener tipo de identificación:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener el tipo de identificación',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Actualizar un tipo de identificación
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { nombre, descripcion } = req.body;
                const tipoIdentificacion = yield tipo_identificacion_model_1.TipoIdentificacion.findByPk(id);
                if (!tipoIdentificacion) {
                    res.status(404).json({
                        success: false,
                        message: 'Tipo de identificación no encontrado'
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
                // Verificar si ya existe otro tipo con el mismo nombre
                const existingTipo = yield tipo_identificacion_model_1.TipoIdentificacion.findOne({
                    where: {
                        nombre,
                        id: { [sequelize_1.Op.ne]: id } // Excluir el registro actual
                    }
                });
                if (existingTipo) {
                    res.status(400).json({
                        success: false,
                        message: 'Ya existe otro tipo de identificación con este nombre'
                    });
                    return;
                }
                yield tipoIdentificacion.update({
                    nombre,
                    descripcion
                });
                res.status(200).json({
                    success: true,
                    data: tipoIdentificacion,
                    message: 'Tipo de identificación actualizado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al actualizar tipo de identificación:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar el tipo de identificación',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Eliminar un tipo de identificación
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const tipoIdentificacion = yield tipo_identificacion_model_1.TipoIdentificacion.findByPk(id);
                if (!tipoIdentificacion) {
                    res.status(404).json({
                        success: false,
                        message: 'Tipo de identificación no encontrado'
                    });
                    return;
                }
                // Verificar si el tipo está siendo usado por algún usuario o cliente
                const usuariosAsociados = yield usuario_model_1.Usuario.count({
                    where: { id_tipo_identificacion: id }
                });
                const clientesAsociados = yield cliente_model_1.Cliente.count({
                    where: { id_tipo_identificacion: id }
                });
                if (usuariosAsociados > 0 || clientesAsociados > 0) {
                    res.status(400).json({
                        success: false,
                        message: 'No se puede eliminar el tipo de identificación porque está siendo usado por usuarios o clientes existentes'
                    });
                    return;
                }
                yield tipoIdentificacion.destroy();
                res.status(200).json({
                    success: true,
                    message: 'Tipo de identificación eliminado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al eliminar tipo de identificación:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar el tipo de identificación',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
}
exports.TipoIdentificacionController = TipoIdentificacionController;
