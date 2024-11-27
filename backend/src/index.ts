import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usuarioRoutes from './routes/usuario.routes';

// Configuración de variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/v1/usuarios', usuarioRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Cliqueanet funcionando correctamente' });
});

// Middleware para manejo de rutas no encontradas
app.use((_req, res) => {
  res.status(404).json({
    message: 'Recurso no encontrado'
  });
});

// Manejador de errores global
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});