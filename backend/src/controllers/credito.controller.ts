import { Request, Response } from 'express';
import { Credito } from '../models/credito.model';

export class CreditoController {
    // Obtener todos los créditos
    public async obtenerCreditos(req: Request, res: Response): Promise<void> {
        try {
            const creditos = await Credito.findAll({
                include: ['cliente', 'vehiculo']
            });
            res.status(200).json({
                success: true,
                data: creditos,
                message: 'Créditos obtenidos exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener los créditos',
                error: error
            });
        }
    }

    // Obtener un crédito por ID
    public async obtenerCreditoPorId(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const credito = await Credito.findByPk(id, {
                include: ['cliente', 'vehiculo']
            });
            
            if (!credito) {
                res.status(404).json({
                    success: false,
                    message: 'Crédito no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: credito,
                message: 'Crédito obtenido exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener el crédito',
                error: error
            });
        }
    }

    // Crear un nuevo crédito
    public async crearCredito(req: Request, res: Response): Promise<void> {
        try {
            const nuevoCredito = await Credito.create(req.body);
            
            // Obtener el crédito creado con sus relaciones
            const creditoConRelaciones = await Credito.findByPk(nuevoCredito.id, {
                include: ['cliente', 'vehiculo']
            });

            res.status(201).json({
                success: true,
                data: creditoConRelaciones,
                message: 'Crédito creado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al crear el crédito',
                error: error
            });
        }
    }

    // Actualizar un crédito
    public async actualizarCredito(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const credito = await Credito.findByPk(id);
            
            if (!credito) {
                res.status(404).json({
                    success: false,
                    message: 'Crédito no encontrado'
                });
                return;
            }

            await credito.update(req.body);
            
            // Obtener el crédito actualizado con sus relaciones
            const creditoActualizado = await Credito.findByPk(id, {
                include: ['cliente', 'vehiculo']
            });

            res.status(200).json({
                success: true,
                data: creditoActualizado,
                message: 'Crédito actualizado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el crédito',
                error: error
            });
        }
    }

    // Eliminar un crédito
    public async eliminarCredito(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const credito = await Credito.findByPk(id);
            
            if (!credito) {
                res.status(404).json({
                    success: false,
                    message: 'Crédito no encontrado'
                });
                return;
            }

            await credito.destroy();
            
            res.status(200).json({
                success: true,
                message: 'Crédito eliminado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar el crédito',
                error: error
            });
        }
    }

    // Obtener créditos por cliente
    public async obtenerCreditosPorCliente(req: Request, res: Response): Promise<void> {
        try {
            const { clienteId } = req.params;
            const creditos = await Credito.findAll({
                where: { clienteId },
                include: ['cliente', 'vehiculo']
            });

            res.status(200).json({
                success: true,
                data: creditos,
                message: 'Créditos del cliente obtenidos exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener los créditos del cliente',
                error: error
            });
        }
    }
}

export const creditoController = new CreditoController();