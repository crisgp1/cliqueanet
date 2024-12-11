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
Object.defineProperty(exports, "__esModule", { value: true });
exports.citaController = exports.CitaController = void 0;
const cita_model_1 = require("../models/cita.model");
const cita_empleado_model_1 = require("../models/cita-empleado.model");
class CitaController {
    // Obtener todas las citas
    obtenerCitas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const citas = yield cita_model_1.Cita.findAll({
                    include: [
                        'cliente',
                        {
                            model: cita_empleado_model_1.CitaEmpleado,
                            as: 'citaEmpleados',
                            include: ['empleado']
                        }
                    ]
                });
                res.status(200).json({
                    success: true,
                    data: citas,
                    message: 'Citas obtenidas exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener las citas',
                    error: error
                });
            }
        });
    }
    // Obtener una cita por ID
    obtenerCitaPorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const cita = yield cita_model_1.Cita.findByPk(id, {
                    include: [
                        'cliente',
                        {
                            model: cita_empleado_model_1.CitaEmpleado,
                            as: 'citaEmpleados',
                            include: ['empleado']
                        }
                    ]
                });
                if (!cita) {
                    res.status(404).json({
                        success: false,
                        message: 'Cita no encontrada'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: cita,
                    message: 'Cita obtenida exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener la cita',
                    error: error
                });
            }
        });
    }
    // Crear una nueva cita
    crearCita(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _a = req.body, { empleadosIds } = _a, citaData = __rest(_a, ["empleadosIds"]);
                const nuevaCita = yield cita_model_1.Cita.create(citaData);
                // Crear las relaciones con empleados si se proporcionaron
                if (empleadosIds && Array.isArray(empleadosIds)) {
                    const citaEmpleados = empleadosIds.map(empleadoId => ({
                        citaId: nuevaCita.id,
                        empleadoId: empleadoId
                    }));
                    yield cita_empleado_model_1.CitaEmpleado.bulkCreate(citaEmpleados);
                }
                // Obtener la cita creada con sus relaciones
                const citaConRelaciones = yield cita_model_1.Cita.findByPk(nuevaCita.id, {
                    include: [
                        'cliente',
                        {
                            model: cita_empleado_model_1.CitaEmpleado,
                            as: 'citaEmpleados',
                            include: ['empleado']
                        }
                    ]
                });
                res.status(201).json({
                    success: true,
                    data: citaConRelaciones,
                    message: 'Cita creada exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al crear la cita',
                    error: error
                });
            }
        });
    }
    // Actualizar una cita
    actualizarCita(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const _a = req.body, { empleadosIds } = _a, citaData = __rest(_a, ["empleadosIds"]);
                const cita = yield cita_model_1.Cita.findByPk(id);
                if (!cita) {
                    res.status(404).json({
                        success: false,
                        message: 'Cita no encontrada'
                    });
                    return;
                }
                // Actualizar datos de la cita
                yield cita.update(citaData);
                // Actualizar relaciones con empleados si se proporcionaron
                if (empleadosIds && Array.isArray(empleadosIds)) {
                    // Eliminar relaciones existentes
                    yield cita_empleado_model_1.CitaEmpleado.destroy({ where: { citaId: id } });
                    // Crear nuevas relaciones
                    const citaEmpleados = empleadosIds.map(empleadoId => ({
                        citaId: id,
                        empleadoId: empleadoId
                    }));
                    yield cita_empleado_model_1.CitaEmpleado.bulkCreate(citaEmpleados);
                }
                // Obtener la cita actualizada con sus relaciones
                const citaActualizada = yield cita_model_1.Cita.findByPk(id, {
                    include: [
                        'cliente',
                        {
                            model: cita_empleado_model_1.CitaEmpleado,
                            as: 'citaEmpleados',
                            include: ['empleado']
                        }
                    ]
                });
                res.status(200).json({
                    success: true,
                    data: citaActualizada,
                    message: 'Cita actualizada exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar la cita',
                    error: error
                });
            }
        });
    }
    // Eliminar una cita
    eliminarCita(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const cita = yield cita_model_1.Cita.findByPk(id);
                if (!cita) {
                    res.status(404).json({
                        success: false,
                        message: 'Cita no encontrada'
                    });
                    return;
                }
                // Eliminar las relaciones con empleados
                yield cita_empleado_model_1.CitaEmpleado.destroy({ where: { citaId: id } });
                // Eliminar la cita
                yield cita.destroy();
                res.status(200).json({
                    success: true,
                    message: 'Cita eliminada exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar la cita',
                    error: error
                });
            }
        });
    }
    // Obtener citas por cliente
    obtenerCitasPorCliente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { clienteId } = req.params;
                const citas = yield cita_model_1.Cita.findAll({
                    where: { clienteId },
                    include: [
                        'cliente',
                        {
                            model: cita_empleado_model_1.CitaEmpleado,
                            as: 'citaEmpleados',
                            include: ['empleado']
                        }
                    ]
                });
                res.status(200).json({
                    success: true,
                    data: citas,
                    message: 'Citas del cliente obtenidas exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener las citas del cliente',
                    error: error
                });
            }
        });
    }
}
exports.CitaController = CitaController;
exports.citaController = new CitaController();
