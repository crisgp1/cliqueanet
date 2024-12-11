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
exports.creditoController = exports.CreditoController = void 0;
const credito_model_1 = require("../models/credito.model");
class CreditoController {
    // Obtener todos los créditos
    obtenerCreditos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const creditos = yield credito_model_1.Credito.findAll({
                    include: ['cliente', 'vehiculo']
                });
                res.status(200).json({
                    success: true,
                    data: creditos,
                    message: 'Créditos obtenidos exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener los créditos',
                    error: error
                });
            }
        });
    }
    // Obtener un crédito por ID
    obtenerCreditoPorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const credito = yield credito_model_1.Credito.findByPk(id, {
                    include: ['cliente', 'vehiculo']
                });
                if (!credito) {
                    res.status(404).json({
                        success: false,
                        message: 'Crédito no encontrado'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: credito,
                    message: 'Crédito obtenido exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener el crédito',
                    error: error
                });
            }
        });
    }
    // Crear un nuevo crédito
    crearCredito(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const nuevoCredito = yield credito_model_1.Credito.create(req.body);
                // Obtener el crédito creado con sus relaciones
                const creditoConRelaciones = yield credito_model_1.Credito.findByPk(nuevoCredito.id, {
                    include: ['cliente', 'vehiculo']
                });
                res.status(201).json({
                    success: true,
                    data: creditoConRelaciones,
                    message: 'Crédito creado exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al crear el crédito',
                    error: error
                });
            }
        });
    }
    // Actualizar un crédito
    actualizarCredito(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const credito = yield credito_model_1.Credito.findByPk(id);
                if (!credito) {
                    res.status(404).json({
                        success: false,
                        message: 'Crédito no encontrado'
                    });
                    return;
                }
                yield credito.update(req.body);
                // Obtener el crédito actualizado con sus relaciones
                const creditoActualizado = yield credito_model_1.Credito.findByPk(id, {
                    include: ['cliente', 'vehiculo']
                });
                res.status(200).json({
                    success: true,
                    data: creditoActualizado,
                    message: 'Crédito actualizado exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar el crédito',
                    error: error
                });
            }
        });
    }
    // Eliminar un crédito
    eliminarCredito(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const credito = yield credito_model_1.Credito.findByPk(id);
                if (!credito) {
                    res.status(404).json({
                        success: false,
                        message: 'Crédito no encontrado'
                    });
                    return;
                }
                yield credito.destroy();
                res.status(200).json({
                    success: true,
                    message: 'Crédito eliminado exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar el crédito',
                    error: error
                });
            }
        });
    }
    // Obtener créditos por cliente
    obtenerCreditosPorCliente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { clienteId } = req.params;
                const creditos = yield credito_model_1.Credito.findAll({
                    where: { clienteId },
                    include: ['cliente', 'vehiculo']
                });
                res.status(200).json({
                    success: true,
                    data: creditos,
                    message: 'Créditos del cliente obtenidos exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener los créditos del cliente',
                    error: error
                });
            }
        });
    }
}
exports.CreditoController = CreditoController;
exports.creditoController = new CreditoController();
