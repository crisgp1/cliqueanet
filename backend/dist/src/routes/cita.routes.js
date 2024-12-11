"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
// Middleware de autenticación y rol
const autenticarYVerificarRol = (req, res, next) => {
    (0, auth_middleware_1.verificarToken)(req, res, () => {
        (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador, types_1.RolUsuario.Ventas])(req, res, next);
    });
};
// Rutas públicas
router.get('/', (req, res) => {
    res.json({ message: 'Ruta de citas' });
});
// Rutas protegidas
// Obtener todas las citas
router.get('/list', autenticarYVerificarRol, (req, res) => {
    res.json({ message: 'Lista de citas' });
});
// Obtener una cita por ID
router.get('/:id', autenticarYVerificarRol, (req, res) => {
    const { id } = req.params;
    res.json({ message: `Obtener cita por ID: ${id}` });
});
// Crear una nueva cita
router.post('/', autenticarYVerificarRol, (req, res) => {
    const citaData = req.body;
    res.json({ message: 'Crear cita', data: citaData });
});
// Actualizar una cita
router.put('/:id', autenticarYVerificarRol, (req, res) => {
    const { id } = req.params;
    const citaData = req.body;
    res.json({ message: `Actualizar cita: ${id}`, data: citaData });
});
// Eliminar una cita
router.delete('/:id', autenticarYVerificarRol, (req, res) => {
    const { id } = req.params;
    res.json({ message: `Eliminar cita: ${id}` });
});
exports.default = router;
