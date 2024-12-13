import { Request, Response } from 'express';
import { Usuario } from '../models/usuario.model';
import { Empleado } from '../models/empleado.model';
import { TipoIdentificacion } from '../models/catalogs/tipo-identificacion.model';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';

const MIN_DOMICILIO_LENGTH = 10;
const MAX_DOMICILIO_LENGTH = 200;
const MIN_AGE = 18;

export class EmpleadoController {
    private validateDates(fechaNacimiento: Date, fechaContratacion: Date): string | null {
        const today = new Date();
        const age = Math.floor((today.getTime() - fechaNacimiento.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        
        if (age < MIN_AGE) {
            return `El empleado debe ser mayor de ${MIN_AGE} años`;
        }

        if (fechaContratacion > today) {
            return 'La fecha de contratación no puede ser futura';
        }

        return null;
    }

    private validateDomicilio(domicilio: string): string | null {
        if (domicilio.length < MIN_DOMICILIO_LENGTH) {
            return `El domicilio debe tener al menos ${MIN_DOMICILIO_LENGTH} caracteres`;
        }
        if (domicilio.length > MAX_DOMICILIO_LENGTH) {
            return `El domicilio no puede exceder ${MAX_DOMICILIO_LENGTH} caracteres`;
        }
        return null;
    }

    private async validateUniqueEmail(correo: string): Promise<string | null> {
        const existingUser = await Usuario.findOne({ where: { correo } });
        if (existingUser) {
            return 'El correo electrónico ya está registrado';
        }
        return null;
    }

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
                where: { id },
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

            // Validar fechas
            const dateError = this.validateDates(
                new Date(empleadoData.fechaNacimiento),
                new Date(empleadoData.fechaContratacion)
            );
            if (dateError) {
                res.status(400).json({
                    success: false,
                    message: dateError
                });
                return;
            }

            // Validar domicilio
            const domicilioError = this.validateDomicilio(empleadoData.domicilio);
            if (domicilioError) {
                res.status(400).json({
                    success: false,
                    message: domicilioError
                });
                return;
            }

            // Validar correo único
            const emailError = await this.validateUniqueEmail(usuarioData.correo);
            if (emailError) {
                res.status(400).json({
                    success: false,
                    message: emailError
                });
                return;
            }
            
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
                idUsuario: nuevoUsuario.id
            });

            // Obtener el empleado con sus relaciones
            const empleadoCompleto = await Empleado.findOne({
                where: { id: nuevoEmpleado.id },
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
            
            // Si es un error de validación de Sequelize
            if (error instanceof Error && error.name === 'SequelizeValidationError') {
                res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: (error as any).errors.map((e: any) => ({
                        field: e.path,
                        message: e.message
                    }))
                });
                return;
            }

            // Si es un error de unicidad
            if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
                res.status(400).json({
                    success: false,
                    message: 'Error de unicidad',
                    errors: (error as any).errors.map((e: any) => ({
                        field: e.path,
                        message: e.message
                    }))
                });
                return;
            }

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
                where: { id },
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

            // Validar fechas si se están actualizando
            if (empleadoData.fechaNacimiento || empleadoData.fechaContratacion) {
                const dateError = this.validateDates(
                    new Date(empleadoData.fechaNacimiento || empleadoExistente.fechaNacimiento),
                    new Date(empleadoData.fechaContratacion || empleadoExistente.fechaContratacion)
                );
                if (dateError) {
                    res.status(400).json({
                        success: false,
                        message: dateError
                    });
                    return;
                }
            }

            // Validar domicilio si se está actualizando
            if (empleadoData.domicilio) {
                const domicilioError = this.validateDomicilio(empleadoData.domicilio);
                if (domicilioError) {
                    res.status(400).json({
                        success: false,
                        message: domicilioError
                    });
                    return;
                }
            }

            // Validar correo único si se está actualizando
            if (usuarioData?.correo && usuarioData.correo !== empleadoExistente.usuario?.correo) {
                const emailError = await this.validateUniqueEmail(usuarioData.correo);
                if (emailError) {
                    res.status(400).json({
                        success: false,
                        message: emailError
                    });
                    return;
                }
            }

            // Actualizar datos del usuario si se proporcionan
            if (usuarioData && empleadoExistente.usuario) {
                const datosUsuario = { ...usuarioData };
                if (usuarioData.password) {
                    const salt = await bcrypt.genSalt(10);
                    datosUsuario.password = await bcrypt.hash(usuarioData.password, salt);
                }
                await Usuario.update(datosUsuario, {
                    where: { id: empleadoExistente.usuario.id }
                });
            }

            // Actualizar datos del empleado
            await empleadoExistente.update(empleadoData);

            // Obtener el empleado actualizado con sus relaciones
            const empleadoActualizado = await Empleado.findOne({
                where: { id },
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
            
            // Si es un error de validación de Sequelize
            if (error instanceof Error && error.name === 'SequelizeValidationError') {
                res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: (error as any).errors.map((e: any) => ({
                        field: e.path,
                        message: e.message
                    }))
                });
                return;
            }

            // Si es un error de unicidad
            if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
                res.status(400).json({
                    success: false,
                    message: 'Error de unicidad',
                    errors: (error as any).errors.map((e: any) => ({
                        field: e.path,
                        message: e.message
                    }))
                });
                return;
            }

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
                where: { id },
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
                { where: { id: empleado.usuario.id } }
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
                where: { id },
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
                { where: { id: empleado.usuario.id } }
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