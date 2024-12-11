"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const types_1 = require("../types");
const documento_controller_1 = require("../controllers/documento.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
// Middleware de autenticación y rol
const autenticarYVerificarRol = (req, res, next) => {
    (0, auth_middleware_1.verificarToken)(req, res, () => {
        (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador, types_1.RolUsuario.Ventas, types_1.RolUsuario.RRHH])(req, res, next);
    });
};
// Middleware solo para admin
const verificarAdmin = (req, res, next) => {
    (0, auth_middleware_1.verificarToken)(req, res, () => {
        (0, auth_middleware_1.verificarRol)([types_1.RolUsuario.Administrador])(req, res, next);
    });
};
// Rutas protegidas
// Obtener todos los documentos
router.get('/list', autenticarYVerificarRol, documento_controller_1.documentoController.obtenerDocumentos.bind(documento_controller_1.documentoController));
// Obtener documentos por empleado
router.get('/empleado/:idEmpleado', autenticarYVerificarRol, documento_controller_1.documentoController.obtenerDocumentosPorEmpleado.bind(documento_controller_1.documentoController));
// Obtener un documento por ID
router.get('/:id', autenticarYVerificarRol, documento_controller_1.documentoController.obtenerDocumentoPorId.bind(documento_controller_1.documentoController));
// Crear un nuevo documento
router.post('/', autenticarYVerificarRol, upload_middleware_1.upload.single('file'), documento_controller_1.documentoController.crearDocumento.bind(documento_controller_1.documentoController));
// Actualizar información de un documento
router.put('/:id', autenticarYVerificarRol, documento_controller_1.documentoController.actualizarDocumento.bind(documento_controller_1.documentoController));
// Eliminar un documento (solo admin)
router.delete('/:id', verificarAdmin, documento_controller_1.documentoController.eliminarDocumento.bind(documento_controller_1.documentoController));
// Aprobar un documento (solo admin)
router.post('/:id/aprobar', verificarAdmin, documento_controller_1.documentoController.aprobarDocumento.bind(documento_controller_1.documentoController));
// Rechazar un documento (solo admin)
router.post('/:id/rechazar', verificarAdmin, documento_controller_1.documentoController.rechazarDocumento.bind(documento_controller_1.documentoController));
// Obtener documentos por entidad
router.get('/entidad/:tipo/:id', autenticarYVerificarRol, (req, res) => {
    const { tipo, id } = req.params;
    res.json({ message: `Obtener documentos de ${tipo} con ID: ${id}` });
});
// Obtener documentos por categoría
router.get('/categoria/:categoria', autenticarYVerificarRol, (req, res) => {
    const { categoria } = req.params;
    res.json({ message: `Obtener documentos de categoría: ${categoria}` });
});
// Verificar documento (solo admin)
router.post('/:id/verificar', verificarAdmin, (req, res) => {
    const { id } = req.params;
    res.json({ message: `Verificar documento: ${id}` });
});
// Obtener historial de cambios de un documento
router.get('/:id/historial', autenticarYVerificarRol, (req, res) => {
    const { id } = req.params;
    res.json({ message: `Obtener historial del documento: ${id}` });
});
// Buscar documentos
router.post('/buscar', autenticarYVerificarRol, (req, res) => {
    const filtros = req.body;
    res.json({ message: 'Buscar documentos', filtros });
});
exports.default = router;
