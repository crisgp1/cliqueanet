import { Pool } from 'pg';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

async function runMigration() {
  const pool = new Pool({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: parseInt(DB_PORT || '5432'),
    database: DB_NAME,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Verificar la conexión
    await pool.query('SELECT NOW()');
    console.log('Conexión a la base de datos establecida');

    // Leer el archivo de migración
    console.log('Ejecutando migración...');
    const migrationSql = await fs.readFile(
      path.join(__dirname, '..', 'database', 'migrations', 'add_fecha_transaccion_to_documentos.sql'),
      'utf8'
    );

    // Separar las sentencias SQL
    const sqlStatements = migrationSql.split(/;\s*$/m).filter(stmt => stmt.trim());

    // Ejecutar cada sentencia
    for (const statement of sqlStatements) {
      const trimmedStatement = statement.trim();
      if (!trimmedStatement) continue;

      try {
        await pool.query(trimmedStatement + ';');
        console.log('Sentencia ejecutada:', trimmedStatement);
      } catch (error) {
        console.error('Error ejecutando sentencia:', trimmedStatement);
        throw error;
      }
    }

    console.log('Migración completada exitosamente');
    await pool.end();
  } catch (error) {
    console.error('Error ejecutando la migración:', error);
    await pool.end();
    process.exit(1);
  }
}

// Ejecutar la migración
runMigration().catch(console.error);