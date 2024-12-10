import { Router } from 'express';
import {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  searchClientes
} from '../controllers/cliente.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { RolUsuario } from '../types';

const router = Router();

// Aplicar verificación de token a todas las rutas
router.use(verificarToken);

// Rutas públicas (solo requieren token)
router.get('/', getAllClientes);
router.get('/search', searchClientes);
router.get('/:id', getClienteById);

// Rutas que requieren roles específicos
router.post('/', verificarRol([RolUsuario.Administrador, RolUsuario.Ventas]), createCliente);
router.put('/:id', verificarRol([RolUsuario.Administrador, RolUsuario.Ventas]), updateCliente);
router.delete('/:id', verificarRol([RolUsuario.Administrador]), deleteCliente);

export default router;