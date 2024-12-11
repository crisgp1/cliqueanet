"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaccion_controller_1 = require("../controllers/transaccion.controller");
const router = (0, express_1.Router)();
// Route definitions
router.get('/', transaccion_controller_1.getAllTransacciones);
router.get('/:id', transaccion_controller_1.getTransaccionById);
router.post('/', transaccion_controller_1.createTransaccion);
router.put('/:id', transaccion_controller_1.updateTransaccion);
router.delete('/:id', transaccion_controller_1.deleteTransaccion);
exports.default = router;
