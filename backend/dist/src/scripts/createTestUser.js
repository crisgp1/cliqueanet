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
const auth_middleware_1 = require("../middlewares/auth.middleware");
const usuario_model_1 = __importDefault(require("../models/usuario.model"));
const database_1 = __importDefault(require("../config/database"));
const sequelize_1 = require("sequelize");
function createTestUser() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield database_1.default.authenticate();
            console.log('Conexión establecida correctamente.');
            // Buscar el último número de empleado
            const lastUser = yield usuario_model_1.default.findOne({
                where: {
                    num_empleado: {
                        [sequelize_1.Op.like]: 'CLIQNE%'
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
            const hashedPassword = yield (0, auth_middleware_1.hashPassword)(password);
            const testUser = yield usuario_model_1.default.create({
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
        }
        catch (error) {
            console.error('Error al crear usuario de prueba:', error);
        }
        finally {
            yield database_1.default.close();
        }
    });
}
// Ejecutar la función
createTestUser();
