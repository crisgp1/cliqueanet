import app from '../app';
import sequelize from './config/database';
import dotenv from 'dotenv';
import { initializeAssociations } from './models/modelAssociations';

// Configuración de variables de entorno
dotenv.config();

const port = process.env.PORT || 3001;

// Función para inicializar el servidor
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    // Asegurarse de que los modelos estén cargados
    await sequelize.sync({ alter: false });
    console.log('Modelos cargados correctamente.');

    // Inicializar asociaciones de modelos
    initializeAssociations();
    console.log('Asociaciones de modelos inicializadas correctamente.');

    // Sincronizar modelos con la base de datos (no forzar en producción)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('Modelos sincronizados con la base de datos.');
    }

    // Iniciar el servidor
    app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('Error no manejado:', error);
  process.exit(1);
});

// Iniciar el servidor
startServer();