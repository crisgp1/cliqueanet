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
exports.testConnection = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME, } = process.env;
const sequelize = new sequelize_typescript_1.Sequelize({
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
    models: [path_1.default.join(__dirname, '..', 'models', '**', '*.model.{ts,js}')],
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
const testConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        return true;
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
        return false;
    }
});
exports.testConnection = testConnection;
exports.default = sequelize;
