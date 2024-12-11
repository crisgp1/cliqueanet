"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_middleware_1 = require("./src/middlewares/auth.middleware");
const usuario_routes_1 = __importDefault(require("./src/routes/usuario.routes"));
const cita_routes_1 = __importDefault(require("./src/routes/cita.routes"));
const cliente_routes_1 = __importDefault(require("./src/routes/cliente.routes"));
const credito_routes_1 = __importDefault(require("./src/routes/credito.routes"));
const documento_routes_1 = __importDefault(require("./src/routes/documento.routes"));
const nomina_routes_1 = __importDefault(require("./src/routes/nomina.routes"));
const transaccion_routes_1 = __importDefault(require("./src/routes/transaccion.routes"));
const vehiculo_routes_1 = __importDefault(require("./src/routes/vehiculo.routes"));
const venta_routes_1 = __importDefault(require("./src/routes/venta.routes"));
const empleado_routes_1 = __importDefault(require("./src/routes/empleado.routes"));
// Importar rutas de catálogos
const tipo_transaccion_routes_1 = __importDefault(require("./src/routes/catalogs/tipo-transaccion.routes"));
const rol_usuario_routes_1 = __importDefault(require("./src/routes/catalogs/rol-usuario.routes"));
const tipo_identificacion_routes_1 = __importDefault(require("./src/routes/catalogs/tipo-identificacion.routes"));
// Configurar variables de entorno
dotenv_1.default.config();
const app = (0, express_1.default)();
// Configurar Express para confiar en proxies
app.set('trust proxy', function (ip) {
    // Confiar en todas las IPs privadas y localhost
    if (ip === 'localhost' || ip === '127.0.0.1' || ip === '::1')
        return true;
    // Confiar en IPs de red local
    if (ip.startsWith('10.') || ip.startsWith('192.168.') || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip))
        return true;
    // No confiar en otras IPs
    return false;
});
// Middleware para obtener la IP real
app.use((req, _res, next) => {
    // Obtener la IP real del cliente
    let ip = '0.0.0.0';
    console.log('🔍 Información de la solicitud:', {
        'headers': {
            'x-forwarded-for': req.headers['x-forwarded-for'],
            'x-real-ip': req.headers['x-real-ip'],
            'x-client-ip': req.headers['x-client-ip'],
            'forwarded': req.headers['forwarded'],
            'via': req.headers['via']
        },
        'connection': {
            'remoteAddress': req.connection.remoteAddress,
            'socketAddress': req.socket.remoteAddress
        },
        'express': {
            'ip': req.ip,
            'ips': req.ips
        }
    });
    // Intentar obtener la IP de diferentes fuentes en orden de prioridad
    if (req.ips && req.ips.length > 0) {
        // Si hay IPs en la cadena de proxy, tomar la primera (la del cliente original)
        ip = req.ips[0];
        console.log('✅ IP obtenida de req.ips:', ip);
    }
    else if (req.headers['x-forwarded-for']) {
        // Si hay un header X-Forwarded-For, tomar la primera IP
        const forwardedFor = req.headers['x-forwarded-for'];
        ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0];
        console.log('✅ IP obtenida de x-forwarded-for:', ip);
    }
    else if (req.headers['x-real-ip']) {
        // Si hay un header X-Real-IP, usarlo
        const realIp = req.headers['x-real-ip'];
        ip = Array.isArray(realIp) ? realIp[0] : realIp;
        console.log('✅ IP obtenida de x-real-ip:', ip);
    }
    else if (req.ip) {
        // Usar la IP que Express ha determinado
        ip = req.ip;
        console.log('✅ IP obtenida de req.ip:', ip);
    }
    else if (req.connection.remoteAddress) {
        // Último recurso: usar la dirección remota de la conexión
        ip = req.connection.remoteAddress;
        console.log('✅ IP obtenida de connection.remoteAddress:', ip);
    }
    // Limpiar la IP
    ip = ip.replace(/^::ffff:/, '').trim();
    // Validar que la IP sea válida
    if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip) && ip !== '::1') {
        console.log('⚠️ IP no válida, usando default:', ip);
        ip = '0.0.0.0';
    }
    // Almacenar la IP real en el objeto request
    req.realIP = ip;
    console.log('✅ IP final almacenada:', req.realIP);
    next();
});
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Aplicar verificación de token a todas las rutas excepto /api/usuarios/login
app.use((req, res, next) => {
    // Excluir la ruta de login de la verificación de token
    if (req.path === '/api/usuarios/login') {
        return next();
    }
    (0, auth_middleware_1.verificarToken)(req, res, next);
});
// Rutas principales
app.use('/api/usuarios', usuario_routes_1.default);
app.use('/api/citas', cita_routes_1.default);
app.use('/api/clientes', cliente_routes_1.default);
app.use('/api/creditos', credito_routes_1.default);
app.use('/api/documentos', documento_routes_1.default);
app.use('/api/nominas', nomina_routes_1.default);
app.use('/api/transacciones', transaccion_routes_1.default);
app.use('/api/vehiculos', vehiculo_routes_1.default);
app.use('/api/ventas', venta_routes_1.default);
app.use('/api/empleados', empleado_routes_1.default);
// Rutas de catálogos
app.use('/api/catalogs/tipos-transaccion', tipo_transaccion_routes_1.default);
app.use('/api/catalogs/roles-usuario', rol_usuario_routes_1.default);
app.use('/api/catalogs/tipos-identificacion', tipo_identificacion_routes_1.default);
// Ruta de prueba (también protegida)
app.get('/', (req, res) => {
    res.json({ message: 'API de Cliqueanet funcionando correctamente' });
});
exports.default = app;
