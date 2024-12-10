import { Request, Response } from 'express';
import { Cita } from '../models/cita.model';
import { CitaEmpleado } from '../models/cita-empleado.model';

export class CitaController {
    // Obtener todas las citas
    public async obtenerCitas(req: Request, res: Response): Promise<void> {
        try {
            const citas = await Cita.findAll({
                include: [
                    'cliente',
                    {
                        model: CitaEmpleado,
                        as: 'citaEmpleados',
                        include: ['empleado']
                    }
                ]
            });
            res.status(200).json({
                success: true,
                data: citas,
                message: 'Citas obtenidas exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener las citas',
                error: error
            });
        }
    }

    // Obtener una cita por ID
    public async obtenerCitaPorId(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const cita = await Cita.findByPk(id, {
                include: [
                    'cliente',
                    {
                        model: CitaEmpleado,
                        as: 'citaEmpleados',
                        include: ['empleado']
                    }
                ]
            });
            
            if (!cita) {
                res.status(404).json({
                    success: false,
                    message: 'Cita no encontrada'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: cita,
                message: 'Cita obtenida exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener la cita',
                error: error
            });
        }
    }

    // Crear una nueva cita
    public async crearCita(req: Request, res: Response): Promise<void> {
        try {
            const { empleadosIds, ...citaData } = req.body;
            const nuevaCita = await Cita.create(citaData);

            // Crear las relaciones con empleados si se proporcionaron
            if (empleadosIds && Array.isArray(empleadosIds)) {
                const citaEmpleados = empleadosIds.map(empleadoId => ({
                    citaId: nuevaCita.id,
                    empleadoId: empleadoId
                }));
                await CitaEmpleado.bulkCreate(citaEmpleados);
            }

            // Obtener la cita creada con sus relaciones
            const citaConRelaciones = await Cita.findByPk(nuevaCita.id, {
                include: [
                    'cliente',
                    {
                        model: CitaEmpleado,
                        as: 'citaEmpleados',
                        include: ['empleado']
                    }
                ]
            });

            res.status(201).json({
                success: true,
                data: citaConRelaciones,
                message: 'Cita creada exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al crear la cita',
                error: error
            });
        }
    }

    // Actualizar una cita
    public async actualizarCita(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { empleadosIds, ...citaData } = req.body;
            
            const cita = await Cita.findByPk(id);
            if (!cita) {
                res.status(404).json({
                    success: false,
                    message: 'Cita no encontrada'
                });
                return;
            }

            // Actualizar datos de la cita
            await cita.update(citaData);

            // Actualizar relaciones con empleados si se proporcionaron
            if (empleadosIds && Array.isArray(empleadosIds)) {
                // Eliminar relaciones existentes
                await CitaEmpleado.destroy({ where: { citaId: id } });

                // Crear nuevas relaciones
                const citaEmpleados = empleadosIds.map(empleadoId => ({
                    citaId: id,
                    empleadoId: empleadoId
                }));
                await CitaEmpleado.bulkCreate(citaEmpleados);
            }

            // Obtener la cita actualizada con sus relaciones
            const citaActualizada = await Cita.findByPk(id, {
                include: [
                    'cliente',
                    {
                        model: CitaEmpleado,
                        as: 'citaEmpleados',
                        include: ['empleado']
                    }
                ]
            });

            res.status(200).json({
                success: true,
                data: citaActualizada,
                message: 'Cita actualizada exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar la cita',
                error: error
            });
        }
    }

    // Eliminar una cita
    public async eliminarCita(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const cita = await Cita.findByPk(id);
            
            if (!cita) {
                res.status(404).json({
                    success: false,
                    message: 'Cita no encontrada'
                });
                return;
            }

            // Eliminar las relaciones con empleados
            await CitaEmpleado.destroy({ where: { citaId: id } });
            
            // Eliminar la cita
            await cita.destroy();
            
            res.status(200).json({
                success: true,
                message: 'Cita eliminada exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar la cita',
                error: error
            });
        }
    }

    // Obtener citas por cliente
    public async obtenerCitasPorCliente(req: Request, res: Response): Promise<void> {
        try {
            const { clienteId } = req.params;
            const citas = await Cita.findAll({
                where: { clienteId },
                include: [
                    'cliente',
                    {
                        model: CitaEmpleado,
                        as: 'citaEmpleados',
                        include: ['empleado']
                    }
                ]
            });

            res.status(200).json({
                success: true,
                data: citas,
                message: 'Citas del cliente obtenidas exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener las citas del cliente',
                error: error
            });
        }
    }
}

export const citaController = new CitaController();