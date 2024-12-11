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
const app_1 = __importDefault(require("../app"));
const database_1 = __importDefault(require("./config/database"));
const dotenv_1 = __importDefault(require("dotenv"));
const modelAssociations_1 = require("./models/modelAssociations");
// Configuración de variables de entorno
dotenv_1.default.config();
const port = process.env.PORT || 3001;
// Función para inicializar el servidor
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verificar conexión a la base de datos
        yield database_1.default.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');
        // Inicializar asociaciones de modelos
        (0, modelAssociations_1.initializeAssociations)();
        console.log('Modelos cargados correctamente.');
        console.log('Asociaciones de modelos inicializadas correctamente.');
        // Sincronizar modelos con la base de datos (no forzar en producción)
        if (process.env.NODE_ENV !== 'production') {
            yield database_1.default.sync({ alter: true, force: false });
            console.log('Modelos sincronizados con la base de datos.');
        }
        // Iniciar el servidor
        app_1.default.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
});
// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
    console.error('Error no manejado:', error);
    process.exit(1);
});
// Iniciar el servidor
startServer();
