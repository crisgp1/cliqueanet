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
dotenv_1.default.config();
const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME, } = process.env;
function runMigration() {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = new pg_1.Pool({
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
            yield pool.query('SELECT NOW()');
            console.log('Conexión a la base de datos establecida');
            // Leer el archivo de migración
            console.log('Ejecutando migración...');
            const migrationSql = yield fs_1.promises.readFile(path_1.default.join(__dirname, '..', 'database', 'migrations', 'add_fecha_transaccion_to_documentos.sql'), 'utf8');
            // Separar las sentencias SQL
            const sqlStatements = migrationSql.split(/;\s*$/m).filter(stmt => stmt.trim());
            // Ejecutar cada sentencia
            for (const statement of sqlStatements) {
                const trimmedStatement = statement.trim();
                if (!trimmedStatement)
                    continue;
                try {
                    yield pool.query(trimmedStatement + ';');
                    console.log('Sentencia ejecutada:', trimmedStatement);
                }
                catch (error) {
                    console.error('Error ejecutando sentencia:', trimmedStatement);
                    throw error;
                }
            }
            console.log('Migración completada exitosamente');
            yield pool.end();
        }
        catch (error) {
            console.error('Error ejecutando la migración:', error);
            yield pool.end();
            process.exit(1);
        }
    });
}
// Ejecutar la migración
runMigration().catch(console.error);
