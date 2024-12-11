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
const tipo_transaccion_controller_1 = require("../../controllers/catalogs/tipo-transaccion.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const types_1 = require("../../types");
const router = (0, express_1.Router)();
const controller = new tipo_transaccion_controller_1.TipoTransaccionController();
// Aplicar middleware de autenticación a todas las rutas
router.use(auth_middleware_1.verificarToken);
// Obtener todos los tipos de transacción
router.get('/', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield controller.getAll(req, res);
})));
// Obtener un tipo de transacción por ID
router.get('/:id', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield controller.getById(req, res);
})));
// Crear un nuevo tipo de transacción (solo administradores)
router.post('/', (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador]), ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield controller.create(req, res);
})));
// Actualizar un tipo de transacción (solo administradores)
router.put('/:id', (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador]), ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield controller.update(req, res);
})));
// Eliminar un tipo de transacción (solo administradores)
router.delete('/:id', (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador]), ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield controller.delete(req, res);
})));
exports.default = router;
