import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { hashPassword, comparePassword, generarToken } from '../middlewares/auth.middleware';
import { LoginCredentials, RolUsuario } from '../types';

interface UsuarioAttributes {
  id_empleado: number;
  nombre: string;
  id_tipo_identificacion: number;
  num_identificacion: string;
  fecha_nacimiento: Date;
  telefono: string;
  correo: string;
  curp: string;
  domicilio: string;
  fecha_contratacion: Date;
  id_rol: number;
  password: string;
  num_empleado: string;
}

interface UsuarioCreationAttributes extends Omit<UsuarioAttributes, 'id_empleado'> {}

// Mapeo entre IDs de rol y RolUsuario enum
const rolMapping: { [key: number]: RolUsuario } = {
  1: RolUsuario.Administrador,
  2: RolUsuario.Ventas,
  3: RolUsuario.RRHH,
  4: RolUsuario.Gerente_general,
  5: RolUsuario.Capturista
};

class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> {
  public id_empleado!: number;
  public nombre!: string;
  public id_tipo_identificacion!: number;
  public num_identificacion!: string;
  public fecha_nacimiento!: Date;
  public telefono!: string;
  public correo!: string;
  public curp!: string;
  public domicilio!: string;
  public fecha_contratacion!: Date;
  public id_rol!: number;
  public password!: string;
  public num_empleado!: string;

  // Método para obtener el rol como enum
  public getRolEnum(): RolUsuario {
    return rolMapping[this.id_rol] || RolUsuario.Capturista;
  }

  // Método estático para el login
  static async login(credentials: LoginCredentials): Promise<{ token: string; usuario: Omit<UsuarioAttributes, 'password'> } | null> {
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

      // Excluir la contraseña de la respuesta
      const { password, ...usuarioSinPassword } = usuario.toJSON();
      
      console.log('✅ Login exitoso');
      return {
        token,
        usuario: usuarioSinPassword
      };
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw new Error(`Error en el login: ${(error as Error).message}`);
    }
  }
}

Usuario.init(
  {
    id_empleado: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    id_tipo_identificacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tipos_identificacion',
        key: 'id_tipo_identificacion'
      }
    },
    num_identificacion: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    fecha_nacimiento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    curp: {
      type: DataTypes.STRING(18),
      allowNull: false,
    },
    domicilio: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    fecha_contratacion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles_usuario',
        key: 'id_rol'
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    num_empleado: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    }
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: false,
  }
);

export default Usuario;