"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolUsuario = exports.JERARQUIA_ROLES = exports.PERMISOS_ROL = exports.ROLES_USUARIO = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const usuario_model_1 = require("../usuario.model");
// Constantes para los roles
exports.ROLES_USUARIO = {
    ADMIN: 1,
    GERENTE: 2,
    VENTAS: 3,
    FINANZAS: 4,
    CAPTURISTA: 5
};
// Descripciones y permisos por rol
const permisosRolConfig = {
    1: {
        nombre: 'Administrador',
        descripcion: 'Control total del sistema',
        nivel: 1,
        permisos: ['*'],
        puedeCrearUsuarios: true,
        puedeEliminarRegistros: true,
        accesoTotal: true
    },
    2: {
        nombre: 'Gerente',
        descripcion: 'Gestión general y reportes',
        nivel: 2,
        permisos: [
            'ver_reportes',
            'gestionar_empleados',
            'gestionar_inventario',
            'gestionar_ventas',
            'gestionar_creditos',
            'gestionar_consignaciones'
        ],
        puedeCrearUsuarios: true,
        puedeEliminarRegistros: false,
        accesoTotal: false
    },
    3: {
        nombre: 'Ventas',
        descripcion: 'Gestión de ventas y clientes',
        nivel: 3,
        permisos: [
            'gestionar_ventas',
            'gestionar_clientes',
            'ver_inventario',
            'crear_citas'
        ],
        puedeCrearUsuarios: false,
        puedeEliminarRegistros: false,
        accesoTotal: false
    },
    4: {
        nombre: 'Finanzas',
        descripcion: 'Gestión financiera y créditos',
        nivel: 3,
        permisos: [
            'gestionar_creditos',
            'ver_reportes_financieros',
            'gestionar_pagos',
            'ver_ventas'
        ],
        puedeCrearUsuarios: false,
        puedeEliminarRegistros: false,
        accesoTotal: false
    },
    5: {
        nombre: 'Capturista',
        descripcion: 'Captura de información básica',
        nivel: 4,
        permisos: [
            'capturar_datos',
            'ver_inventario',
            'crear_citas'
        ],
        puedeCrearUsuarios: false,
        puedeEliminarRegistros: false,
        accesoTotal: false
    }
};
exports.PERMISOS_ROL = permisosRolConfig;
// Jerarquía de roles para herencia de permisos
const jerarquiaRolesConfig = {
    1: [],
    2: [1],
    3: [2],
    4: [2],
    5: [3, 4]
};
exports.JERARQUIA_ROLES = jerarquiaRolesConfig;
let RolUsuario = class RolUsuario extends sequelize_typescript_1.Model {
    // Métodos útiles
    static getNombreRol(idRol) {
        var _a;
        return ((_a = exports.PERMISOS_ROL[idRol]) === null || _a === void 0 ? void 0 : _a.nombre) || 'Desconocido';
    }
    static getPermisos(idRol) {
        var _a;
        return [...(((_a = exports.PERMISOS_ROL[idRol]) === null || _a === void 0 ? void 0 : _a.permisos) || [])];
    }
    // Método para verificar si un rol tiene un permiso específico
    static tienePermiso(idRol, permiso) {
        var _a;
        const permisos = (_a = exports.PERMISOS_ROL[idRol]) === null || _a === void 0 ? void 0 : _a.permisos;
        if (!permisos)
            return false;
        if (permisos.includes('*'))
            return true;
        return permisos.includes(permiso);
    }
    // Método para verificar si un rol puede supervisar a otro
    static puedeSupervizar(rolSupervisor, rolSubordinado) {
        var _a, _b;
        const nivelSupervisor = (_a = exports.PERMISOS_ROL[rolSupervisor]) === null || _a === void 0 ? void 0 : _a.nivel;
        const nivelSubordinado = (_b = exports.PERMISOS_ROL[rolSubordinado]) === null || _b === void 0 ? void 0 : _b.nivel;
        if (!nivelSupervisor || !nivelSubordinado)
            return false;
        return nivelSupervisor < nivelSubordinado;
    }
    // Método para obtener todos los permisos heredados
    static getPermisosHeredados(idRol) {
        var _a;
        const permisosSet = new Set();
        const rolesHeredados = exports.JERARQUIA_ROLES[idRol] || [];
        // Agregar permisos propios
        const permisosRol = ((_a = exports.PERMISOS_ROL[idRol]) === null || _a === void 0 ? void 0 : _a.permisos) || [];
        permisosRol.forEach(p => permisosSet.add(p));
        // Agregar permisos heredados
        rolesHeredados.forEach(rolHeredado => {
            var _a;
            const permisosHeredados = ((_a = exports.PERMISOS_ROL[rolHeredado]) === null || _a === void 0 ? void 0 : _a.permisos) || [];
            permisosHeredados.forEach(p => permisosSet.add(p));
        });
        return Array.from(permisosSet);
    }
    // Método para obtener estadísticas de uso
    static getEstadisticasUso() {
        return __awaiter(this, void 0, void 0, function* () {
            const sequelize = new sequelize_typescript_1.Sequelize('');
            const query = `
      SELECT id_rol, COUNT(*) as cantidad
      FROM usuarios
      GROUP BY id_rol
    `;
            const usuarios = yield sequelize.query(query, {
                type: 'SELECT'
            });
            const usuariosPorRol = {};
            const distribucionNiveles = {};
            let total = 0;
            usuarios.forEach(u => {
                var _a;
                const idRol = u.id_rol;
                const cantidad = parseInt(u.cantidad);
                usuariosPorRol[idRol] = cantidad;
                total += cantidad;
                const nivel = (_a = exports.PERMISOS_ROL[idRol]) === null || _a === void 0 ? void 0 : _a.nivel;
                if (nivel) {
                    distribucionNiveles[nivel] = (distribucionNiveles[nivel] || 0) + cantidad;
                }
            });
            const porcentajes = {};
            Object.entries(usuariosPorRol).forEach(([rol, cantidad]) => {
                const rolId = parseInt(rol);
                porcentajes[rolId] = (cantidad / total) * 100;
            });
            const rolesActivos = Object.keys(usuariosPorRol)
                .map(r => parseInt(r))
                .sort((a, b) => usuariosPorRol[b] - usuariosPorRol[a]);
            return {
                usuariosPorRol,
                porcentajes,
                distribucionNiveles,
                rolesActivos
            };
        });
    }
};
exports.RolUsuario = RolUsuario;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_rol'
    }),
    __metadata("design:type", Number)
], RolUsuario.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            isIn: [Object.values(exports.PERMISOS_ROL).map(r => r.nombre)]
        }
    }),
    __metadata("design:type", String)
], RolUsuario.prototype, "nombre", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => usuario_model_1.Usuario, {
        foreignKey: 'id_rol',
        as: 'usuarios'
    }),
    __metadata("design:type", Array)
], RolUsuario.prototype, "usuarios", void 0);
exports.RolUsuario = RolUsuario = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'roles_usuario',
        timestamps: false
    })
], RolUsuario);
exports.default = RolUsuario;
