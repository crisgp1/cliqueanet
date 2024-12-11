"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAssociations = void 0;
const index_1 = require("./index");
const initializeAssociations = () => {
    // Relaciones de Usuario
    index_1.Usuario.belongsTo(index_1.TipoIdentificacion, { foreignKey: 'id_tipo_identificacion' });
    index_1.Usuario.belongsTo(index_1.RolUsuario, { foreignKey: 'id_rol' });
    index_1.Usuario.hasMany(index_1.Transaccion, { foreignKey: 'id_usuario' });
    index_1.Usuario.hasMany(index_1.Nomina, { foreignKey: 'id_empleado' });
    index_1.Usuario.belongsToMany(index_1.Venta, { through: index_1.VentaEmpleado, foreignKey: 'id_empleado' });
    index_1.Usuario.belongsToMany(index_1.Cita, { through: index_1.CitaEmpleado, foreignKey: 'id_empleado' });
    index_1.Usuario.hasMany(index_1.Documento, { foreignKey: 'id_empleado' });
    // Relaciones de LoginHistory
    index_1.LoginHistory.belongsTo(index_1.Usuario, { foreignKey: 'id_empleado' });
    // Relaciones de Cliente
    index_1.Cliente.belongsTo(index_1.TipoIdentificacion, { foreignKey: 'id_tipo_identificacion' });
    index_1.Cliente.hasMany(index_1.Credito, { foreignKey: 'id_cliente' });
    index_1.Cliente.hasMany(index_1.Transaccion, { foreignKey: 'id_cliente' });
    index_1.Cliente.hasMany(index_1.Contacto, { foreignKey: 'id_cliente' });
    index_1.Cliente.hasMany(index_1.Documento, { foreignKey: 'id_cliente' });
    // Relaciones de Vehículo
    index_1.Vehiculo.hasMany(index_1.Transaccion, { foreignKey: 'id_vehiculo' });
    index_1.Vehiculo.hasOne(index_1.Consignacion, { foreignKey: 'id_vehiculo' });
    index_1.Vehiculo.hasMany(index_1.Cita, { foreignKey: 'id_vehiculo' });
    index_1.Vehiculo.hasMany(index_1.Documento, { foreignKey: 'id_vehiculo' });
    index_1.Vehiculo.hasMany(index_1.AjusteValorVehiculo, { foreignKey: 'id_vehiculo' });
    // Relaciones de Crédito
    index_1.Credito.belongsTo(index_1.Cliente, { foreignKey: 'id_cliente' });
    index_1.Credito.hasMany(index_1.Transaccion, { foreignKey: 'id_credito' });
    // Relaciones de Transacción
    index_1.Transaccion.belongsTo(index_1.Usuario, { foreignKey: 'id_usuario' });
    index_1.Transaccion.belongsTo(index_1.Cliente, { foreignKey: 'id_cliente' });
    index_1.Transaccion.belongsTo(index_1.Vehiculo, { foreignKey: 'id_vehiculo' });
    index_1.Transaccion.belongsTo(index_1.Credito, { foreignKey: 'id_credito' });
    index_1.Transaccion.belongsTo(index_1.TipoTransaccion, { foreignKey: 'id_tipo_transaccion' });
    index_1.Transaccion.hasOne(index_1.Venta, { foreignKey: 'id_transaccion' });
    index_1.Transaccion.hasMany(index_1.Documento, { foreignKey: 'id_transaccion' });
    // Relaciones de Venta
    index_1.Venta.belongsTo(index_1.Transaccion, { foreignKey: 'id_transaccion' });
    index_1.Venta.belongsToMany(index_1.Usuario, { through: index_1.VentaEmpleado, foreignKey: 'id_venta' });
    // Relaciones de Consignación
    index_1.Consignacion.belongsTo(index_1.Vehiculo, { foreignKey: 'id_vehiculo' });
    index_1.Consignacion.hasMany(index_1.Contacto, { foreignKey: 'id_consignacion' });
    index_1.Consignacion.hasMany(index_1.GastoConsignacion, { foreignKey: 'id_consignacion' });
    // Relaciones de GastoConsignacion
    index_1.GastoConsignacion.belongsTo(index_1.Consignacion, { foreignKey: 'id_consignacion' });
    // Relaciones de AjusteValorVehiculo
    index_1.AjusteValorVehiculo.belongsTo(index_1.Vehiculo, { foreignKey: 'id_vehiculo' });
    // Relaciones de Contacto
    index_1.Contacto.belongsTo(index_1.Cliente, { foreignKey: 'id_cliente' });
    index_1.Contacto.belongsTo(index_1.Consignacion, { foreignKey: 'id_consignacion' });
    index_1.Contacto.hasMany(index_1.Cita, { foreignKey: 'id_contacto' });
    // Relaciones de Cita
    index_1.Cita.belongsTo(index_1.Usuario, { foreignKey: 'id_empleado_creador' });
    index_1.Cita.belongsTo(index_1.Contacto, { foreignKey: 'id_contacto' });
    index_1.Cita.belongsTo(index_1.Vehiculo, { foreignKey: 'id_vehiculo' });
    index_1.Cita.belongsToMany(index_1.Usuario, { through: index_1.CitaEmpleado, foreignKey: 'id_cita' });
    // Relaciones de Documento
    index_1.Documento.belongsTo(index_1.Usuario, { foreignKey: 'id_empleado' });
    index_1.Documento.belongsTo(index_1.Cliente, { foreignKey: 'id_cliente' });
    index_1.Documento.belongsTo(index_1.Vehiculo, { foreignKey: 'id_vehiculo' });
    index_1.Documento.belongsTo(index_1.Transaccion, { foreignKey: 'id_transaccion' });
};
exports.initializeAssociations = initializeAssociations;
