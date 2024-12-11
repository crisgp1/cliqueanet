import { Table, Column, Model, DataType, HasMany, HasOne, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { hashPassword, comparePassword, generarToken } from '../middlewares/auth.middleware';
import { LoginCredentials, RolUsuario as RolUsuarioEnum } from '../types';
import * as UAParser from 'ua-parser-js';
import * as geoip from 'geoip-lite';
import { LoginHistory } from './login-history.model';
import { Empleado } from './empleado.model';
import { TipoIdentificacion } from './catalogs/tipo-identificacion.model';
import { RolUsuario } from './catalogs/rol-usuario.model';

// Mapeo entre IDs de rol y RolUsuario enum
const rolMapping: { [key: number]: RolUsuarioEnum } = {
  1: RolUsuarioEnum.Administrador,
  2: RolUsuarioEnum.Ventas,
  3: RolUsuarioEnum.RRHH,
  4: RolUsuarioEnum.Gerente_general,
  5: RolUsuarioEnum.Capturista
};

@Table({
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})
export class Usuario extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_usuario'
  })
  id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true
  })
  correo!: string;

  @ForeignKey(() => TipoIdentificacion)
  @Column({
    type: DataType.INTEGER,
    field: 'id_tipo_identificacion',
    allowNull: true
  })
  idTipoIdentificacion?: number;

  @ForeignKey(() => RolUsuario)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_rol'
  })
  id_rol!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  password!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  })
  is_active!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_locked'
  })
  is_locked!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'last_login'
  })
  last_login?: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'failed_attempts'
  })
  failed_attempts!: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'password_changed_at'
  })
  password_changed_at?: Date;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: 'reset_password_token'
  })
  reset_password_token?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'reset_password_expires_at'
  })
  reset_password_expires_at?: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'created_by',
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  })
  created_by?: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'auth_provider'
  })
  auth_provider?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'auth_provider_id'
  })
  auth_provider_id?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    unique: true
  })
  username?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'two_factor_enabled'
  })
  two_factor_enabled!: boolean;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'two_factor_secret'
  })
  two_factor_secret?: string;

  // Relaciones
  @BelongsTo(() => TipoIdentificacion)
  tipoIdentificacion?: TipoIdentificacion;

  @BelongsTo(() => RolUsuario, { foreignKey: 'id_rol' })
  rol!: RolUsuario;

  @HasMany(() => LoginHistory, {
    foreignKey: 'id_usuario',
    as: 'historialLogin'
  })
  historialLogin?: LoginHistory[];

  @HasOne(() => Empleado, {
    foreignKey: 'id_usuario',
    as: 'empleado'
  })
  empleado?: Empleado;

  // Método para obtener el rol como enum
  public getRolEnum(): RolUsuarioEnum {
    return rolMapping[this.id_rol] || RolUsuarioEnum.Capturista;
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
        id_usuario: usuario.id,
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
        ? { '$empleado.num_empleado$': credentials.employeeId }
        : { correo: credentials.correo };

      console.log('🔍 Buscando usuario con:', whereClause);
      
      const usuario = await Usuario.findOne({
        where: whereClause,
        include: [{
          model: Empleado,
          as: 'empleado'
        }]
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
        id_usuario: usuario.id,
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
        where: { id_usuario: usuario.id },
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