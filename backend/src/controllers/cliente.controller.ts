import { Request, Response } from 'express';
import { Cliente } from '../models/cliente.model';
import { Op, WhereOptions } from 'sequelize';

// GET all clientes
export const getAllClientes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const clientes = await Cliente.findAll({
      include: ['tipoIdentificacion']
    });
    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ message: 'Error al obtener clientes', error });
  }
};

// GET cliente by ID
export const getClienteById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const cliente = await Cliente.findByPk(req.params.id, {
      include: ['tipoIdentificacion']
    });
    if (!cliente) {
      res.status(404).json({ message: 'Cliente no encontrado' });
      return;
    }
    res.json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ message: 'Error al obtener cliente', error });
  }
};

// POST create new cliente
export const createCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    // Verificar si ya existe un cliente con el mismo CURP o correo
    const existingCliente = await Cliente.findOne({
      where: {
        [Op.or]: [
          { curp: req.body.curp },
          { correo: req.body.correo },
          { numIdentificacion: req.body.numIdentificacion }
        ]
      } as WhereOptions
    });

    if (existingCliente) {
      res.status(400).json({
        message: 'Ya existe un cliente con el mismo CURP, correo o número de identificación'
      });
      return;
    }

    const cliente = await Cliente.create(req.body);
    const clienteConRelaciones = await Cliente.findByPk(cliente.id, {
      include: ['tipoIdentificacion']
    });
    
    res.status(201).json(clienteConRelaciones);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(400).json({ message: 'Error al crear cliente', error });
  }
};

// PUT update cliente
export const updateCliente = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      res.status(404).json({ message: 'Cliente no encontrado' });
      return;
    }

    // Verificar si ya existe otro cliente con el mismo CURP o correo
    if (req.body.curp || req.body.correo || req.body.numIdentificacion) {
      const whereConditions: any[] = [];
      if (req.body.curp) whereConditions.push({ curp: req.body.curp });
      if (req.body.correo) whereConditions.push({ correo: req.body.correo });
      if (req.body.numIdentificacion) whereConditions.push({ numIdentificacion: req.body.numIdentificacion });

      const existingCliente = await Cliente.findOne({
        where: {
          id: { [Op.ne]: req.params.id },
          [Op.or]: whereConditions
        } as WhereOptions
      });

      if (existingCliente) {
        res.status(400).json({
          message: 'Ya existe otro cliente con el mismo CURP, correo o número de identificación'
        });
        return;
      }
    }

    await cliente.update(req.body);
    const clienteActualizado = await Cliente.findByPk(req.params.id, {
      include: ['tipoIdentificacion']
    });
    
    res.json(clienteActualizado);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(400).json({ message: 'Error al actualizar cliente', error });
  }
};

// DELETE cliente
export const deleteCliente = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      res.status(404).json({ message: 'Cliente no encontrado' });
      return;
    }
    await cliente.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ message: 'Error al eliminar cliente', error });
  }
};

// GET clientes by search term
export const searchClientes = async (req: Request<{}, {}, {}, { term: string }>, res: Response): Promise<void> => {
  try {
    const { term } = req.query;
    const clientes = await Cliente.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${term}%` } },
          { curp: { [Op.iLike]: `%${term}%` } },
          { numIdentificacion: { [Op.iLike]: `%${term}%` } },
          { correo: { [Op.iLike]: `%${term}%` } }
        ]
      },
      include: ['tipoIdentificacion']
    });
    res.json(clientes);
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    res.status(500).json({ message: 'Error al buscar clientes', error });
  }
};