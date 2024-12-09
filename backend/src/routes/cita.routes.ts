import { Router, Request, Response, NextFunction } from 'express';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { RolUsuario } from '../types';

const router = Router();

// Middleware de autenticación y rol
const autenticarYVerificarRol = (req: Request, res: Response, next: NextFunction) => {
    verificarToken(req, res, () => {
        verificarRol([RolUsuario.Administrador, RolUsuario.Ventas])(req, res, next);
    });
};

// Rutas públicas
router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Ruta de citas' });
});

// Rutas protegidas
// Obtener todas las citas
router.get('/list', autenticarYVerificarRol, (req: Request, res: Response) => {
    res.json({ message: 'Lista de citas' });
});

// Obtener una cita por ID
router.get('/:id', autenticarYVerificarRol, (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: `Obtener cita por ID: ${id}` });
});

// Crear una nueva cita
router.post('/', autenticarYVerificarRol, (req: Request, res: Response) => {
    const citaData = req.body;
    res.json({ message: 'Crear cita', data: citaData });
});

// Actualizar una cita
router.put('/:id', autenticarYVerificarRol, (req: Request, res: Response) => {
    const { id } = req.params;
    const citaData = req.body;
    res.json({ message: `Actualizar cita: ${id}`, data: citaData });
});

// Eliminar una cita
router.delete('/:id', autenticarYVerificarRol, (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: `Eliminar cita: ${id}` });
});

export default router;