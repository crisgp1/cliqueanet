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
const credito_model_1 = require("../models/credito.model");
const router = (0, express_1.Router)();
// GET all creditos
const getAllCreditos = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const creditos = yield credito_model_1.Credito.findAll();
        res.json(creditos);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener créditos', error });
    }
});
// GET credito by ID
const getCreditoById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const credito = yield credito_model_1.Credito.findByPk(req.params.id);
        if (!credito) {
            res.status(404).json({ message: 'Crédito no encontrado' });
        }
        else {
            res.json(credito);
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener crédito', error });
    }
});
// POST create new credito
const createCredito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const credito = yield credito_model_1.Credito.create(req.body);
        res.status(201).json(credito);
    }
    catch (error) {
        res.status(400).json({ message: 'Error al crear crédito', error });
    }
});
// PUT update credito
const updateCredito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const credito = yield credito_model_1.Credito.findByPk(req.params.id);
        if (!credito) {
            res.status(404).json({ message: 'Crédito no encontrado' });
        }
        else {
            yield credito.update(req.body);
            res.json(credito);
        }
    }
    catch (error) {
        res.status(400).json({ message: 'Error al actualizar crédito', error });
    }
});
// DELETE credito
const deleteCredito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const credito = yield credito_model_1.Credito.findByPk(req.params.id);
        if (!credito) {
            res.status(404).json({ message: 'Crédito no encontrado' });
        }
        else {
            yield credito.destroy();
            res.status(204).send();
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar crédito', error });
    }
});
// Route definitions
router.get('/', getAllCreditos);
router.get('/:id', getCreditoById);
router.post('/', createCredito);
router.put('/:id', updateCredito);
router.delete('/:id', deleteCredito);
exports.default = router;
