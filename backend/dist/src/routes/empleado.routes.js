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
const empleado_controller_1 = require("../controllers/empleado.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
// Definir los roles permitidos
const rolesPermitidos = [types_1.RolUsuario.Administrador, types_1.RolUsuario.Gerente_general];
// Middleware de autenticación para todas las rutas
router.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, auth_middleware_1.verificarToken)(req, res, next);
    }
    catch (error) {
        next(error);
    }
}));
// Middleware de verificación de rol
const checkRol = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, auth_middleware_1.verificarRol)(rolesPermitidos)(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
// Rutas para empleados
router.get('/', checkRol, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield empleado_controller_1.empleadoController.obtenerEmpleados(req, res);
    }
    catch (error) {
        next(error);
    }
}));
router.get('/:id', checkRol, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield empleado_controller_1.empleadoController.obtenerEmpleadoPorId(req, res);
    }
    catch (error) {
        next(error);
    }
}));
router.post('/', checkRol, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield empleado_controller_1.empleadoController.crearEmpleado(req, res);
    }
    catch (error) {
        next(error);
    }
}));
router.put('/:id', checkRol, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield empleado_controller_1.empleadoController.actualizarEmpleado(req, res);
    }
    catch (error) {
        next(error);
    }
}));
router.put('/:id/desactivar', checkRol, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield empleado_controller_1.empleadoController.desactivarEmpleado(req, res);
    }
    catch (error) {
        next(error);
    }
}));
router.put('/:id/reactivar', checkRol, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield empleado_controller_1.empleadoController.reactivarEmpleado(req, res);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
