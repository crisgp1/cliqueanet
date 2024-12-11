"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuario_controller_1 = require("../controllers/usuario.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
const controller = new usuario_controller_1.UsuarioController();
// Rutas públicas
router.post('/login', controller.login);
// Rutas protegidas - requieren autenticación
router.use(auth_middleware_1.verificarToken);
// Rutas para administradores y RRHH
router.post('/', (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador, types_1.RolUsuario.RRHH]), controller.crearUsuario);
router.get('/', (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador, types_1.RolUsuario.RRHH, types_1.RolUsuario.Gerente_general]), controller.obtenerTodosUsuarios);
router.get('/:id', (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador, types_1.RolUsuario.RRHH, types_1.RolUsuario.Gerente_general]), controller.obtenerUsuarioPorId);
router.put('/:id', (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador, types_1.RolUsuario.RRHH]), controller.actualizarUsuario);
router.delete('/:id', (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador]), controller.eliminarUsuario);
// Rutas adicionales
router.get('/rol/:rol', (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador, types_1.RolUsuario.RRHH, types_1.RolUsuario.Gerente_general]), controller.buscarUsuariosPorRol);
router.get('/correo/:correo', (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador, types_1.RolUsuario.RRHH]), controller.buscarUsuarioPorCorreo);
exports.default = router;
