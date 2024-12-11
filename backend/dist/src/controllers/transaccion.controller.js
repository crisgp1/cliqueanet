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
exports.deleteTransaccion = exports.updateTransaccion = exports.createTransaccion = exports.getTransaccionById = exports.getAllTransacciones = void 0;
const transaccion_model_1 = require("../models/transaccion.model");
// GET all transacciones
const getAllTransacciones = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transacciones = yield transaccion_model_1.Transaccion.findAll({
            include: ['usuarioTransaccion', 'cliente', 'vehiculo', 'credito', 'tipoTransaccion']
        });
        res.json(transacciones);
    }
    catch (error) {
        console.error('Error al obtener transacciones:', error);
        res.status(500).json({ message: 'Error al obtener transacciones', error });
    }
});
exports.getAllTransacciones = getAllTransacciones;
// GET transaccion by ID
const getTransaccionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transaccion = yield transaccion_model_1.Transaccion.findByPk(req.params.id, {
            include: ['usuarioTransaccion', 'cliente', 'vehiculo', 'credito', 'tipoTransaccion']
        });
        if (!transaccion) {
            res.status(404).json({ message: 'Transacción no encontrada' });
            return;
        }
        res.json(transaccion);
    }
    catch (error) {
        console.error('Error al obtener transacción:', error);
        res.status(500).json({ message: 'Error al obtener transacción', error });
    }
});
exports.getTransaccionById = getTransaccionById;
// POST create new transaccion
const createTransaccion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transaccion = yield transaccion_model_1.Transaccion.create(Object.assign(Object.assign({}, req.body), { fecha: new Date() }));
        const transaccionConRelaciones = yield transaccion_model_1.Transaccion.findByPk(transaccion.id, {
            include: ['usuarioTransaccion', 'cliente', 'vehiculo', 'credito', 'tipoTransaccion']
        });
        res.status(201).json(transaccionConRelaciones);
    }
    catch (error) {
        console.error('Error al crear transacción:', error);
        res.status(400).json({ message: 'Error al crear transacción', error });
    }
});
exports.createTransaccion = createTransaccion;
// PUT update transaccion
const updateTransaccion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transaccion = yield transaccion_model_1.Transaccion.findByPk(req.params.id);
        if (!transaccion) {
            res.status(404).json({ message: 'Transacción no encontrada' });
            return;
        }
        yield transaccion.update(req.body);
        const transaccionActualizada = yield transaccion_model_1.Transaccion.findByPk(req.params.id, {
            include: ['usuarioTransaccion', 'cliente', 'vehiculo', 'credito', 'tipoTransaccion']
        });
        res.json(transaccionActualizada);
    }
    catch (error) {
        console.error('Error al actualizar transacción:', error);
        res.status(400).json({ message: 'Error al actualizar transacción', error });
    }
});
exports.updateTransaccion = updateTransaccion;
// DELETE transaccion
const deleteTransaccion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transaccion = yield transaccion_model_1.Transaccion.findByPk(req.params.id);
        if (!transaccion) {
            res.status(404).json({ message: 'Transacción no encontrada' });
            return;
        }
        yield transaccion.destroy();
        res.status(204).send();
    }
    catch (error) {
        console.error('Error al eliminar transacción:', error);
        res.status(500).json({ message: 'Error al eliminar transacción', error });
    }
});
exports.deleteTransaccion = deleteTransaccion;
