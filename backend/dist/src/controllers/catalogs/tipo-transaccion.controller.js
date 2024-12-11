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
exports.TipoTransaccionController = void 0;
const sequelize_1 = require("sequelize");
const tipo_transaccion_model_1 = require("../../models/catalogs/tipo-transaccion.model");
const transaccion_model_1 = require("../../models/transaccion.model");
class TipoTransaccionController {
    // Crear un nuevo tipo de transacción
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
                // Verificar si ya existe un tipo con el mismo nombre
                const existingTipo = yield tipo_transaccion_model_1.TipoTransaccion.findOne({ where: { nombre } });
                if (existingTipo) {
                    res.status(400).json({
                        success: false,
                        message: 'Ya existe un tipo de transacción con este nombre'
                    });
                    return;
                }
                const tipoTransaccion = yield tipo_transaccion_model_1.TipoTransaccion.create({ nombre });
                res.status(201).json({
                    success: true,
                    data: tipoTransaccion,
                    message: 'Tipo de transacción creado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al crear tipo de transacción:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al crear el tipo de transacción',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Obtener todos los tipos de transacción
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tiposTransaccion = yield tipo_transaccion_model_1.TipoTransaccion.findAll({
                    order: [['nombre', 'ASC']]
                });
                res.status(200).json({
                    success: true,
                    data: tiposTransaccion,
                    message: 'Tipos de transacción recuperados exitosamente'
                });
            }
            catch (error) {
                console.error('Error al obtener tipos de transacción:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener los tipos de transacción',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Obtener un tipo de transacción por ID
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const tipoTransaccion = yield tipo_transaccion_model_1.TipoTransaccion.findByPk(id);
                if (!tipoTransaccion) {
                    res.status(404).json({
                        success: false,
                        message: 'Tipo de transacción no encontrado'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: tipoTransaccion,
                    message: 'Tipo de transacción recuperado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al obtener tipo de transacción:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener el tipo de transacción',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Actualizar un tipo de transacción
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { nombre } = req.body;
                const tipoTransaccion = yield tipo_transaccion_model_1.TipoTransaccion.findByPk(id);
                if (!tipoTransaccion) {
                    res.status(404).json({
                        success: false,
                        message: 'Tipo de transacción no encontrado'
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
                const existingTipo = yield tipo_transaccion_model_1.TipoTransaccion.findOne({
                    where: {
                        nombre,
                        id: { [sequelize_1.Op.ne]: id } // Excluir el registro actual
                    }
                });
                if (existingTipo) {
                    res.status(400).json({
                        success: false,
                        message: 'Ya existe otro tipo de transacción con este nombre'
                    });
                    return;
                }
                yield tipoTransaccion.update({ nombre });
                res.status(200).json({
                    success: true,
                    data: tipoTransaccion,
                    message: 'Tipo de transacción actualizado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al actualizar tipo de transacción:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar el tipo de transacción',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Eliminar un tipo de transacción
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const tipoTransaccion = yield tipo_transaccion_model_1.TipoTransaccion.findByPk(id);
                if (!tipoTransaccion) {
                    res.status(404).json({
                        success: false,
                        message: 'Tipo de transacción no encontrado'
                    });
                    return;
                }
                // Verificar si el tipo está siendo usado en alguna transacción
                const transaccionesAsociadas = yield transaccion_model_1.Transaccion.count({
                    where: { id_tipo_transaccion: id }
                });
                if (transaccionesAsociadas > 0) {
                    res.status(400).json({
                        success: false,
                        message: 'No se puede eliminar el tipo de transacción porque está siendo usado en transacciones existentes'
                    });
                    return;
                }
                yield tipoTransaccion.destroy();
                res.status(200).json({
                    success: true,
                    message: 'Tipo de transacción eliminado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al eliminar tipo de transacción:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar el tipo de transacción',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
}
exports.TipoTransaccionController = TipoTransaccionController;
