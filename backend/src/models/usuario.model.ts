import { Pool } from 'pg';
import pool from '../config/database';
import { Usuario, CreateUsuario, UpdateUsuario, LoginCredentials } from '../types';
import { hashPassword, comparePassword, generarToken } from '../middlewares/auth.middleware';

export class UsuarioModel {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async crear(usuario: CreateUsuario): Promise<Usuario> {
    const hashedPassword = await hashPassword(usuario.password);
    
    const query = `
      INSERT INTO usuarios (
        nombre, tipo_identificacion, num_identificacion, 
        fecha_nacimiento, telefono, correo, domicilio, 
        fecha_contratacion, rol, password
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *
    `;

    const values = [
      usuario.nombre,
      usuario.tipo_identificacion,
      usuario.num_identificacion,
      usuario.fecha_nacimiento,
      usuario.telefono,
      usuario.correo,
      usuario.domicilio,
      usuario.fecha_contratacion,
      usuario.rol,
      hashedPassword
    ];

    try {
      const { rows } = await this.pool.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al crear usuario: ${(error as Error).message}`);
    }
  }

  async login(credentials: LoginCredentials): Promise<{ token: string; usuario: Omit<Usuario, 'password'> } | null> {
    const query = 'SELECT * FROM usuarios WHERE correo = $1';
    
    try {
      const { rows } = await this.pool.query(query, [credentials.correo]);
      const usuario = rows[0];

      if (!usuario) {
        return null;
      }

      const isPasswordValid = await comparePassword(credentials.password, usuario.password);
      
      if (!isPasswordValid) {
        return null;
      }

      const token = generarToken({
        id_empleado: usuario.id_empleado,
        rol: usuario.rol
      });

      // Excluir la contraseña de la respuesta
      const { password, ...usuarioSinPassword } = usuario;
      
      return {
        token,
        usuario: usuarioSinPassword
      };
    } catch (error) {
      throw new Error(`Error en el login: ${(error as Error).message}`);
    }
  }

  async obtenerPorId(id: number): Promise<Omit<Usuario, 'password'> | null> {
    const query = 'SELECT * FROM usuarios WHERE id_empleado = $1';
    
    try {
      const { rows } = await this.pool.query(query, [id]);
      if (rows.length === 0) return null;
      
      // Excluir la contraseña de la respuesta
      const { password, ...usuarioSinPassword } = rows[0];
      return usuarioSinPassword;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${(error as Error).message}`);
    }
  }

  async obtenerTodos(): Promise<Omit<Usuario, 'password'>[]> {
    const query = 'SELECT * FROM usuarios ORDER BY nombre';
    
    try {
      const { rows } = await this.pool.query(query);
      // Excluir la contraseña de todos los usuarios
      return rows.map(({ password, ...usuario }) => usuario);
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${(error as Error).message}`);
    }
  }

  async actualizar(id: number, usuario: UpdateUsuario): Promise<Omit<Usuario, 'password'>> {
    const fields = Object.keys(usuario).filter(key => key !== 'id_empleado' && key !== 'password');
    const values = fields.map(field => usuario[field as keyof UpdateUsuario]);
    
    // Si hay una nueva contraseña, hashearla
    if (usuario.password) {
      fields.push('password');
      values.push(await hashPassword(usuario.password));
    }
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `
      UPDATE usuarios 
      SET ${setClause} 
      WHERE id_empleado = $${fields.length + 1} 
      RETURNING *
    `;

    try {
      const { rows } = await this.pool.query(query, [...values, id]);
      if (rows.length === 0) {
        throw new Error(`Usuario con ID ${id} no encontrado`);
      }
      
      // Excluir la contraseña de la respuesta
      const { password, ...usuarioSinPassword } = rows[0];
      return usuarioSinPassword;
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${(error as Error).message}`);
    }
  }

  async eliminar(id: number): Promise<void> {
    const query = 'DELETE FROM usuarios WHERE id_empleado = $1';
    
    try {
      const { rowCount } = await this.pool.query(query, [id]);
      if (rowCount === 0) {
        throw new Error(`Usuario con ID ${id} no encontrado`);
      }
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${(error as Error).message}`);
    }
  }

  async buscarPorRol(rol: string): Promise<Omit<Usuario, 'password'>[]> {
    const query = 'SELECT * FROM usuarios WHERE rol = $1 ORDER BY nombre';
    
    try {
      const { rows } = await this.pool.query(query, [rol]);
      // Excluir la contraseña de todos los usuarios
      return rows.map(({ password, ...usuario }) => usuario);
    } catch (error) {
      throw new Error(`Error al buscar usuarios por rol: ${(error as Error).message}`);
    }
  }

  async buscarPorCorreo(correo: string): Promise<Omit<Usuario, 'password'> | null> {
    const query = 'SELECT * FROM usuarios WHERE correo = $1';
    
    try {
      const { rows } = await this.pool.query(query, [correo]);
      if (rows.length === 0) return null;
      
      // Excluir la contraseña de la respuesta
      const { password, ...usuarioSinPassword } = rows[0];
      return usuarioSinPassword;
    } catch (error) {
      throw new Error(`Error al buscar usuario por correo: ${(error as Error).message}`);
    }
  }
}