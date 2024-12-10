import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { RolUsuario } from '../../models/catalogs/rol-usuario.model';
import { Usuario } from '../../models/usuario.model';

export class RolUsuarioController {
    
    // Crear un nuevo rol de usuario
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

            // Verificar si ya existe un rol con el mismo nombre
            const existingRol = await RolUsuario.findOne({ where: { nombre } });
            if (existingRol) {
                res.status(400).json({
                    success: false,
                    message: 'Ya existe un rol con este nombre'
                });
                return;
            }

            const rolUsuario = await RolUsuario.create({ nombre });

            res.status(201).json({
                success: true,
                data: rolUsuario,
                message: 'Rol de usuario creado exitosamente'
            });
        } catch (error) {
            console.error('Error al crear rol de usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear el rol de usuario',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Obtener todos los roles de usuario
    public async getAll(req: Request, res: Response): Promise<void> {
        try {
            const rolesUsuario = await RolUsuario.findAll({
                order: [['nombre', 'ASC']]
            });

            res.status(200).json({
                success: true,
                data: rolesUsuario,
                message: 'Roles de usuario recuperados exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener roles de usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los roles de usuario',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Obtener un rol de usuario por ID
    public async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const rolUsuario = await RolUsuario.findByPk(id);

            if (!rolUsuario) {
                res.status(404).json({
                    success: false,
                    message: 'Rol de usuario no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: rolUsuario,
                message: 'Rol de usuario recuperado exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener rol de usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el rol de usuario',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Actualizar un rol de usuario
    public async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { nombre } = req.body;

            const rolUsuario = await RolUsuario.findByPk(id);

            if (!rolUsuario) {
                res.status(404).json({
                    success: false,
                    message: 'Rol de usuario no encontrado'
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

            // Verificar si ya existe otro rol con el mismo nombre
            const existingRol = await RolUsuario.findOne({
                where: { 
                    nombre,
                    id: { [Op.ne]: id } // Excluir el registro actual
                }
            });

            if (existingRol) {
                res.status(400).json({
                    success: false,
                    message: 'Ya existe otro rol con este nombre'
                });
                return;
            }

            await rolUsuario.update({ nombre });

            res.status(200).json({
                success: true,
                data: rolUsuario,
                message: 'Rol de usuario actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error al actualizar rol de usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el rol de usuario',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Eliminar un rol de usuario
    public async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const rolUsuario = await RolUsuario.findByPk(id);

            if (!rolUsuario) {
                res.status(404).json({
                    success: false,
                    message: 'Rol de usuario no encontrado'
                });
                return;
            }

            // Verificar si el rol está siendo usado por algún usuario
            const usuariosAsociados = await Usuario.count({
                where: { id_rol: id }
            });

            if (usuariosAsociados > 0) {
                res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el rol porque está siendo usado por usuarios existentes'
                });
                return;
            }

            await rolUsuario.destroy();

            res.status(200).json({
                success: true,
                message: 'Rol de usuario eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar rol de usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar el rol de usuario',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}