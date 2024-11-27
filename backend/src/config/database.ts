import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

const config: PoolConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: parseInt(DB_PORT || '5432'),
  database: DB_NAME,
  // Configuración adicional para mejorar la estabilidad
  max: 20, // máximo número de clientes en el pool
  idleTimeoutMillis: 30000, // tiempo máximo que un cliente puede estar inactivo
  connectionTimeoutMillis: 2000, // tiempo máximo para establecer una conexión
};

const pool = new Pool(config);

// Evento para manejar errores del pool
pool.on('error', (err) => {
  console.error('Error inesperado en el cliente de postgres', err);
  process.exit(-1);
});

// Función para probar la conexión
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    console.error('Error al probar la conexión:', error);
    return false;
  }
};

export default pool;