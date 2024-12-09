import { Request, Response } from 'express';
import Usuario from '../models/usuario.model';
import { CreateUsuario, UpdateUsuario, LoginCredentials, RolUsuario } from '../types';
import { hashPassword } from '../middlewares/auth.middleware';

export class UsuarioController {
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🚀 Login request received:', req.body);
      const credentials: LoginCredentials = {
        ...req.body,
        ip_address: req.realIP // Usar la IP real del middleware
      };
      
      // Validar que se proporcione al menos un método de identificación
      if (!credentials.employeeId && !credentials.correo) {
        console.log('❌ No se proporcionó método de identificación');
        res.status(400).json({
          success: false,
          message: 'Debe proporcionar un número de empleado o correo electrónico'
        });
        return;
      }

      // Validar contraseña
      if (!credentials.password) {
        console.log('❌ No se proporcionó contraseña');
        res.status(400).json({
          success: false,
          message: 'Debe proporcionar una contraseña'
        });
        return;
      }

      console.log('✅ Validaciones pasadas, intentando login');
      const result = await Usuario.login(credentials);

      if (!result) {
        console.log('❌ Login fallido: credenciales inválidas');
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
        return;
      }

      console.log('✅ Login exitoso');
      res.status(200).json({
        success: true,
        data: result,
        message: 'Login exitoso'
      });
    } catch (error) {
      console.error('❌ Error en el proceso de login:', error);
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
      const rolId = parseInt(req.params.rol);
      if (isNaN(rolId) || !Object.values(RolUsuario).includes(rolId)) {
        res.status(400).json({
          success: false,
          message: 'Rol inválido'
        });
        return;
      }

      const usuarios = await Usuario.findAll({
        where: { id_rol: rolId },
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