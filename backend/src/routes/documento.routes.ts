import { Router } from 'express';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { RolUsuario } from '../types';
import { documentoController } from '../controllers/documento.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Obtener todos los documentos
router.get(
    '/list',
    verificarToken,
    verificarRol([RolUsuario.Administrador, RolUsuario.Ventas, RolUsuario.RRHH]),
    documentoController.obtenerDocumentos
);

// Obtener documentos por empleado
router.get(
    '/empleado/:idEmpleado',
    verificarToken,
    verificarRol([RolUsuario.Administrador, RolUsuario.RRHH]),
    documentoController.obtenerDocumentosPorEmpleado
);

// Obtener un documento por ID
router.get(
    '/:id',
    verificarToken,
    verificarRol([RolUsuario.Administrador, RolUsuario.Ventas, RolUsuario.RRHH]),
    documentoController.obtenerDocumentoPorId
);

// Crear un nuevo documento
router.post(
    '/',
    verificarToken,
    verificarRol([RolUsuario.Administrador, RolUsuario.Ventas, RolUsuario.RRHH]),
    upload.single('file'),
    documentoController.crearDocumento
);

// Actualizar información de un documento
router.put(
    '/:id',
    verificarToken,
    verificarRol([RolUsuario.Administrador, RolUsuario.RRHH]),
    upload.single('file'),
    documentoController.actualizarDocumento
);

// Eliminar un documento (solo admin)
router.delete(
    '/:id',
    verificarToken,
    verificarRol([RolUsuario.Administrador]),
    documentoController.eliminarDocumento
);

// Aprobar un documento (solo admin y RRHH)
router.post(
    '/:id/aprobar',
    verificarToken,
    verificarRol([RolUsuario.Administrador, RolUsuario.RRHH]),
    documentoController.aprobarDocumento
);

// Rechazar un documento (solo admin y RRHH)
router.post(
    '/:id/rechazar',
    verificarToken,
    verificarRol([RolUsuario.Administrador, RolUsuario.RRHH]),
    documentoController.rechazarDocumento
);

export default router;