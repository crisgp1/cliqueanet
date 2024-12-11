"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginHistory = exports.AjusteValorVehiculo = exports.GastoConsignacion = exports.Documento = exports.CitaEmpleado = exports.Cita = exports.Contacto = exports.Consignacion = exports.Nomina = exports.VentaEmpleado = exports.Venta = exports.Transaccion = exports.Credito = exports.Vehiculo = exports.Cliente = exports.Usuario = exports.TipoIdentificacion = exports.RolUsuario = exports.TipoTransaccion = void 0;
const tipo_transaccion_model_1 = require("./catalogs/tipo-transaccion.model");
Object.defineProperty(exports, "TipoTransaccion", { enumerable: true, get: function () { return tipo_transaccion_model_1.TipoTransaccion; } });
const rol_usuario_model_1 = require("./catalogs/rol-usuario.model");
Object.defineProperty(exports, "RolUsuario", { enumerable: true, get: function () { return rol_usuario_model_1.RolUsuario; } });
const tipo_identificacion_model_1 = require("./catalogs/tipo-identificacion.model");
Object.defineProperty(exports, "TipoIdentificacion", { enumerable: true, get: function () { return tipo_identificacion_model_1.TipoIdentificacion; } });
const usuario_model_1 = require("./usuario.model");
Object.defineProperty(exports, "Usuario", { enumerable: true, get: function () { return usuario_model_1.Usuario; } });
const cliente_model_1 = require("./cliente.model");
Object.defineProperty(exports, "Cliente", { enumerable: true, get: function () { return cliente_model_1.Cliente; } });
const vehiculo_model_1 = require("./vehiculo.model");
Object.defineProperty(exports, "Vehiculo", { enumerable: true, get: function () { return vehiculo_model_1.Vehiculo; } });
const credito_model_1 = require("./credito.model");
Object.defineProperty(exports, "Credito", { enumerable: true, get: function () { return credito_model_1.Credito; } });
const transaccion_model_1 = require("./transaccion.model");
Object.defineProperty(exports, "Transaccion", { enumerable: true, get: function () { return transaccion_model_1.Transaccion; } });
const venta_model_1 = require("./venta.model");
Object.defineProperty(exports, "Venta", { enumerable: true, get: function () { return venta_model_1.Venta; } });
const venta_empleado_model_1 = require("./venta-empleado.model");
Object.defineProperty(exports, "VentaEmpleado", { enumerable: true, get: function () { return venta_empleado_model_1.VentaEmpleado; } });
const nomina_model_1 = require("./nomina.model");
Object.defineProperty(exports, "Nomina", { enumerable: true, get: function () { return nomina_model_1.Nomina; } });
const consignacion_model_1 = require("./consignacion.model");
Object.defineProperty(exports, "Consignacion", { enumerable: true, get: function () { return consignacion_model_1.Consignacion; } });
const contacto_model_1 = require("./contacto.model");
Object.defineProperty(exports, "Contacto", { enumerable: true, get: function () { return contacto_model_1.Contacto; } });
const cita_model_1 = require("./cita.model");
Object.defineProperty(exports, "Cita", { enumerable: true, get: function () { return cita_model_1.Cita; } });
const cita_empleado_model_1 = require("./cita-empleado.model");
Object.defineProperty(exports, "CitaEmpleado", { enumerable: true, get: function () { return cita_empleado_model_1.CitaEmpleado; } });
const documento_model_1 = require("./documento.model");
Object.defineProperty(exports, "Documento", { enumerable: true, get: function () { return documento_model_1.Documento; } });
const gasto_consignacion_model_1 = require("./gasto-consignacion.model");
Object.defineProperty(exports, "GastoConsignacion", { enumerable: true, get: function () { return gasto_consignacion_model_1.GastoConsignacion; } });
const ajuste_valor_vehiculo_model_1 = require("./ajuste-valor-vehiculo.model");
Object.defineProperty(exports, "AjusteValorVehiculo", { enumerable: true, get: function () { return ajuste_valor_vehiculo_model_1.AjusteValorVehiculo; } });
const login_history_model_1 = require("./login-history.model");
Object.defineProperty(exports, "LoginHistory", { enumerable: true, get: function () { return login_history_model_1.LoginHistory; } });
// Lista de todos los modelos
const models = [
    tipo_transaccion_model_1.TipoTransaccion,
    rol_usuario_model_1.RolUsuario,
    tipo_identificacion_model_1.TipoIdentificacion,
    usuario_model_1.Usuario,
    cliente_model_1.Cliente,
    vehiculo_model_1.Vehiculo,
    credito_model_1.Credito,
    transaccion_model_1.Transaccion,
    venta_model_1.Venta,
    venta_empleado_model_1.VentaEmpleado,
    nomina_model_1.Nomina,
    consignacion_model_1.Consignacion,
    contacto_model_1.Contacto,
    cita_model_1.Cita,
    cita_empleado_model_1.CitaEmpleado,
    documento_model_1.Documento,
    gasto_consignacion_model_1.GastoConsignacion,
    ajuste_valor_vehiculo_model_1.AjusteValorVehiculo,
    login_history_model_1.LoginHistory
];
// Exportar lista de modelos por defecto
exports.default = models;
