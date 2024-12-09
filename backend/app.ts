import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usuarioRoutes from './src/routes/usuario.routes';
import citaRoutes from './src/routes/cita.routes';
import clienteRoutes from './src/routes/cliente.routes';
import creditoRoutes from './src/routes/credito.routes';
import documentoRoutes from './src/routes/documento.routes';
import nominaRoutes from './src/routes/nomina.routes';
import transaccionRoutes from './src/routes/transaccion.routes';
import vehiculoRoutes from './src/routes/vehiculo.routes';
import ventaRoutes from './src/routes/venta.routes';

// Configurar variables de entorno
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/creditos', creditoRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/nominas', nominaRoutes);
app.use('/api/transacciones', transaccionRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/ventas', ventaRoutes);

// Ruta de prueba
app.get('/', (_req, res) => {
  res.json({ message: 'API de Cliqueanet funcionando correctamente' });
});

export default app;