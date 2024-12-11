import { Request, Response } from 'express';
import { Cliente } from '../models/cliente.model';
import { Op, ValidationError, WhereOptions } from 'sequelize';

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
    // Validar campos requeridos según el tipo de persona
    const { tipoPersona } = req.body;
    if (tipoPersona === 'Moral') {
      if (!req.body.razonSocial || !req.body.rfc || !req.body.fechaConstitucion || !req.body.regimenFiscal) {
        res.status(400).json({
          message: 'Para personas morales, razón social, RFC, fecha de constitución y régimen fiscal son obligatorios'
        });
        return;
      }
    } else if (tipoPersona === 'Física') {
      if (!req.body.curp) {
        res.status(400).json({
          message: 'Para personas físicas, el CURP es obligatorio'
        });
        return;
      }
    } else {
      res.status(400).json({
        message: 'El tipo de persona debe ser "Física" o "Moral"'
      });
      return;
    }

    // Verificar si ya existe un cliente con el mismo CURP, RFC o correo
    const existingCliente = await Cliente.findOne({
      where: {
        [Op.or]: [
          ...(req.body.curp ? [{ curp: req.body.curp }] : []),
          ...(req.body.rfc ? [{ rfc: req.body.rfc }] : []),
          { correo: req.body.correo },
          { numIdentificacion: req.body.numIdentificacion }
        ]
      } as WhereOptions
    });

    if (existingCliente) {
      res.status(400).json({
        message: 'Ya existe un cliente con el mismo CURP, RFC, correo o número de identificación'
      });
      return;
    }

    // Validar formato de RFC si es proporcionado
    if (req.body.rfc && !/^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(req.body.rfc)) {
      res.status(400).json({
        message: 'El formato del RFC no es válido'
      });
      return;
    }

    // Validar formato de CURP si es proporcionado
    if (req.body.curp && !/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/.test(req.body.curp)) {
      res.status(400).json({
        message: 'El formato del CURP no es válido'
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
    if (error instanceof ValidationError) {
      res.status(400).json({ 
        message: 'Error de validación', 
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    } else {
      res.status(400).json({ message: 'Error al crear cliente', error });
    }
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

    // Validar campos requeridos según el tipo de persona
    const tipoPersona = req.body.tipoPersona || cliente.tipoPersona;
    if (tipoPersona === 'Moral') {
      const razonSocial = req.body.razonSocial || cliente.razonSocial;
      const rfc = req.body.rfc || cliente.rfc;
      const fechaConstitucion = req.body.fechaConstitucion || cliente.fechaConstitucion;
      const regimenFiscal = req.body.regimenFiscal || cliente.regimenFiscal;

      if (!razonSocial || !rfc || !fechaConstitucion || !regimenFiscal) {
        res.status(400).json({
          message: 'Para personas morales, razón social, RFC, fecha de constitución y régimen fiscal son obligatorios'
        });
        return;
      }
    } else if (tipoPersona === 'Física') {
      const curp = req.body.curp || cliente.curp;
      if (!curp) {
        res.status(400).json({
          message: 'Para personas físicas, el CURP es obligatorio'
        });
        return;
      }
    }

    // Verificar si ya existe otro cliente con el mismo CURP, RFC o correo
    if (req.body.curp || req.body.rfc || req.body.correo || req.body.numIdentificacion) {
      const whereConditions: any[] = [];
      if (req.body.curp) whereConditions.push({ curp: req.body.curp });
      if (req.body.rfc) whereConditions.push({ rfc: req.body.rfc });
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
          message: 'Ya existe otro cliente con el mismo CURP, RFC, correo o número de identificación'
        });
        return;
      }
    }

    // Validar formato de RFC si es proporcionado
    if (req.body.rfc && !/^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(req.body.rfc)) {
      res.status(400).json({
        message: 'El formato del RFC no es válido'
      });
      return;
    }

    // Validar formato de CURP si es proporcionado
    if (req.body.curp && !/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/.test(req.body.curp)) {
      res.status(400).json({
        message: 'El formato del CURP no es válido'
      });
      return;
    }

    await cliente.update(req.body);
    const clienteActualizado = await Cliente.findByPk(req.params.id, {
      include: ['tipoIdentificacion']
    });
    
    res.json(clienteActualizado);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ 
        message: 'Error de validación', 
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    } else {
      res.status(400).json({ message: 'Error al actualizar cliente', error });
    }
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
          { rfc: { [Op.iLike]: `%${term}%` } },
          { numIdentificacion: { [Op.iLike]: `%${term}%` } },
          { correo: { [Op.iLike]: `%${term}%` } },
          { razonSocial: { [Op.iLike]: `%${term}%` } }
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