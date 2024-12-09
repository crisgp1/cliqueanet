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
  Usuario.hasMany(Transaccion, { foreignKey: 'id_usuario', as: 'transacciones' });
  Usuario.hasMany(Nomina, { foreignKey: 'id_empleado', as: 'nominas' });
  Usuario.belongsToMany(Venta, { through: VentaEmpleado, foreignKey: 'id_empleado', as: 'ventas' });
  Usuario.belongsToMany(Cita, { through: CitaEmpleado, foreignKey: 'id_empleado', as: 'citas' });
  Usuario.hasMany(Documento, { foreignKey: 'id_empleado', as: 'documentos' });

  // Relaciones de LoginHistory
  LoginHistory.belongsTo(Usuario, { foreignKey: 'id_empleado', as: 'usuario' });

  // Relaciones de Cliente
  Cliente.belongsTo(TipoIdentificacion, { foreignKey: 'id_tipo_identificacion' });
  Cliente.hasMany(Credito, { foreignKey: 'id_cliente', as: 'creditos' });
  Cliente.hasMany(Transaccion, { foreignKey: 'id_cliente', as: 'transacciones' });
  Cliente.hasMany(Contacto, { foreignKey: 'id_cliente', as: 'contactos' });
  Cliente.hasMany(Documento, { foreignKey: 'id_cliente', as: 'documentos' });

  // Relaciones de Vehículo
  Vehiculo.hasMany(Transaccion, { foreignKey: 'id_vehiculo', as: 'transacciones' });
  Vehiculo.hasOne(Consignacion, { foreignKey: 'id_vehiculo', as: 'consignacionVehiculo' });
  Vehiculo.hasMany(Cita, { foreignKey: 'id_vehiculo', as: 'citas' });
  Vehiculo.hasMany(Documento, { foreignKey: 'id_vehiculo', as: 'documentos' });
  Vehiculo.hasMany(AjusteValorVehiculo, { foreignKey: 'id_vehiculo', as: 'ajustes' });

  // Relaciones de Crédito
  Credito.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });
  Credito.hasMany(Transaccion, { foreignKey: 'id_credito', as: 'transacciones' });

  // Relaciones de Transacción
  Transaccion.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuarioTransaccion' });
  Transaccion.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });
  Transaccion.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo', as: 'vehiculo' });
  Transaccion.belongsTo(Credito, { foreignKey: 'id_credito', as: 'credito' });
  Transaccion.belongsTo(TipoTransaccion, { foreignKey: 'id_tipo_transaccion', as: 'tipoTransaccion' });
  Transaccion.hasOne(Venta, { foreignKey: 'id_transaccion', as: 'venta' });
  Transaccion.hasMany(Documento, { foreignKey: 'id_transaccion', as: 'documentos' });

  // Relaciones de Venta
  Venta.belongsTo(Transaccion, { foreignKey: 'id_transaccion', as: 'transaccion' });
  Venta.belongsToMany(Usuario, { through: VentaEmpleado, foreignKey: 'id_venta', as: 'usuarios' });

  // Relaciones de Consignación
  Consignacion.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo', as: 'vehiculoConsignado' });
  Consignacion.hasMany(Contacto, { foreignKey: 'id_consignacion', as: 'contactosConsignacion' });
  Consignacion.hasMany(GastoConsignacion, { foreignKey: 'id_consignacion', as: 'gastosConsignacion' });

  // Relaciones de GastoConsignacion
  GastoConsignacion.belongsTo(Consignacion, { foreignKey: 'id_consignacion', as: 'consignacionGasto' });

  // Relaciones de AjusteValorVehiculo
  AjusteValorVehiculo.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo', as: 'vehiculoAjuste' });

  // Relaciones de Contacto
  Contacto.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'clienteContacto' });
  Contacto.belongsTo(Consignacion, { foreignKey: 'id_consignacion', as: 'consignacionContacto' });
  Contacto.hasMany(Cita, { foreignKey: 'id_contacto', as: 'citasContacto' });

  // Relaciones de Cita
  Cita.belongsTo(Usuario, { foreignKey: 'id_empleado_creador', as: 'creador' });
  Cita.belongsTo(Contacto, { foreignKey: 'id_contacto', as: 'contactoCita' });
  Cita.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo', as: 'vehiculoCita' });
  Cita.belongsToMany(Usuario, { through: CitaEmpleado, foreignKey: 'id_cita', as: 'usuariosCita' });

  // Relaciones de Documento
  Documento.belongsTo(Usuario, { foreignKey: 'id_empleado', as: 'usuarioDocumento' });
  Documento.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'clienteDocumento' });
  Documento.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo', as: 'vehiculoDocumento' });
  Documento.belongsTo(Transaccion, { foreignKey: 'id_transaccion', as: 'transaccionDocumento' });
};