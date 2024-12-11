import {
  TipoTransaccion,
  RolUsuario,
  TipoIdentificacion,
  Usuario,
  Cliente,
  Vehiculo,
  Credito,
  Transaccion,
  Venta,
  VentaEmpleado,
  Nomina,
  Consignacion,
  Contacto,
  Cita,
  CitaEmpleado,
  Documento,
  GastoConsignacion,
  AjusteValorVehiculo,
  LoginHistory
} from './index';

export const initializeAssociations = () => {
  // Relaciones de Usuario
  Usuario.belongsTo(TipoIdentificacion, { foreignKey: 'id_tipo_identificacion' });
  Usuario.belongsTo(RolUsuario, { foreignKey: 'id_rol' });
  Usuario.hasMany(Transaccion, { foreignKey: 'id_usuario' });
  Usuario.hasMany(Nomina, { foreignKey: 'id_empleado' });
  Usuario.belongsToMany(Venta, { through: VentaEmpleado, foreignKey: 'id_empleado' });
  Usuario.belongsToMany(Cita, { through: CitaEmpleado, foreignKey: 'id_empleado' });
  Usuario.hasMany(Documento, { foreignKey: 'id_empleado' });

  // Relaciones de LoginHistory
  LoginHistory.belongsTo(Usuario, { foreignKey: 'id_empleado' });

  // Relaciones de Cliente
  Cliente.belongsTo(TipoIdentificacion, { foreignKey: 'id_tipo_identificacion' });
  Cliente.hasMany(Credito, { foreignKey: 'id_cliente' });
  Cliente.hasMany(Transaccion, { foreignKey: 'id_cliente' });
  Cliente.hasMany(Contacto, { foreignKey: 'id_cliente' });
  Cliente.hasMany(Documento, { foreignKey: 'id_cliente' });

  // Relaciones de Vehículo
  Vehiculo.hasMany(Transaccion, { foreignKey: 'id_vehiculo' });
  Vehiculo.hasOne(Consignacion, { foreignKey: 'id_vehiculo' });
  Vehiculo.hasMany(Cita, { foreignKey: 'id_vehiculo' });
  Vehiculo.hasMany(Documento, { foreignKey: 'id_vehiculo' });
  Vehiculo.hasMany(AjusteValorVehiculo, { foreignKey: 'id_vehiculo' });

  // Relaciones de Crédito
  Credito.belongsTo(Cliente, { foreignKey: 'id_cliente' });
  Credito.hasMany(Transaccion, { foreignKey: 'id_credito' });

  // Relaciones de Transacción
  Transaccion.belongsTo(Usuario, { foreignKey: 'id_usuario' });
  Transaccion.belongsTo(Cliente, { foreignKey: 'id_cliente' });
  Transaccion.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo' });
  Transaccion.belongsTo(Credito, { foreignKey: 'id_credito' });
  Transaccion.belongsTo(TipoTransaccion, { foreignKey: 'id_tipo_transaccion' });
  Transaccion.hasOne(Venta, { foreignKey: 'id_transaccion' });
  Transaccion.hasMany(Documento, { foreignKey: 'id_transaccion' });

  // Relaciones de Venta
  Venta.belongsTo(Transaccion, { foreignKey: 'id_transaccion' });
  Venta.belongsToMany(Usuario, { through: VentaEmpleado, foreignKey: 'id_venta' });

  // Relaciones de Consignación
  Consignacion.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo' });
  Consignacion.hasMany(Contacto, { foreignKey: 'id_consignacion' });
  Consignacion.hasMany(GastoConsignacion, { foreignKey: 'id_consignacion' });

  // Relaciones de GastoConsignacion
  GastoConsignacion.belongsTo(Consignacion, { foreignKey: 'id_consignacion' });

  // Relaciones de AjusteValorVehiculo
  AjusteValorVehiculo.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo' });

  // Relaciones de Contacto
  Contacto.belongsTo(Cliente, { foreignKey: 'id_cliente' });
  Contacto.belongsTo(Consignacion, { foreignKey: 'id_consignacion' });
  Contacto.hasMany(Cita, { foreignKey: 'id_contacto' });

  // Relaciones de Cita
  Cita.belongsTo(Usuario, { foreignKey: 'id_empleado_creador' });
  Cita.belongsTo(Contacto, { foreignKey: 'id_contacto' });
  Cita.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo' });
  Cita.belongsToMany(Usuario, { through: CitaEmpleado, foreignKey: 'id_cita' });

  // Relaciones de Documento
  Documento.belongsTo(Usuario, { foreignKey: 'id_empleado' });
  Documento.belongsTo(Cliente, { foreignKey: 'id_cliente' });
  Documento.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo' });
  Documento.belongsTo(Transaccion, { foreignKey: 'id_transaccion' });
};