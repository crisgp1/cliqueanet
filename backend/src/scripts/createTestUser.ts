import { hashPassword } from '../middlewares/auth.middleware';
import Usuario from '../models/usuario.model';
import sequelize from '../config/database';

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');

    // Generar un número de empleado de 5 dígitos
    const employeeNumber = '12345';
    const email = `empleado${employeeNumber}@test.com`;
    const password = 'Cliquea2024'; // Cumple con los requisitos: 8+ caracteres, mayúscula y número

    const hashedPassword = await hashPassword(password);

    const testUser = await Usuario.create({
      nombre: 'Administrador Test',
      id_tipo_identificacion: 1, // ID para INE
      num_identificacion: employeeNumber,
      fecha_nacimiento: new Date('1990-01-01'),
      telefono: '5555555555',
      correo: email,
      curp: 'XEXX010101HNEXXXA4',
      domicilio: 'Calle Test #123, Col. Test',
      fecha_contratacion: new Date(),
      id_rol: 1, // ID para rol Administrador
      password: hashedPassword
    });

    console.log('Usuario de prueba creado exitosamente:', {
      id: testUser.id_empleado,
      nombre: testUser.nombre,
      correo: testUser.correo,
      num_identificacion: testUser.num_identificacion
    });

    // Credenciales para iniciar sesión
    console.log('\nCredenciales para iniciar sesión:');
    console.log('Número de Empleado:', employeeNumber);
    console.log('Contraseña:', password);

  } catch (error) {
    console.error('Error al crear usuario de prueba:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la función
createTestUser();