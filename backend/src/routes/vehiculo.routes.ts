import { Router, RequestHandler } from 'express';
import { Vehiculo } from '../models/vehiculo.model';

const router = Router();

// GET all vehiculos
const getAllVehiculos: RequestHandler = async (_req, res) => {
  try {
    const vehiculos = await Vehiculo.findAll();
    res.json(vehiculos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener vehículos', error });
  }
};

// GET vehiculo by ID
const getVehiculoById: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const vehiculo = await Vehiculo.findByPk(req.params.id);
    if (!vehiculo) {
      res.status(404).json({ message: 'Vehículo no encontrado' });
    } else {
      res.json(vehiculo);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener vehículo', error });
  }
};

// POST create new vehiculo
const createVehiculo: RequestHandler = async (req, res) => {
  try {
    const vehiculo = await Vehiculo.create(req.body);
    res.status(201).json(vehiculo);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear vehículo', error });
  }
};

// PUT update vehiculo
const updateVehiculo: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const vehiculo = await Vehiculo.findByPk(req.params.id);
    if (!vehiculo) {
      res.status(404).json({ message: 'Vehículo no encontrado' });
    } else {
      await vehiculo.update(req.body);
      res.json(vehiculo);
    }
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar vehículo', error });
  }
};

// DELETE vehiculo
const deleteVehiculo: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const vehiculo = await Vehiculo.findByPk(req.params.id);
    if (!vehiculo) {
      res.status(404).json({ message: 'Vehículo no encontrado' });
    } else {
      await vehiculo.destroy();
      res.status(204).send();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar vehículo', error });
  }
};

// Route definitions
router.get('/', getAllVehiculos);
router.get('/:id', getVehiculoById);
router.post('/', createVehiculo);
router.put('/:id', updateVehiculo);
router.delete('/:id', deleteVehiculo);

export default router;