import { hashPassword } from '../middlewares/auth.middleware';
import Usuario from '../models/usuario.model';
import sequelize from '../config/database';
import { Op } from 'sequelize';

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');

    // Buscar el último número de empleado
    const lastUser = await Usuario.findOne({
      where: {
        num_empleado: {
          [Op.like]: 'CLIQNE%'
        }
      },
      order: [['num_empleado', 'DESC']]
    });

    // Generar el siguiente número
    let nextNumber = '01';
    if (lastUser && lastUser.num_empleado) {
      const currentNumber = parseInt(lastUser.num_empleado.replace('CLIQNE', ''));
      nextNumber = (currentNumber + 1).toString().padStart(2, '0');
    }

    // Generar número de empleado en formato CLIQNE##
    const num_empleado = `CLIQNE${nextNumber}`;
    const email = `empleado${num_empleado}@test.com`;
    const password = 'Test2024!'; // Cumple con los requisitos: 8+ caracteres, mayúscula y número

    console.log('Creando usuario con número:', num_empleado);
    const hashedPassword = await hashPassword(password);

    const testUser = await Usuario.create({
      nombre: 'Administrador Test',
      id_tipo_identificacion: 1, // ID para INE
      num_identificacion: '12345', // Este es el número de identificación personal
      fecha_nacimiento: new Date('1990-01-01'),
      telefono: '5555555555',
      correo: email,
      curp: 'XEXX010101HNEXXXA4',
      domicilio: 'Calle Test #123, Col. Test',
      fecha_contratacion: new Date(),
      id_rol: 1, // ID para rol Administrador
      password: hashedPassword,
      num_empleado: num_empleado // Número de empleado para login
    });

    console.log('Usuario de prueba creado exitosamente:', {
      id: testUser.id_empleado,
      nombre: testUser.nombre,
      correo: testUser.correo,
      num_empleado: testUser.num_empleado // Mostrar el número de empleado
    });

    // Credenciales para iniciar sesión
    console.log('\n=== Credenciales para iniciar sesión ===');
    console.log('Número de Empleado:', num_empleado);
    console.log('Contraseña:', password);
    console.log('\nPuedes usar estas credenciales para iniciar sesión en el sistema.');
    console.log('=================================');

  } catch (error) {
    console.error('Error al crear usuario de prueba:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la función
createTestUser();