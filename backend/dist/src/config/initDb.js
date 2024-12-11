"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
dotenv_1.default.config();
const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME, } = process.env;
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = new pg_1.Pool({
            user: DB_USER,
            password: DB_PASSWORD,
            host: DB_HOST,
            port: parseInt(DB_PORT || '5432'),
            database: DB_NAME,
        });
        try {
            // Verificar la conexión
            yield pool.query('SELECT NOW()');
            console.log('Conexión a la base de datos establecida');
            // Eliminar tablas y tipos existentes
            console.log('Limpiando base de datos...');
            yield pool.query(`
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
            const initSql = yield fs_1.promises.readFile(path_1.default.join(__dirname, 'init.sql'), 'utf8');
            // Separar las sentencias SQL
            const sqlStatements = initSql.split(/;\s*$/m).filter(stmt => stmt.trim());
            // Ejecutar cada sentencia
            for (const statement of sqlStatements) {
                const trimmedStatement = statement.trim();
                if (!trimmedStatement)
                    continue;
                try {
                    // Si es una función PL/pgSQL, ejecutarla como una sola unidad
                    if (trimmedStatement.includes('CREATE OR REPLACE FUNCTION')) {
                        yield pool.query(trimmedStatement);
                    }
                    else {
                        // Para otras sentencias, asegurarse de que terminen con punto y coma
                        yield pool.query(trimmedStatement + ';');
                    }
                }
                catch (error) {
                    console.error('Error ejecutando sentencia:', trimmedStatement);
                    throw error;
                }
            }
            console.log('Esquema de base de datos creado');
            // Generar hash para las contraseñas de seed
            console.log('Generando hashes de contraseñas...');
            const adminPasswordHash = yield (0, auth_middleware_1.hashPassword)('admin123');
            const vendedorPasswordHash = yield (0, auth_middleware_1.hashPassword)('vendedor123');
            // Leer seed.sql y reemplazar los hashes de contraseña
            let seedSql = yield fs_1.promises.readFile(path_1.default.join(__dirname, 'seed.sql'), 'utf8');
            // Reemplazar los placeholders con los hashes reales
            seedSql = seedSql.replace('$2b$10$XkHH4mJ4kH3zqX4ZqZhZ8O5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X', adminPasswordHash);
            seedSql = seedSql.replace('$2b$10$YkHH4mJ4kH3zqX4ZqZhZ8O5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5Y', vendedorPasswordHash);
            // Ejecutar las sentencias de seed
            const seedStatements = seedSql.split(/;\s*$/m).filter(stmt => stmt.trim());
            for (const statement of seedStatements) {
                const trimmedStatement = statement.trim();
                if (!trimmedStatement)
                    continue;
                try {
                    yield pool.query(trimmedStatement + ';');
                }
                catch (error) {
                    console.error('Error ejecutando sentencia de seed:', trimmedStatement);
                    throw error;
                }
            }
            console.log('Datos iniciales insertados');
            yield pool.end();
            console.log('Inicialización de la base de datos completada exitosamente');
        }
        catch (error) {
            console.error('Error inicializando la base de datos:', error);
            yield pool.end();
            process.exit(1);
        }
    });
}
// Ejecutar la inicialización
initializeDatabase().catch(console.error);
