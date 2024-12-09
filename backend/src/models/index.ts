import { TipoTransaccion } from './catalogs/tipo-transaccion.model';
import { RolUsuario } from './catalogs/rol-usuario.model';
import { TipoIdentificacion } from './catalogs/tipo-identificacion.model';
import { Usuario } from './usuario.model';
import { Cliente } from './cliente.model';
import { Vehiculo } from './vehiculo.model';
import { Credito } from './credito.model';
import { Transaccion } from './transaccion.model';
import { Venta } from './venta.model';
import { VentaEmpleado } from './venta-empleado.model';
import { Nomina } from './nomina.model';
import { Consignacion } from './consignacion.model';
import { Contacto } from './contacto.model';
import { Cita } from './cita.model';
import { CitaEmpleado } from './cita-empleado.model';
import { Documento } from './documento.model';
import { GastoConsignacion } from './gasto-consignacion.model';
import { AjusteValorVehiculo } from './ajuste-valor-vehiculo.model';
import { LoginHistory } from './login-history.model';

// Lista de todos los modelos
const models = [
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
];

// Exportar modelos individuales
export {
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
};

// Exportar lista de modelos por defecto
export default models;