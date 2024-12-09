import { Router, RequestHandler } from 'express';
import { Credito } from '../models/credito.model';

const router = Router();

// GET all creditos
const getAllCreditos: RequestHandler = async (_req, res) => {
  try {
    const creditos = await Credito.findAll();
    res.json(creditos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener créditos', error });
  }
};

// GET credito by ID
const getCreditoById: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const credito = await Credito.findByPk(req.params.id);
    if (!credito) {
      res.status(404).json({ message: 'Crédito no encontrado' });
    } else {
      res.json(credito);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener crédito', error });
  }
};

// POST create new credito
const createCredito: RequestHandler = async (req, res) => {
  try {
    const credito = await Credito.create(req.body);
    res.status(201).json(credito);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear crédito', error });
  }
};

// PUT update credito
const updateCredito: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const credito = await Credito.findByPk(req.params.id);
    if (!credito) {
      res.status(404).json({ message: 'Crédito no encontrado' });
    } else {
      await credito.update(req.body);
      res.json(credito);
    }
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar crédito', error });
  }
};

// DELETE credito
const deleteCredito: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const credito = await Credito.findByPk(req.params.id);
    if (!credito) {
      res.status(404).json({ message: 'Crédito no encontrado' });
    } else {
      await credito.destroy();
      res.status(204).send();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar crédito', error });
  }
};

// Route definitions
router.get('/', getAllCreditos);
router.get('/:id', getCreditoById);
router.post('/', createCredito);
router.put('/:id', updateCredito);
router.delete('/:id', deleteCredito);

export default router;