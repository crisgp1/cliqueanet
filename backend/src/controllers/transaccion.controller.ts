import { Request, Response } from 'express';
import { Transaccion } from '../models/transaccion.model';

// GET all transacciones
export const getAllTransacciones = async (_req: Request, res: Response): Promise<void> => {
  try {
    const transacciones = await Transaccion.findAll({
      include: ['usuarioTransaccion', 'cliente', 'vehiculo', 'credito', 'tipoTransaccion']
    });
    res.json(transacciones);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ message: 'Error al obtener transacciones', error });
  }
};

// GET transaccion by ID
export const getTransaccionById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const transaccion = await Transaccion.findByPk(req.params.id, {
      include: ['usuarioTransaccion', 'cliente', 'vehiculo', 'credito', 'tipoTransaccion']
    });
    if (!transaccion) {
      res.status(404).json({ message: 'Transacción no encontrada' });
      return;
    }
    res.json(transaccion);
  } catch (error) {
    console.error('Error al obtener transacción:', error);
    res.status(500).json({ message: 'Error al obtener transacción', error });
  }
};

// POST create new transaccion
export const createTransaccion = async (req: Request, res: Response): Promise<void> => {
  try {
    const transaccion = await Transaccion.create({
      ...req.body,
      fecha: new Date()
    });
    
    const transaccionConRelaciones = await Transaccion.findByPk(transaccion.id, {
      include: ['usuarioTransaccion', 'cliente', 'vehiculo', 'credito', 'tipoTransaccion']
    });
    
    res.status(201).json(transaccionConRelaciones);
  } catch (error) {
    console.error('Error al crear transacción:', error);
    res.status(400).json({ message: 'Error al crear transacción', error });
  }
};

// PUT update transaccion
export const updateTransaccion = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const transaccion = await Transaccion.findByPk(req.params.id);
    if (!transaccion) {
      res.status(404).json({ message: 'Transacción no encontrada' });
      return;
    }

    await transaccion.update(req.body);
    
    const transaccionActualizada = await Transaccion.findByPk(req.params.id, {
      include: ['usuarioTransaccion', 'cliente', 'vehiculo', 'credito', 'tipoTransaccion']
    });
    
    res.json(transaccionActualizada);
  } catch (error) {
    console.error('Error al actualizar transacción:', error);
    res.status(400).json({ message: 'Error al actualizar transacción', error });
  }
};

// DELETE transaccion
export const deleteTransaccion = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const transaccion = await Transaccion.findByPk(req.params.id);
    if (!transaccion) {
      res.status(404).json({ message: 'Transacción no encontrada' });
      return;
    }
    await transaccion.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar transacción:', error);
    res.status(500).json({ message: 'Error al eliminar transacción', error });
  }
};