import { Router } from 'express';
import { empleadoController } from '../controllers/empleado.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { RolUsuario } from '../types';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Definir los roles permitidos
const rolesPermitidos = [RolUsuario.Administrador, RolUsuario.Gerente_general];

// Middleware de autenticación para todas las rutas
router.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
        await verificarToken(req, res, next);
    } catch (error) {
        next(error);
    }
});

// Middleware de verificación de rol
const checkRol = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await verificarRol(rolesPermitidos)(req, res, next);
    } catch (error) {
        next(error);
    }
};

// Rutas para empleados
router.get('/', checkRol, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await empleadoController.obtenerEmpleados(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', checkRol, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await empleadoController.obtenerEmpleadoPorId(req, res);
    } catch (error) {
        next(error);
    }
});

router.post('/', checkRol, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await empleadoController.crearEmpleado(req, res);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', checkRol, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await empleadoController.actualizarEmpleado(req, res);
    } catch (error) {
        next(error);
    }
});

router.put('/:id/desactivar', checkRol, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await empleadoController.desactivarEmpleado(req, res);
    } catch (error) {
        next(error);
    }
});

router.put('/:id/reactivar', checkRol, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await empleadoController.reactivarEmpleado(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;