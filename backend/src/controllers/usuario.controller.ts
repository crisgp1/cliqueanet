import { Request, Response } from 'express';
import Usuario from '../models/usuario.model';
import { CreateUsuario, UpdateUsuario, LoginCredentials, RolUsuario } from '../types';
import { hashPassword } from '../middlewares/auth.middleware';

export class UsuarioController {
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const credentials: LoginCredentials = req.body;
      
      // Validar que se proporcione al menos un método de identificación
      if (!credentials.employeeId && !credentials.correo) {
        res.status(400).json({
          success: false,
          message: 'Debe proporcionar un número de empleado o correo electrónico'
        });
        return;
      }

      // Si se proporciona número de empleado, validar el formato
      if (credentials.employeeId && !/^\d{5,}$/.test(credentials.employeeId)) {
        res.status(400).json({
          success: false,
          message: 'El número de empleado debe tener al menos 5 dígitos'
        });
        return;
      }

      // Validar contraseña
      if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(credentials.password)) {
        res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número'
        });
        return;
      }

      // Buscar usuario por número de empleado o correo
      const whereClause = credentials.employeeId 
        ? { num_identificacion: credentials.employeeId }
        : { correo: credentials.correo };

      const usuario = await Usuario.findOne({
        where: whereClause
      });

      if (!usuario) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
        return;
      }

      const result = await Usuario.login(credentials);

      if (!result) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
        message: 'Login exitoso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        message: 'Error en el proceso de login'
      });
    }
  };

  crearUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioData: CreateUsuario = req.body;

      // Validar número de empleado
      if (!/^\d{5,}$/.test(usuarioData.num_identificacion)) {
        res.status(400).json({
          success: false,
          message: 'El número de empleado debe tener al menos 5 dígitos'
        });
        return;
      }

      // Validar contraseña
      if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(usuarioData.password)) {
        res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número'
        });
        return;
      }

      // Hash de la contraseña
      usuarioData.password = await hashPassword(usuarioData.password);
      
      const nuevoUsuario = await Usuario.create(usuarioData);
      
      // Excluir la contraseña de la respuesta
      const { password, ...usuarioSinPassword } = nuevoUsuario.toJSON();
      
      res.status(201).json({
        success: true,
        data: usuarioSinPassword,
        message: 'Usuario creado exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
        message: 'Error al crear usuario'
      });
    }
  };

  obtenerUsuarioPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const usuario = await Usuario.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!usuario) {
        res.status(404).json({
          success: false,
          message: `Usuario con ID ${id} no encontrado`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: usuario
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        message: 'Error al obtener usuario'
      });
    }
  };

  obtenerTodosUsuarios = async (_req: Request, res: Response): Promise<void> => {
    try {
      const usuarios = await Usuario.findAll({
        attributes: { exclude: ['password'] }
      });
      res.status(200).json({
        success: true,
        data: usuarios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        message: 'Error al obtener usuarios'
      });
    }
  };

  actualizarUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const usuarioData: UpdateUsuario = req.body;

      // Si se actualiza la contraseña, validar y hashear
      if (usuarioData.password) {
        if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(usuarioData.password)) {
          res.status(400).json({
            success: false,
            message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número'
          });
          return;
        }
        usuarioData.password = await hashPassword(usuarioData.password);
      }

      // Si se actualiza el número de empleado, validar
      if (usuarioData.num_identificacion && !/^\d{5,}$/.test(usuarioData.num_identificacion)) {
        res.status(400).json({
          success: false,
          message: 'El número de empleado debe tener al menos 5 dígitos'
        });
        return;
      }

      const [numRows, [usuarioActualizado]] = await Usuario.update(usuarioData, {
        where: { id_empleado: id },
        returning: true
      });

      if (numRows === 0) {
        res.status(404).json({
          success: false,
          message: `Usuario con ID ${id} no encontrado`
        });
        return;
      }

      // Excluir la contraseña de la respuesta
      const { password, ...usuarioSinPassword } = usuarioActualizado.toJSON();
      
      res.status(200).json({
        success: true,
        data: usuarioSinPassword,
        message: 'Usuario actualizado exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
        message: 'Error al actualizar usuario'
      });
    }
  };

  eliminarUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const numRows = await Usuario.destroy({
        where: { id_empleado: id }
      });
      
      if (numRows === 0) {
        res.status(404).json({
          success: false,
          message: `Usuario con ID ${id} no encontrado`
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
        message: 'Error al eliminar usuario'
      });
    }
  };

  buscarUsuariosPorRol = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar que el rol sea válido
      const rol = req.params.rol as RolUsuario;
      if (!Object.values(RolUsuario).includes(rol)) {
        res.status(400).json({
          success: false,
          message: 'Rol inválido'
        });
        return;
      }

      const usuarios = await Usuario.findAll({
        where: { id_rol: rol },
        attributes: { exclude: ['password'] }
      });
      
      res.status(200).json({
        success: true,
        data: usuarios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        message: 'Error al buscar usuarios por rol'
      });
    }
  };

  buscarUsuarioPorCorreo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { correo } = req.params;
      const usuario = await Usuario.findOne({
        where: { correo },
        attributes: { exclude: ['password'] }
      });
      
      if (!usuario) {
        res.status(404).json({
          success: false,
          message: `Usuario con correo ${correo} no encontrado`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: usuario
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        message: 'Error al buscar usuario por correo'
      });
    }
  };
}