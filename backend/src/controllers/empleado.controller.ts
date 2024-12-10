import { Request, Response } from 'express';
import { Usuario } from '../models/usuario.model';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';

export class EmpleadoController {
    // Obtener todos los empleados
    public async obtenerEmpleados(req: Request, res: Response): Promise<void> {
        try {
            const empleados = await Usuario.findAll({
                where: {
                    rolId: {
                        [Op.in]: [2, 3] // IDs de roles de empleados
                    }
                },
                attributes: { exclude: ['password'] }
            });
            
            res.status(200).json({
                success: true,
                data: empleados,
                message: 'Empleados obtenidos exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener los empleados',
                error: error
            });
        }
    }

    // Obtener un empleado por ID
    public async obtenerEmpleadoPorId(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const empleado = await Usuario.findOne({
                where: {
                    id,
                    rolId: {
                        [Op.in]: [2, 3] // IDs de roles de empleados
                    }
                },
                attributes: { exclude: ['password'] }
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
            res.status(500).json({
                success: false,
                message: 'Error al obtener el empleado',
                error: error
            });
        }
    }

    // Crear un nuevo empleado
    public async crearEmpleado(req: Request, res: Response): Promise<void> {
        try {
            const { password, ...empleadoData } = req.body;
            
            // Encriptar contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const nuevoEmpleado = await Usuario.create({
                ...empleadoData,
                password: hashedPassword,
                activo: true
            });

            // Excluir password de la respuesta
            const empleadoResponse = nuevoEmpleado.toJSON();
            delete empleadoResponse.password;

            res.status(201).json({
                success: true,
                data: empleadoResponse,
                message: 'Empleado creado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al crear el empleado',
                error: error
            });
        }
    }

    // Actualizar un empleado
    public async actualizarEmpleado(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { password, ...empleadoData } = req.body;

            const empleado = await Usuario.findOne({
                where: {
                    id,
                    rolId: {
                        [Op.in]: [2, 3] // IDs de roles de empleados
                    }
                }
            });
            
            if (!empleado) {
                res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
                return;
            }

            // Si se proporciona una nueva contraseña, encriptarla
            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                empleadoData.password = hashedPassword;
            }

            await empleado.update(empleadoData);

            // Excluir password de la respuesta
            const empleadoResponse = empleado.toJSON();
            delete empleadoResponse.password;

            res.status(200).json({
                success: true,
                data: empleadoResponse,
                message: 'Empleado actualizado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el empleado',
                error: error
            });
        }
    }

    // Desactivar un empleado (soft delete)
    public async desactivarEmpleado(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const empleado = await Usuario.findOne({
                where: {
                    id,
                    rolId: {
                        [Op.in]: [2, 3] // IDs de roles de empleados
                    }
                }
            });
            
            if (!empleado) {
                res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
                return;
            }

            await empleado.update({ activo: false });
            
            res.status(200).json({
                success: true,
                message: 'Empleado desactivado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al desactivar el empleado',
                error: error
            });
        }
    }

    // Reactivar un empleado
    public async reactivarEmpleado(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const empleado = await Usuario.findOne({
                where: {
                    id,
                    rolId: {
                        [Op.in]: [2, 3] // IDs de roles de empleados
                    }
                }
            });
            
            if (!empleado) {
                res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
                return;
            }

            await empleado.update({ activo: true });
            
            res.status(200).json({
                success: true,
                message: 'Empleado reactivado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al reactivar el empleado',
                error: error
            });
        }
    }
}

export const empleadoController = new EmpleadoController();