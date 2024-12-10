import { Request, Response } from 'express';
import { Vehiculo } from '../models/vehiculo.model';

export class VehiculoController {
    
    // Crear un nuevo vehículo
    public async create(req: Request, res: Response): Promise<void> {
        try {
            const {
                marca,
                modelo,
                anio,
                precio,
                numSerie,
                color,
                numMotor,
                numFactura,
                placas,
                tarjetaCirculacion,
                comentariosInternos
            } = req.body;

            // Validar campos requeridos
            if (!marca || !modelo || !anio || !precio || !numSerie || !color || !numMotor) {
                res.status(400).json({
                    success: false,
                    message: 'Todos los campos obligatorios deben ser proporcionados'
                });
                return;
            }

            const vehiculo = await Vehiculo.create({
                marca,
                modelo,
                anio,
                precio,
                numSerie,
                color,
                numMotor,
                numFactura,
                placas,
                tarjetaCirculacion,
                comentariosInternos
            });

            res.status(201).json({
                success: true,
                data: vehiculo,
                message: 'Vehículo creado exitosamente'
            });
        } catch (error) {
            console.error('Error al crear vehículo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear el vehículo',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Obtener todos los vehículos
    public async getAll(req: Request, res: Response): Promise<void> {
        try {
            const vehiculos = await Vehiculo.findAll();
            res.status(200).json({
                success: true,
                data: vehiculos,
                message: 'Vehículos recuperados exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener vehículos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los vehículos',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Obtener un vehículo por ID
    public async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const vehiculo = await Vehiculo.findByPk(id);

            if (!vehiculo) {
                res.status(404).json({
                    success: false,
                    message: 'Vehículo no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: vehiculo,
                message: 'Vehículo recuperado exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener vehículo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el vehículo',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Actualizar un vehículo
    public async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const vehiculo = await Vehiculo.findByPk(id);

            if (!vehiculo) {
                res.status(404).json({
                    success: false,
                    message: 'Vehículo no encontrado'
                });
                return;
            }

            const {
                marca,
                modelo,
                anio,
                precio,
                numSerie,
                color,
                numMotor,
                numFactura,
                placas,
                tarjetaCirculacion,
                comentariosInternos
            } = req.body;

            // Validar campos requeridos
            if (!marca || !modelo || !anio || !precio || !numSerie || !color || !numMotor) {
                res.status(400).json({
                    success: false,
                    message: 'Todos los campos obligatorios deben ser proporcionados'
                });
                return;
            }

            await vehiculo.update({
                marca,
                modelo,
                anio,
                precio,
                numSerie,
                color,
                numMotor,
                numFactura,
                placas,
                tarjetaCirculacion,
                comentariosInternos
            });

            res.status(200).json({
                success: true,
                data: vehiculo,
                message: 'Vehículo actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error al actualizar vehículo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el vehículo',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Eliminar un vehículo
    public async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const vehiculo = await Vehiculo.findByPk(id);

            if (!vehiculo) {
                res.status(404).json({
                    success: false,
                    message: 'Vehículo no encontrado'
                });
                return;
            }

            await vehiculo.destroy();

            res.status(200).json({
                success: true,
                message: 'Vehículo eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar vehículo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar el vehículo',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}