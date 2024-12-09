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
  AjusteValorVehiculo
} from './index';

export const initializeAssociations = () => {
  // Relaciones de Usuario
  Usuario.belongsTo(TipoIdentificacion, { foreignKey: 'idTipoIdentificacion' });
  Usuario.belongsTo(RolUsuario, { foreignKey: 'idRol' });
  Usuario.hasMany(Transaccion, { foreignKey: 'idUsuario' });
  Usuario.hasMany(Nomina, { foreignKey: 'idEmpleado' });
  Usuario.belongsToMany(Venta, { through: VentaEmpleado, foreignKey: 'idEmpleado' });
  Usuario.belongsToMany(Cita, { through: CitaEmpleado, foreignKey: 'idEmpleado' });
  Usuario.hasMany(Documento, { foreignKey: 'idEmpleado' });

  // Relaciones de Cliente
  Cliente.belongsTo(TipoIdentificacion, { foreignKey: 'idTipoIdentificacion' });
  Cliente.hasMany(Credito, { foreignKey: 'idCliente' });
  Cliente.hasMany(Transaccion, { foreignKey: 'idCliente' });
  Cliente.hasMany(Contacto, { foreignKey: 'idCliente' });
  Cliente.hasMany(Documento, { foreignKey: 'idCliente' });

  // Relaciones de Vehículo
  Vehiculo.hasMany(Transaccion, { foreignKey: 'idVehiculo' });
  Vehiculo.hasOne(Consignacion, { foreignKey: 'idVehiculo' });
  Vehiculo.hasMany(Cita, { foreignKey: 'idVehiculo' });
  Vehiculo.hasMany(Documento, { foreignKey: 'idVehiculo' });
  Vehiculo.hasMany(AjusteValorVehiculo, { foreignKey: 'idVehiculo' });

  // Relaciones de Crédito
  Credito.belongsTo(Cliente, { foreignKey: 'idCliente' });
  Credito.hasMany(Transaccion, { foreignKey: 'idCredito' });

  // Relaciones de Transacción
  Transaccion.belongsTo(Usuario, { foreignKey: 'idUsuario' });
  Transaccion.belongsTo(Cliente, { foreignKey: 'idCliente' });
  Transaccion.belongsTo(Vehiculo, { foreignKey: 'idVehiculo' });
  Transaccion.belongsTo(Credito, { foreignKey: 'idCredito' });
  Transaccion.belongsTo(TipoTransaccion, { foreignKey: 'idTipoTransaccion' });
  Transaccion.hasOne(Venta, { foreignKey: 'idTransaccion' });
  Transaccion.hasMany(Documento, { foreignKey: 'idTransaccion' });

  // Relaciones de Venta
  Venta.belongsTo(Transaccion, { foreignKey: 'idTransaccion' });
  Venta.belongsToMany(Usuario, { through: VentaEmpleado, foreignKey: 'idVenta' });

  // Relaciones de Consignación
  Consignacion.belongsTo(Vehiculo, { foreignKey: 'idVehiculo' });
  Consignacion.hasMany(Contacto, { foreignKey: 'idConsignacion' });
  Consignacion.hasMany(GastoConsignacion, { foreignKey: 'idConsignacion' });

  // Relaciones de GastoConsignacion
  GastoConsignacion.belongsTo(Consignacion, { foreignKey: 'idConsignacion' });

  // Relaciones de AjusteValorVehiculo
  AjusteValorVehiculo.belongsTo(Vehiculo, { foreignKey: 'idVehiculo' });

  // Relaciones de Contacto
  Contacto.belongsTo(Cliente, { foreignKey: 'idCliente' });
  Contacto.belongsTo(Consignacion, { foreignKey: 'idConsignacion' });
  Contacto.hasMany(Cita, { foreignKey: 'idContacto' });

  // Relaciones de Cita
  Cita.belongsTo(Usuario, { as: 'empleadoCreador', foreignKey: 'idEmpleadoCreador' });
  Cita.belongsTo(Contacto, { foreignKey: 'idContacto' });
  Cita.belongsTo(Vehiculo, { foreignKey: 'idVehiculo' });
  Cita.belongsToMany(Usuario, { through: CitaEmpleado, foreignKey: 'idCita' });

  // Relaciones de Documento
  Documento.belongsTo(Usuario, { foreignKey: 'idEmpleado' });
  Documento.belongsTo(Cliente, { foreignKey: 'idCliente' });
  Documento.belongsTo(Vehiculo, { foreignKey: 'idVehiculo' });
  Documento.belongsTo(Transaccion, { foreignKey: 'idTransaccion' });
};