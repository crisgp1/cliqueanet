import { Router, RequestHandler } from 'express';
import { Venta } from '../models/venta.model';

const router = Router();

// GET all ventas
const getAllVentas: RequestHandler = async (_req, res) => {
  try {
    const ventas = await Venta.findAll();
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ventas', error });
  }
};

// GET venta by ID
const getVentaById: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta) {
      res.status(404).json({ message: 'Venta no encontrada' });
    } else {
      res.json(venta);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener venta', error });
  }
};

// POST create new venta
const createVenta: RequestHandler = async (req, res) => {
  try {
    const venta = await Venta.create(req.body);
    res.status(201).json(venta);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear venta', error });
  }
};

// PUT update venta
const updateVenta: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta) {
      res.status(404).json({ message: 'Venta no encontrada' });
    } else {
      await venta.update(req.body);
      res.json(venta);
    }
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar venta', error });
  }
};

// DELETE venta
const deleteVenta: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta) {
      res.status(404).json({ message: 'Venta no encontrada' });
    } else {
      await venta.destroy();
      res.status(204).send();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar venta', error });
  }
};

// Route definitions
router.get('/', getAllVentas);
router.get('/:id', getVentaById);
router.post('/', createVenta);
router.put('/:id', updateVenta);
router.delete('/:id', deleteVenta);

export default router;