import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { hashPassword, comparePassword, generarToken } from '../middlewares/auth.middleware';
import { LoginCredentials, RolUsuario } from '../types';
import * as UAParser from 'ua-parser-js';
import * as geoip from 'geoip-lite';
import { LoginHistory } from './login-history.model';

// Mapeo entre IDs de rol y RolUsuario enum
const rolMapping: { [key: number]: RolUsuario } = {
  1: RolUsuario.Administrador,
  2: RolUsuario.Ventas,
  3: RolUsuario.RRHH,
  4: RolUsuario.Gerente_general,
  5: RolUsuario.Capturista
};

@Table({
  tableName: 'usuarios',
  timestamps: false
})
export class Usuario extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_empleado'
  })
  id_empleado!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  nombre!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'id_tipo_identificacion',
    references: {
      model: 'tipos_identificacion',
      key: 'id_tipo_identificacion'
    }
  })
  id_tipo_identificacion!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'num_identificacion'
  })
  num_identificacion!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'fecha_nacimiento'
  })
  fecha_nacimiento!: Date;

  @Column({
    type: DataType.STRING(20),
    allowNull: false
  })
  telefono!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true
  })
  correo!: string;

  @Column({
    type: DataType.STRING(18),
    allowNull: false
  })
  curp!: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: false
  })
  domicilio!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'fecha_contratacion'
  })
  fecha_contratacion!: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_rol',
    references: {
      model: 'roles_usuario',
      key: 'id_rol'
    }
  })
  id_rol!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  password!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    unique: true,
    field: 'num_empleado'
  })
  num_empleado!: string;

  @HasMany(() => LoginHistory, {
    foreignKey: 'id_empleado',
    as: 'historialLogin'
  })
  historialLogin?: LoginHistory[];

  // Método para obtener el rol como enum
  public getRolEnum(): RolUsuario {
    return rolMapping[this.id_rol] || RolUsuario.Capturista;
  }

  private static async recordLoginHistory(
    usuario: Usuario,
    ip_address: string,
    user_agent: string
  ) {
    try {
      const parser = new UAParser.UAParser();
      parser.setUA(user_agent);
      const result = parser.getResult();
      const geo = geoip.lookup(ip_address);
      
      const browser = `${result.browser.name || ''} ${result.browser.version || ''}`.trim();
      const device = `${result.device.vendor || ''} ${result.device.model || ''} ${result.os.name || ''}`.trim();

      await LoginHistory.create({
        id_empleado: usuario.id_empleado,
        fecha_login: new Date(),
        ip_address,
        user_agent,
        browser,
        device,
        country: geo?.country || 'Unknown',
        city: geo?.city || 'Unknown'
      });
    } catch (error) {
      console.error('Error al registrar historial de login:', error);
      // No lanzamos el error para no interrumpir el login
    }
  }

  // Método estático para el login
  public static async login(credentials: LoginCredentials): Promise<{ token: string; usuario: any; lastLogin?: any } | null> {
    try {
      const whereClause = credentials.employeeId 
        ? { num_empleado: credentials.employeeId }
        : { correo: credentials.correo };

      console.log('🔍 Buscando usuario con:', whereClause);
      
      const usuario = await Usuario.findOne({
        where: whereClause
      });

      if (!usuario) {
        console.log('❌ Usuario no encontrado');
        return null;
      }

      console.log('✅ Usuario encontrado, verificando contraseña');
      const isPasswordValid = await comparePassword(credentials.password, usuario.password);
      
      if (!isPasswordValid) {
        console.log('❌ Contraseña inválida');
        return null;
      }

      console.log('✅ Contraseña válida, generando token');
      const token = generarToken({
        id_empleado: usuario.id_empleado,
        rol: usuario.getRolEnum()
      });

      // Registrar el historial de login si se proporcionaron los datos
      if (credentials.ip_address && credentials.user_agent) {
        await this.recordLoginHistory(
          usuario,
          credentials.ip_address,
          credentials.user_agent
        );
      }

      // Obtener el último login
      const lastLogin = await LoginHistory.findOne({
        where: { id_empleado: usuario.id_empleado },
        order: [['fecha_login', 'DESC']]
      });

      // Excluir la contraseña de la respuesta
      const { password, ...usuarioSinPassword } = usuario.toJSON();
      
      console.log('✅ Login exitoso');
      return {
        token,
        usuario: usuarioSinPassword,
        lastLogin
      };
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw new Error(`Error en el login: ${(error as Error).message}`);
    }
  }
}

export default Usuario;