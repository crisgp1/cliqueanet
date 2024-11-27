import { Pool } from 'pg';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { hashPassword } from '../middlewares/auth.middleware';

dotenv.config();

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

async function initializeDatabase() {
  const pool = new Pool({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: parseInt(DB_PORT || '5432'),
    database: DB_NAME,
  });

  try {
    // Verificar la conexión
    await pool.query('SELECT NOW()');
    console.log('Conexión a la base de datos establecida');

    // Eliminar tablas y tipos existentes
    console.log('Limpiando base de datos...');
    await pool.query(`
      DROP TABLE IF EXISTS venta_empleados CASCADE;
      DROP TABLE IF EXISTS ventas CASCADE;
      DROP TABLE IF EXISTS nomina CASCADE;
      DROP TABLE IF EXISTS transacciones CASCADE;
      DROP TABLE IF EXISTS multimedia CASCADE;
      DROP TABLE IF EXISTS creditos CASCADE;
      DROP TABLE IF EXISTS vehiculos CASCADE;
      DROP TABLE IF EXISTS clientes CASCADE;
      DROP TABLE IF EXISTS usuarios CASCADE;
      DROP TYPE IF EXISTS rol_usuario CASCADE;
      DROP TYPE IF EXISTS tipo_transaccion CASCADE;
      DROP TYPE IF EXISTS categoria_multimedia CASCADE;
      DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    `);
    console.log('Base de datos limpiada');

    // Leer init.sql
    console.log('Creando esquema de la base de datos...');
    const initSql = await fs.readFile(
      path.join(__dirname, 'init.sql'),
      'utf8'
    );

    // Separar las sentencias SQL
    const sqlStatements = initSql.split(/;\s*$/m).filter(stmt => stmt.trim());

    // Ejecutar cada sentencia
    for (const statement of sqlStatements) {
      const trimmedStatement = statement.trim();
      if (!trimmedStatement) continue;

      try {
        // Si es una función PL/pgSQL, ejecutarla como una sola unidad
        if (trimmedStatement.includes('CREATE OR REPLACE FUNCTION')) {
          await pool.query(trimmedStatement);
        } else {
          // Para otras sentencias, asegurarse de que terminen con punto y coma
          await pool.query(trimmedStatement + ';');
        }
      } catch (error) {
        console.error('Error ejecutando sentencia:', trimmedStatement);
        throw error;
      }
    }
    console.log('Esquema de base de datos creado');

    // Generar hash para las contraseñas de seed
    console.log('Generando hashes de contraseñas...');
    const adminPasswordHash = await hashPassword('admin123');
    const vendedorPasswordHash = await hashPassword('vendedor123');

    // Leer seed.sql y reemplazar los hashes de contraseña
    let seedSql = await fs.readFile(
      path.join(__dirname, 'seed.sql'),
      'utf8'
    );
    
    // Reemplazar los placeholders con los hashes reales
    seedSql = seedSql.replace(
      '$2b$10$XkHH4mJ4kH3zqX4ZqZhZ8O5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X',
      adminPasswordHash
    );
    seedSql = seedSql.replace(
      '$2b$10$YkHH4mJ4kH3zqX4ZqZhZ8O5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5Y',
      vendedorPasswordHash
    );

    // Ejecutar las sentencias de seed
    const seedStatements = seedSql.split(/;\s*$/m).filter(stmt => stmt.trim());
    for (const statement of seedStatements) {
      const trimmedStatement = statement.trim();
      if (!trimmedStatement) continue;

      try {
        await pool.query(trimmedStatement + ';');
      } catch (error) {
        console.error('Error ejecutando sentencia de seed:', trimmedStatement);
        throw error;
      }
    }
    console.log('Datos iniciales insertados');

    await pool.end();
    console.log('Inicialización de la base de datos completada exitosamente');
  } catch (error) {
    console.error('Error inicializando la base de datos:', error);
    await pool.end();
    process.exit(1);
  }
}

// Ejecutar la inicialización
initializeDatabase().catch(console.error);