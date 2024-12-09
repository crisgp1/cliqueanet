import { Router, Request, Response, NextFunction } from 'express';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { RolUsuario } from '../types';

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
router.get('/list', autenticarYVerificarRol, (req: Request, res: Response) => {
    res.json({ message: 'Lista de documentos' });
});

// Obtener un documento por ID
router.get('/:id', autenticarYVerificarRol, (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: `Obtener documento por ID: ${id}` });
});

// Subir un nuevo documento
router.post('/', autenticarYVerificarRol, (req: Request, res: Response) => {
    const documentoData = req.body;
    res.json({ message: 'Subir documento', data: documentoData });
});

// Actualizar información de un documento
router.put('/:id', autenticarYVerificarRol, (req: Request, res: Response) => {
    const { id } = req.params;
    const documentoData = req.body;
    res.json({ message: `Actualizar documento: ${id}`, data: documentoData });
});

// Eliminar un documento (solo admin)
router.delete('/:id', verificarAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: `Eliminar documento: ${id}` });
});

// Descargar un documento
router.get('/:id/descargar', autenticarYVerificarRol, (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: `Descargar documento: ${id}` });
});

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