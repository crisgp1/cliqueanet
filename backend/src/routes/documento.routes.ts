import { Router, Request, Response, NextFunction } from 'express';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { RolUsuario } from '../types';
import { documentoController } from '../controllers/documento.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Middleware de autenticación y rol
const autenticarYVerificarRol = (req: Request, res: Response, next: NextFunction) => {
    verificarToken(req, res, () => {
        verificarRol([RolUsuario.Administrador, RolUsuario.Ventas, RolUsuario.RRHH])(req, res, next);
    });
};

// Middleware solo para admin
const verificarAdmin = (req: Request, res: Response, next: NextFunction) => {
    verificarToken(req, res, () => {
        verificarRol([RolUsuario.Administrador])(req, res, next);
    });
};

// Rutas protegidas
// Obtener todos los documentos
router.get('/list', autenticarYVerificarRol, documentoController.obtenerDocumentos.bind(documentoController));

// Obtener documentos por empleado
router.get('/empleado/:idEmpleado', autenticarYVerificarRol, documentoController.obtenerDocumentosPorEmpleado.bind(documentoController));

// Obtener un documento por ID
router.get('/:id', autenticarYVerificarRol, documentoController.obtenerDocumentoPorId.bind(documentoController));

// Crear un nuevo documento
router.post('/', 
    autenticarYVerificarRol, 
    upload.single('file'), 
    documentoController.crearDocumento.bind(documentoController)
  );

// Actualizar información de un documento
router.put('/:id', autenticarYVerificarRol, documentoController.actualizarDocumento.bind(documentoController));

// Eliminar un documento (solo admin)
router.delete('/:id', verificarAdmin, documentoController.eliminarDocumento.bind(documentoController));

// Aprobar un documento (solo admin)
router.post('/:id/aprobar', verificarAdmin, documentoController.aprobarDocumento.bind(documentoController));

// Rechazar un documento (solo admin)
router.post('/:id/rechazar', verificarAdmin, documentoController.rechazarDocumento.bind(documentoController));

// Obtener documentos por entidad
router.get('/entidad/:tipo/:id', autenticarYVerificarRol, (req: Request, res: Response) => {
    const { tipo, id } = req.params;
    res.json({ message: `Obtener documentos de ${tipo} con ID: ${id}` });
});

// Obtener documentos por categoría
router.get('/categoria/:categoria', autenticarYVerificarRol, (req: Request, res: Response) => {
    const { categoria } = req.params;
    res.json({ message: `Obtener documentos de categoría: ${categoria}` });
});

// Verificar documento (solo admin)
router.post('/:id/verificar', verificarAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: `Verificar documento: ${id}` });
});

// Obtener historial de cambios de un documento
router.get('/:id/historial', autenticarYVerificarRol, (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: `Obtener historial del documento: ${id}` });
});

// Buscar documentos
router.post('/buscar', autenticarYVerificarRol, (req: Request, res: Response) => {
    const filtros = req.body;
    res.json({ message: 'Buscar documentos', filtros });
});

export default router;