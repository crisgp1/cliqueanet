import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { TipoIdentificacion } from '../../models/catalogs/tipo-identificacion.model';
import { Usuario } from '../../models/usuario.model';
import { Cliente } from '../../models/cliente.model';

export class TipoIdentificacionController {
    
    // Crear un nuevo tipo de identificación
    public async create(req: Request, res: Response): Promise<void> {
        try {
            const { nombre, descripcion } = req.body;

            // Validar campo requerido
            if (!nombre) {
                res.status(400).json({
                    success: false,
                    message: 'El nombre es requerido'
                });
                return;
            }

            // Verificar si ya existe un tipo con el mismo nombre
            const existingTipo = await TipoIdentificacion.findOne({ where: { nombre } });
            if (existingTipo) {
                res.status(400).json({
                    success: false,
                    message: 'Ya existe un tipo de identificación con este nombre'
                });
                return;
            }

            const tipoIdentificacion = await TipoIdentificacion.create({
                nombre,
                descripcion
            });

            res.status(201).json({
                success: true,
                data: tipoIdentificacion,
                message: 'Tipo de identificación creado exitosamente'
            });
        } catch (error) {
            console.error('Error al crear tipo de identificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear el tipo de identificación',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Obtener todos los tipos de identificación
    public async getAll(req: Request, res: Response): Promise<void> {
        try {
            const tiposIdentificacion = await TipoIdentificacion.findAll({
                order: [['nombre', 'ASC']]
            });

            res.status(200).json({
                success: true,
                data: tiposIdentificacion,
                message: 'Tipos de identificación recuperados exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener tipos de identificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los tipos de identificación',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Obtener un tipo de identificación por ID
    public async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const tipoIdentificacion = await TipoIdentificacion.findByPk(id);

            if (!tipoIdentificacion) {
                res.status(404).json({
                    success: false,
                    message: 'Tipo de identificación no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: tipoIdentificacion,
                message: 'Tipo de identificación recuperado exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener tipo de identificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el tipo de identificación',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Actualizar un tipo de identificación
    public async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { nombre, descripcion } = req.body;

            const tipoIdentificacion = await TipoIdentificacion.findByPk(id);

            if (!tipoIdentificacion) {
                res.status(404).json({
                    success: false,
                    message: 'Tipo de identificación no encontrado'
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
            const existingTipo = await TipoIdentificacion.findOne({
                where: { 
                    nombre,
                    id: { [Op.ne]: id } // Excluir el registro actual
                }
            });

            if (existingTipo) {
                res.status(400).json({
                    success: false,
                    message: 'Ya existe otro tipo de identificación con este nombre'
                });
                return;
            }

            await tipoIdentificacion.update({
                nombre,
                descripcion
            });

            res.status(200).json({
                success: true,
                data: tipoIdentificacion,
                message: 'Tipo de identificación actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error al actualizar tipo de identificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el tipo de identificación',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Eliminar un tipo de identificación
    public async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const tipoIdentificacion = await TipoIdentificacion.findByPk(id);

            if (!tipoIdentificacion) {
                res.status(404).json({
                    success: false,
                    message: 'Tipo de identificación no encontrado'
                });
                return;
            }

            // Verificar si el tipo está siendo usado por algún usuario o cliente
            const usuariosAsociados = await Usuario.count({
                where: { id_tipo_identificacion: id }
            });

            const clientesAsociados = await Cliente.count({
                where: { id_tipo_identificacion: id }
            });

            if (usuariosAsociados > 0 || clientesAsociados > 0) {
                res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el tipo de identificación porque está siendo usado por usuarios o clientes existentes'
                });
                return;
            }

            await tipoIdentificacion.destroy();

            res.status(200).json({
                success: true,
                message: 'Tipo de identificación eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar tipo de identificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar el tipo de identificación',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}