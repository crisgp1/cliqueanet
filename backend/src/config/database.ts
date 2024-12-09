import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: DB_HOST,
  port: parseInt(DB_PORT || '5432'),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  logging: false,
  modelMatch: (filename, member) => {
    const modelName = filename.substring(0, filename.indexOf('.model')).replace(/-/g, '');
    return modelName === member.toLowerCase();
  },
  models: [path.join(__dirname, '..', 'models', '**', '*.model.{ts,js}')],
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Test the connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

export default sequelize;