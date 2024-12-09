import { Router, RequestHandler } from 'express';
import { Cliente } from '../models/cliente.model';

const router = Router();

// GET all clientes
const getAllClientes: RequestHandler = async (_req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clientes', error });
  }
};

// GET cliente by ID
const getClienteById: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      res.status(404).json({ message: 'Cliente no encontrado' });
    } else {
      res.json(cliente);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cliente', error });
  }
};

// POST create new cliente
const createCliente: RequestHandler = async (req, res) => {
  try {
    const cliente = await Cliente.create(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear cliente', error });
  }
};

// PUT update cliente
const updateCliente: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      res.status(404).json({ message: 'Cliente no encontrado' });
    } else {
      await cliente.update(req.body);
      res.json(cliente);
    }
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar cliente', error });
  }
};

// DELETE cliente
const deleteCliente: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      res.status(404).json({ message: 'Cliente no encontrado' });
    } else {
      await cliente.destroy();
      res.status(204).send();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar cliente', error });
  }
};

// Route definitions
router.get('/', getAllClientes);
router.get('/:id', getClienteById);
router.post('/', createCliente);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);

export default router;