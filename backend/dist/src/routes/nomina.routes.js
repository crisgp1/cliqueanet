"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
// Middleware de autenticación y rol para RRHH y Admin
const autenticarYVerificarRolNomina = (req, res, next) => {
    (0, auth_middleware_1.verificarToken)(req, res, () => {
        (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador, types_1.RolUsuario.RRHH])(req, res, next);
    });
};
// Middleware solo para admin
const verificarAdmin = (req, res, next) => {
    (0, auth_middleware_1.verificarToken)(req, res, () => {
        (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador])(req, res, next);
    });
};
// Rutas protegidas
// Obtener todas las nóminas
router.get('/list', autenticarYVerificarRolNomina, (req, res) => {
    res.json({ message: 'Lista de nóminas' });
});
// Obtener una nómina por ID
router.get('/:id', autenticarYVerificarRolNomina, (req, res) => {
    const { id } = req.params;
    res.json({ message: `Obtener nómina por ID: ${id}` });
});
// Crear una nueva nómina
router.post('/', autenticarYVerificarRolNomina, (req, res) => {
    const nominaData = req.body;
    res.json({ message: 'Crear nómina', data: nominaData });
});
// Actualizar una nómina (solo admin)
router.put('/:id', verificarAdmin, (req, res) => {
    const { id } = req.params;
    const nominaData = req.body;
    res.json({ message: `Actualizar nómina: ${id}`, data: nominaData });
});
// Registrar pago de nómina
router.post('/:id/pago', autenticarYVerificarRolNomina, (req, res) => {
    const { id } = req.params;
    const pagoData = req.body;
    res.json({ message: `Registrar pago de nómina: ${id}`, data: pagoData });
});
// Registrar comisiones
router.post('/:id/comisiones', autenticarYVerificarRolNomina, (req, res) => {
    const { id } = req.params;
    const comisionesData = req.body;
    res.json({ message: `Registrar comisiones para nómina: ${id}`, data: comisionesData });
});
// Obtener nóminas por empleado
router.get('/empleado/:empleadoId', autenticarYVerificarRolNomina, (req, res) => {
    const { empleadoId } = req.params;
    res.json({ message: `Obtener nóminas del empleado: ${empleadoId}` });
});
// Obtener nóminas por período
router.get('/periodo/:inicio/:fin', autenticarYVerificarRolNomina, (req, res) => {
    const { inicio, fin } = req.params;
    res.json({ message: `Obtener nóminas del período: ${inicio} al ${fin}` });
});
// Generar reporte de nómina
router.post('/reporte', autenticarYVerificarRolNomina, (req, res) => {
    const filtros = req.body;
    res.json({ message: 'Generar reporte de nóminas', filtros });
});
// Calcular deducciones
router.post('/:id/deducciones', autenticarYVerificarRolNomina, (req, res) => {
    const { id } = req.params;
    const deduccionesData = req.body;
    res.json({ message: `Calcular deducciones para nómina: ${id}`, data: deduccionesData });
});
// Aprobar nómina (solo admin)
router.post('/:id/aprobar', verificarAdmin, (req, res) => {
    const { id } = req.params;
    res.json({ message: `Aprobar nómina: ${id}` });
});
exports.default = router;
