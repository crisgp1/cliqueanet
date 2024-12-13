import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { verificarToken } from './src/middlewares/auth.middleware';
import usuarioRoutes from './src/routes/usuario.routes';
import citaRoutes from './src/routes/cita.routes';
import clienteRoutes from './src/routes/cliente.routes';
import creditoRoutes from './src/routes/credito.routes';
import documentoRoutes from './src/routes/documento.routes';
import nominaRoutes from './src/routes/nomina.routes';
import transaccionRoutes from './src/routes/transaccion.routes';
import vehiculoRoutes from './src/routes/vehiculo.routes';
import ventaRoutes from './src/routes/venta.routes';
import empleadoRoutes from './src/routes/empleado.routes';
import scannerRoutes from './src/routes/scanner.routes';

// Importar rutas de catálogos
import tipoTransaccionRoutes from './src/routes/catalogs/tipo-transaccion.routes';
import rolUsuarioRoutes from './src/routes/catalogs/rol-usuario.routes';
import tipoIdentificacionRoutes from './src/routes/catalogs/tipo-identificacion.routes';

// Configurar variables de entorno
dotenv.config();

const app = express();

// Configurar Express para confiar en proxies
app.set('trust proxy', function (ip: string) {
  // Confiar en todas las IPs privadas y localhost
  if (ip === 'localhost' || ip === '127.0.0.1' || ip === '::1') return true;
  // Confiar en IPs de red local
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
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
  } else if (req.headers['x-forwarded-for']) {
    // Si hay un header X-Forwarded-For, tomar la primera IP
    const forwardedFor = req.headers['x-forwarded-for'];
    ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0];
    console.log('✅ IP obtenida de x-forwarded-for:', ip);
  } else if (req.headers['x-real-ip']) {
    // Si hay un header X-Real-IP, usarlo
    const realIp = req.headers['x-real-ip'];
    ip = Array.isArray(realIp) ? realIp[0] : realIp;
    console.log('✅ IP obtenida de x-real-ip:', ip);
  } else if (req.ip) {
    // Usar la IP que Express ha determinado
    ip = req.ip;
    console.log('✅ IP obtenida de req.ip:', ip);
  } else if (req.connection.remoteAddress) {
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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar el directorio de uploads como estático
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Aplicar verificación de token a todas las rutas excepto /api/auth/login y /uploads
app.use((req, res, next) => {
  // Excluir la ruta de login y uploads de la verificación de token
  if (req.path === '/api/auth/login' || req.path.startsWith('/uploads/')) {
    return next();
  }
  verificarToken(req, res, next);
});

// Rutas principales
app.use('/api/auth', usuarioRoutes); // Cambiar la ruta base para coincidir con el frontend
app.use('/api/citas', citaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/creditos', creditoRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/nominas', nominaRoutes);
app.use('/api/transacciones', transaccionRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/scanner', scannerRoutes);
app.use('/api/configure', scannerRoutes);
app.use('/api/status', scannerRoutes);

// Rutas de catálogos
app.use('/api/catalogs/tipos-transaccion', tipoTransaccionRoutes);
app.use('/api/catalogs/roles-usuario', rolUsuarioRoutes);
app.use('/api/catalogs/tipos-identificacion', tipoIdentificacionRoutes);

// Ruta de prueba (también protegida)
app.get('/', (req, res) => {
  res.json({ message: 'API de Cliqueanet funcionando correctamente' });
});

// Extender el tipo Request de Express
declare global {
  namespace Express {
    interface Request {
      realIP: string;
    }
  }
}

export default app;