"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cliente_controller_1 = require("../controllers/cliente.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
// Aplicar verificación de token a todas las rutas
router.use(auth_middleware_1.verificarToken);
// Rutas públicas (solo requieren token)
router.get('/', cliente_controller_1.getAllClientes);
router.get('/search', cliente_controller_1.searchClientes);
router.get('/:id', cliente_controller_1.getClienteById);
// Rutas que requieren roles específicos
router.post('/', (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador, types_1.RolUsuario.Ventas]), cliente_controller_1.createCliente);
router.put('/:id', (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador, types_1.RolUsuario.Ventas]), cliente_controller_1.updateCliente);
router.delete('/:id', (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador]), cliente_controller_1.deleteCliente);
exports.default = router;
