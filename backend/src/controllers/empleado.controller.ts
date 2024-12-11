import { Request, Response } from 'express';
import { Usuario } from '../models/usuario.model';
import { Empleado } from '../models/empleado.model';
import { TipoIdentificacion } from '../models/catalogs/tipo-identificacion.model';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';

export class EmpleadoController {
    // Obtener todos los empleados con sus datos de usuario
    public async obtenerEmpleados(req: Request, res: Response): Promise<void> {
        try {
            const empleados = await Empleado.findAll({
                include: [
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: { exclude: ['password'] }
                    },
                    {
                        model: TipoIdentificacion,
                        as: 'tipoIdentificacion'
                    }
                ]
            });
            
            res.status(200).json({
                success: true,
                data: empleados,
                message: 'Empleados obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener empleados:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los empleados',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Obtener un empleado por ID
    public async obtenerEmpleadoPorId(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const empleado = await Empleado.findOne({
                where: { id_empleado: id },
                include: [
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: { exclude: ['password'] }
                    },
                    {
                        model: TipoIdentificacion,
                        as: 'tipoIdentificacion'
                    }
                ]
            });
            
            if (!empleado) {
                res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: empleado,
                message: 'Empleado obtenido exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener empleado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el empleado',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Crear un nuevo empleado junto con su usuario
    public async crearEmpleado(req: Request, res: Response): Promise<void> {
        try {
            const { usuario: usuarioData, empleado: empleadoData } = req.body;
            
            // Encriptar contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(usuarioData.password, salt);

            // Crear usuario
            const nuevoUsuario = await Usuario.create({
                ...usuarioData,
                password: hashedPassword,
                is_active: true,
                is_locked: false
            });

            // Crear empleado asociado al usuario
            const nuevoEmpleado = await Empleado.create({
                ...empleadoData,
                id_usuario: nuevoUsuario.id
            });

            // Obtener el empleado con sus relaciones
            const empleadoCompleto = await Empleado.findOne({
                where: { id_empleado: nuevoEmpleado.id_empleado },
                include: [
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: { exclude: ['password'] }
                    },
                    {
                        model: TipoIdentificacion,
                        as: 'tipoIdentificacion'
                    }
                ]
            });

            res.status(201).json({
                success: true,
                data: empleadoCompleto,
                message: 'Empleado creado exitosamente'
            });
        } catch (error) {
            console.error('Error al crear empleado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear el empleado',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Actualizar un empleado
    public async actualizarEmpleado(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { usuario: usuarioData, empleado: empleadoData } = req.body;

            const empleadoExistente = await Empleado.findOne({
                where: { id_empleado: id },
                include: [
                    {
                        model: Usuario,
                        as: 'usuario'
                    }
                ]
            });
            
            if (!empleadoExistente) {
                res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
                return;
            }

            // Actualizar datos del usuario si se proporcionan
            if (usuarioData && empleadoExistente.usuario) {
                const datosUsuario = { ...usuarioData };
                if (usuarioData.password) {
                    const salt = await bcrypt.genSalt(10);
                    datosUsuario.password = await bcrypt.hash(usuarioData.password, salt);
                }
                await Usuario.update(datosUsuario, {
                    where: { id_usuario: empleadoExistente.usuario.id }
                });
            }

            // Actualizar datos del empleado
            await empleadoExistente.update(empleadoData);

            // Obtener el empleado actualizado con sus relaciones
            const empleadoActualizado = await Empleado.findOne({
                where: { id_empleado: id },
                include: [
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: { exclude: ['password'] }
                    },
                    {
                        model: TipoIdentificacion,
                        as: 'tipoIdentificacion'
                    }
                ]
            });

            res.status(200).json({
                success: true,
                data: empleadoActualizado,
                message: 'Empleado actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error al actualizar empleado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el empleado',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Desactivar un empleado (soft delete del usuario asociado)
    public async desactivarEmpleado(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const empleado = await Empleado.findOne({
                where: { id_empleado: id },
                include: [{ model: Usuario, as: 'usuario' }]
            });
            
            if (!empleado || !empleado.usuario) {
                res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
                return;
            }

            await Usuario.update(
                { is_active: false },
                { where: { id_usuario: empleado.usuario.id } }
            );
            
            res.status(200).json({
                success: true,
                message: 'Empleado desactivado exitosamente'
            });
        } catch (error) {
            console.error('Error al desactivar empleado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al desactivar el empleado',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Reactivar un empleado
    public async reactivarEmpleado(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const empleado = await Empleado.findOne({
                where: { id_empleado: id },
                include: [{ model: Usuario, as: 'usuario' }]
            });
            
            if (!empleado || !empleado.usuario) {
                res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
                return;
            }

            await Usuario.update(
                { is_active: true },
                { where: { id_usuario: empleado.usuario.id } }
            );
            
            res.status(200).json({
                success: true,
                message: 'Empleado reactivado exitosamente'
            });
        } catch (error) {
            console.error('Error al reactivar empleado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al reactivar el empleado',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}

export const empleadoController = new EmpleadoController();