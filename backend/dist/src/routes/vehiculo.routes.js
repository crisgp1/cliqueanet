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
const vehiculo_controller_1 = require("../controllers/vehiculo.controller");
const router = (0, express_1.Router)();
const controller = new vehiculo_controller_1.VehiculoController();
// GET all vehiculos
router.get('/', controller.getAll.bind(controller));
// GET vehiculo by ID
router.get('/:id', controller.getById.bind(controller));
// GET vehiculo by filters (num_serie, placas, num_motor)
router.get('/search/filters', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { numSerie, placas, numMotor } = req.query;
    try {
        if (numSerie) {
            yield controller.getByNumSerie(req, res);
            return;
        }
        if (placas) {
            yield controller.getByPlacas(req, res);
            return;
        }
        if (numMotor) {
            yield controller.getByNumMotor(req, res);
            return;
        }
        res.status(400).json({
            success: false,
            message: 'Se debe proporcionar al menos un criterio de búsqueda (numSerie, placas o numMotor)'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar vehículos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
}));
// POST create new vehiculo
router.post('/', controller.create.bind(controller));
// PUT update vehiculo
router.put('/:id', controller.update.bind(controller));
// DELETE vehiculo
router.delete('/:id', controller.delete.bind(controller));
exports.default = router;
