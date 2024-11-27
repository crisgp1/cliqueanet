import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { RolUsuario } from '../types';

const router = Router();
const controller = new UsuarioController();

// Rutas públicas
router.post('/login', controller.login);

// Rutas protegidas - requieren autenticación
router.use(verificarToken);

// Rutas para administradores y RRHH
router.post('/', 
  verificarRol([RolUsuario.Administrador, RolUsuario.RRHH]), 
  controller.crearUsuario
);

router.get('/', 
  verificarRol([RolUsuario.Administrador, RolUsuario.RRHH, RolUsuario.Gerente_general]), 
  controller.obtenerTodosUsuarios
);

router.get('/:id', 
  verificarRol([RolUsuario.Administrador, RolUsuario.RRHH, RolUsuario.Gerente_general]), 
  controller.obtenerUsuarioPorId
);

router.put('/:id', 
  verificarRol([RolUsuario.Administrador, RolUsuario.RRHH]), 
  controller.actualizarUsuario
);

router.delete('/:id', 
  verificarRol([RolUsuario.Administrador]), 
  controller.eliminarUsuario
);

// Rutas adicionales
router.get('/rol/:rol', 
  verificarRol([RolUsuario.Administrador, RolUsuario.RRHH, RolUsuario.Gerente_general]), 
  controller.buscarUsuariosPorRol
);

router.get('/correo/:correo', 
  verificarRol([RolUsuario.Administrador, RolUsuario.RRHH]), 
  controller.buscarUsuarioPorCorreo
);

export default router;