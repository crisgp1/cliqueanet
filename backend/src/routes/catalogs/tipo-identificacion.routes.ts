import { Router, RequestHandler } from 'express';
import { TipoIdentificacionController } from '../../controllers/catalogs/tipo-identificacion.controller';
import { verificarToken, verificarRol } from '../../middlewares/auth.middleware';
import { RolUsuario } from '../../types';

const router = Router();
const controller = new TipoIdentificacionController();

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken as RequestHandler);

// Obtener todos los tipos de identificación
router.get('/', (async (req, res) => {
    await controller.getAll(req, res);
}) as RequestHandler);

// Obtener un tipo de identificación por ID
router.get('/:id', (async (req, res) => {
    await controller.getById(req, res);
}) as RequestHandler);

// Crear un nuevo tipo de identificación (solo administradores)
router.post('/', 
    verificarRol([RolUsuario.Administrador]) as RequestHandler,
    (async (req, res) => {
        await controller.create(req, res);
    }) as RequestHandler
);

// Actualizar un tipo de identificación (solo administradores)
router.put('/:id', 
    verificarRol([RolUsuario.Administrador]) as RequestHandler,
    (async (req, res) => {
        await controller.update(req, res);
    }) as RequestHandler
);

// Eliminar un tipo de identificación (solo administradores)
router.delete('/:id', 
    verificarRol([RolUsuario.Administrador]) as RequestHandler,
    (async (req, res) => {
        await controller.delete(req, res);
    }) as RequestHandler
);

export default router;