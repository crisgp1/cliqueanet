import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { TipoTransaccion } from '../../models/catalogs/tipo-transaccion.model';
import { Transaccion } from '../../models/transaccion.model';

export class TipoTransaccionController {
    
    // Crear un nuevo tipo de transacción
    public async create(req: Request, res: Response): Promise<void> {
        try {
            const { nombre } = req.body;

            // Validar campo requerido
            if (!nombre) {
                res.status(400).json({
                    success: false,
                    message: 'El nombre es requerido'
                });
                return;
            }

            // Verificar si ya existe un tipo con el mismo nombre
            const existingTipo = await TipoTransaccion.findOne({ where: { nombre } });
            if (existingTipo) {
                res.status(400).json({
                    success: false,
                    message: 'Ya existe un tipo de transacción con este nombre'
                });
                return;
            }

            const tipoTransaccion = await TipoTransaccion.create({ nombre });

            res.status(201).json({
                success: true,
                data: tipoTransaccion,
                message: 'Tipo de transacción creado exitosamente'
            });
        } catch (error) {
            console.error('Error al crear tipo de transacción:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear el tipo de transacción',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Obtener todos los tipos de transacción
    public async getAll(req: Request, res: Response): Promise<void> {
        try {
            const tiposTransaccion = await TipoTransaccion.findAll({
                order: [['nombre', 'ASC']]
            });

            res.status(200).json({
                success: true,
                data: tiposTransaccion,
                message: 'Tipos de transacción recuperados exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener tipos de transacción:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los tipos de transacción',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Obtener un tipo de transacción por ID
    public async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const tipoTransaccion = await TipoTransaccion.findByPk(id);

            if (!tipoTransaccion) {
                res.status(404).json({
                    success: false,
                    message: 'Tipo de transacción no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: tipoTransaccion,
                message: 'Tipo de transacción recuperado exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener tipo de transacción:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el tipo de transacción',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Actualizar un tipo de transacción
    public async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { nombre } = req.body;

            const tipoTransaccion = await TipoTransaccion.findByPk(id);

            if (!tipoTransaccion) {
                res.status(404).json({
                    success: false,
                    message: 'Tipo de transacción no encontrado'
                });
                return;
            }

            // Validar campo requerido
            if (!nombre) {
                res.status(400).json({
                    success: false,
                    message: 'El nombre es requerido'
                });
                return;
            }

            // Verificar si ya existe otro tipo con el mismo nombre
            const existingTipo = await TipoTransaccion.findOne({
                where: { 
                    nombre,
                    id: { [Op.ne]: id } // Excluir el registro actual
                }
            });

            if (existingTipo) {
                res.status(400).json({
                    success: false,
                    message: 'Ya existe otro tipo de transacción con este nombre'
                });
                return;
            }

            await tipoTransaccion.update({ nombre });

            res.status(200).json({
                success: true,
                data: tipoTransaccion,
                message: 'Tipo de transacción actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error al actualizar tipo de transacción:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el tipo de transacción',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Eliminar un tipo de transacción
    public async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const tipoTransaccion = await TipoTransaccion.findByPk(id);

            if (!tipoTransaccion) {
                res.status(404).json({
                    success: false,
                    message: 'Tipo de transacción no encontrado'
                });
                return;
            }

            // Verificar si el tipo está siendo usado en alguna transacción
            const transaccionesAsociadas = await Transaccion.count({
                where: { id_tipo_transaccion: id }
            });

            if (transaccionesAsociadas > 0) {
                res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el tipo de transacción porque está siendo usado en transacciones existentes'
                });
                return;
            }

            await tipoTransaccion.destroy();

            res.status(200).json({
                success: true,
                message: 'Tipo de transacción eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar tipo de transacción:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar el tipo de transacción',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}