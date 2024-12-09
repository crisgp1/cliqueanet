import { Router, RequestHandler } from 'express';
import { Transaccion } from '../models/transaccion.model';

const router = Router();

// GET all transacciones
const getAllTransacciones: RequestHandler = async (_req, res) => {
  try {
    const transacciones = await Transaccion.findAll();
    res.json(transacciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener transacciones', error });
  }
};

// GET transaccion by ID
const getTransaccionById: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const transaccion = await Transaccion.findByPk(req.params.id);
    if (!transaccion) {
      res.status(404).json({ message: 'Transacción no encontrada' });
    } else {
      res.json(transaccion);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener transacción', error });
  }
};

// POST create new transaccion
const createTransaccion: RequestHandler = async (req, res) => {
  try {
    const transaccion = await Transaccion.create(req.body);
    res.status(201).json(transaccion);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear transacción', error });
  }
};

// PUT update transaccion
const updateTransaccion: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const transaccion = await Transaccion.findByPk(req.params.id);
    if (!transaccion) {
      res.status(404).json({ message: 'Transacción no encontrada' });
    } else {
      await transaccion.update(req.body);
      res.json(transaccion);
    }
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar transacción', error });
  }
};

// DELETE transaccion
const deleteTransaccion: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const transaccion = await Transaccion.findByPk(req.params.id);
    if (!transaccion) {
      res.status(404).json({ message: 'Transacción no encontrada' });
    } else {
      await transaccion.destroy();
      res.status(204).send();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar transacción', error });
  }
};

// Route definitions
router.get('/', getAllTransacciones);
router.get('/:id', getTransaccionById);
router.post('/', createTransaccion);
router.put('/:id', updateTransaccion);
router.delete('/:id', deleteTransaccion);

export default router;