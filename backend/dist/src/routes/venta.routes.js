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
const express_1 = require("express");
const venta_model_1 = require("../models/venta.model");
const router = (0, express_1.Router)();
// GET all ventas
const getAllVentas = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ventas = yield venta_model_1.Venta.findAll();
        res.json(ventas);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener ventas', error });
    }
});
// GET venta by ID
const getVentaById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const venta = yield venta_model_1.Venta.findByPk(req.params.id);
        if (!venta) {
            res.status(404).json({ message: 'Venta no encontrada' });
        }
        else {
            res.json(venta);
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener venta', error });
    }
});
// POST create new venta
const createVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const venta = yield venta_model_1.Venta.create(req.body);
        res.status(201).json(venta);
    }
    catch (error) {
        res.status(400).json({ message: 'Error al crear venta', error });
    }
});
// PUT update venta
const updateVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const venta = yield venta_model_1.Venta.findByPk(req.params.id);
        if (!venta) {
            res.status(404).json({ message: 'Venta no encontrada' });
        }
        else {
            yield venta.update(req.body);
            res.json(venta);
        }
    }
    catch (error) {
        res.status(400).json({ message: 'Error al actualizar venta', error });
    }
});
// DELETE venta
const deleteVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const venta = yield venta_model_1.Venta.findByPk(req.params.id);
        if (!venta) {
            res.status(404).json({ message: 'Venta no encontrada' });
        }
        else {
            yield venta.destroy();
            res.status(204).send();
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar venta', error });
    }
});
// Route definitions
router.get('/', getAllVentas);
router.get('/:id', getVentaById);
router.post('/', createVenta);
router.put('/:id', updateVenta);
router.delete('/:id', deleteVenta);
exports.default = router;
