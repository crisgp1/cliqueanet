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
exports.VehiculoController = void 0;
const vehiculo_model_1 = require("../models/vehiculo.model");
class VehiculoController {
    // Crear un nuevo vehículo
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { marca, modelo, anio, precio, numSerie, color, numMotor, numFactura, placas, tarjetaCirculacion, comentariosInternos } = req.body;
                // Validar campos requeridos
                if (!marca || !modelo || !anio || !precio || !numSerie || !color || !numMotor) {
                    res.status(400).json({
                        success: false,
                        message: 'Todos los campos obligatorios deben ser proporcionados'
                    });
                    return;
                }
                const vehiculo = yield vehiculo_model_1.Vehiculo.create({
                    marca,
                    modelo,
                    anio,
                    precio,
                    numSerie,
                    color,
                    numMotor,
                    numFactura,
                    placas,
                    tarjetaCirculacion,
                    comentariosInternos
                });
                res.status(201).json({
                    success: true,
                    data: vehiculo,
                    message: 'Vehículo creado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al crear vehículo:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al crear el vehículo',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Obtener todos los vehículos
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vehiculos = yield vehiculo_model_1.Vehiculo.findAll();
                res.status(200).json({
                    success: true,
                    data: vehiculos,
                    message: 'Vehículos recuperados exitosamente'
                });
            }
            catch (error) {
                console.error('Error al obtener vehículos:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener los vehículos',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Obtener un vehículo por ID
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const vehiculo = yield vehiculo_model_1.Vehiculo.findByPk(id);
                if (!vehiculo) {
                    res.status(404).json({
                        success: false,
                        message: 'Vehículo no encontrado'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: vehiculo,
                    message: 'Vehículo recuperado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al obtener vehículo:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener el vehículo',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Obtener vehículo por número de serie
    getByNumSerie(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { numSerie } = req.query;
                const vehiculo = yield vehiculo_model_1.Vehiculo.findOne({
                    where: { numSerie }
                });
                if (!vehiculo) {
                    res.status(404).json({
                        success: false,
                        message: 'Vehículo no encontrado'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: vehiculo,
                    message: 'Vehículo recuperado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al obtener vehículo por número de serie:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener el vehículo',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Obtener vehículo por placas
    getByPlacas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { placas } = req.query;
                const vehiculo = yield vehiculo_model_1.Vehiculo.findOne({
                    where: { placas }
                });
                if (!vehiculo) {
                    res.status(404).json({
                        success: false,
                        message: 'Vehículo no encontrado'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: vehiculo,
                    message: 'Vehículo recuperado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al obtener vehículo por placas:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener el vehículo',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Obtener vehículo por número de motor
    getByNumMotor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { numMotor } = req.query;
                const vehiculo = yield vehiculo_model_1.Vehiculo.findOne({
                    where: { numMotor }
                });
                if (!vehiculo) {
                    res.status(404).json({
                        success: false,
                        message: 'Vehículo no encontrado'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: vehiculo,
                    message: 'Vehículo recuperado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al obtener vehículo por número de motor:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener el vehículo',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Actualizar un vehículo
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const vehiculo = yield vehiculo_model_1.Vehiculo.findByPk(id);
                if (!vehiculo) {
                    res.status(404).json({
                        success: false,
                        message: 'Vehículo no encontrado'
                    });
                    return;
                }
                const { marca, modelo, anio, precio, numSerie, color, numMotor, numFactura, placas, tarjetaCirculacion, comentariosInternos } = req.body;
                // Validar campos requeridos
                if (!marca || !modelo || !anio || !precio || !numSerie || !color || !numMotor) {
                    res.status(400).json({
                        success: false,
                        message: 'Todos los campos obligatorios deben ser proporcionados'
                    });
                    return;
                }
                yield vehiculo.update({
                    marca,
                    modelo,
                    anio,
                    precio,
                    numSerie,
                    color,
                    numMotor,
                    numFactura,
                    placas,
                    tarjetaCirculacion,
                    comentariosInternos
                });
                res.status(200).json({
                    success: true,
                    data: vehiculo,
                    message: 'Vehículo actualizado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al actualizar vehículo:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar el vehículo',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Eliminar un vehículo
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const vehiculo = yield vehiculo_model_1.Vehiculo.findByPk(id);
                if (!vehiculo) {
                    res.status(404).json({
                        success: false,
                        message: 'Vehículo no encontrado'
                    });
                    return;
                }
                yield vehiculo.destroy();
                res.status(200).json({
                    success: true,
                    message: 'Vehículo eliminado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al eliminar vehículo:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar el vehículo',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
}
exports.VehiculoController = VehiculoController;
