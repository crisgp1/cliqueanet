import { Router, RequestHandler } from 'express';
import { RolUsuarioController } from '../../controllers/catalogs/rol-usuario.controller';
import { verificarToken, verificarRol } from '../../middlewares/auth.middleware';
import { RolUsuario } from '../../types';

const router = Router();
const controller = new RolUsuarioController();

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken as RequestHandler);

// Obtener todos los roles de usuario
router.get('/', (async (req, res) => {
    await controller.getAll(req, res);
}) as RequestHandler);

// Obtener un rol de usuario por ID
router.get('/:id', (async (req, res) => {
    await controller.getById(req, res);
}) as RequestHandler);

// Crear un nuevo rol de usuario (solo administradores)
router.post('/', 
    verificarRol([RolUsuario.Administrador]) as RequestHandler,
    (async (req, res) => {
        await controller.create(req, res);
    }) as RequestHandler
);

// Actualizar un rol de usuario (solo administradores)
router.put('/:id', 
    verificarRol([RolUsuario.Administrador]) as RequestHandler,
    (async (req, res) => {
        await controller.update(req, res);
    }) as RequestHandler
);

// Eliminar un rol de usuario (solo administradores)
router.delete('/:id', 
    verificarRol([RolUsuario.Administrador]) as RequestHandler,
    (async (req, res) => {
        await controller.delete(req, res);
    }) as RequestHandler
);

export default router;