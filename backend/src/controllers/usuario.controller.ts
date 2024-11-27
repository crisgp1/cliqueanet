import { Request, Response } from 'express';
import { UsuarioModel } from '../models/usuario.model';
import { CreateUsuario, UpdateUsuario, LoginCredentials } from '../types';

export class UsuarioController {
  private model: UsuarioModel;

  constructor() {
    this.model = new UsuarioModel();
  }

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const credentials: LoginCredentials = req.body;
      const result = await this.model.login(credentials);

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
      const nuevoUsuario = await this.model.crear(usuarioData);
      
      // Excluir la contraseña de la respuesta
      const { password, ...usuarioSinPassword } = nuevoUsuario;
      
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
      const usuario = await this.model.obtenerPorId(id);
      
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
      const usuarios = await this.model.obtenerTodos();
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
      const usuarioActualizado = await this.model.actualizar(id, usuarioData);
      
      res.status(200).json({
        success: true,
        data: usuarioActualizado,
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
      await this.model.eliminar(id);
      
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
      const { rol } = req.params;
      const usuarios = await this.model.buscarPorRol(rol);
      
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
      const usuario = await this.model.buscarPorCorreo(correo);
      
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