import { Router } from 'express';
import { empleadoController } from '../controllers/empleado.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { RolUsuario } from '../types';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(verificarToken);

// Roles permitidos para operaciones de modificación
const rolesPermitidos = [RolUsuario.Administrador, RolUsuario.Gerente_general];

// Rutas públicas (solo requieren token)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await empleadoController.obtenerEmpleados(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await empleadoController.obtenerEmpleadoPorId(req, res);
    } catch (error) {
        next(error);
    }
});

// Rutas protegidas (requieren roles específicos)
router.post('/', verificarRol(rolesPermitidos), async (req: Request, res: Response, next: NextFunction) => {
    try {
        await empleadoController.crearEmpleado(req, res);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', verificarRol(rolesPermitidos), async (req: Request, res: Response, next: NextFunction) => {
    try {
        await empleadoController.actualizarEmpleado(req, res);
    } catch (error) {
        next(error);
    }
});

router.put('/:id/desactivar', verificarRol(rolesPermitidos), async (req: Request, res: Response, next: NextFunction) => {
    try {
        await empleadoController.desactivarEmpleado(req, res);
    } catch (error) {
        next(error);
    }
});

router.put('/:id/reactivar', verificarRol(rolesPermitidos), async (req: Request, res: Response, next: NextFunction) => {
    try {
        await empleadoController.reactivarEmpleado(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;