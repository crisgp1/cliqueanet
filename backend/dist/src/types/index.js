"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolUsuario = exports.TipoTransaccion = exports.CategoriaMultimedia = void 0;
// Enumeraciones
var CategoriaMultimedia;
(function (CategoriaMultimedia) {
    CategoriaMultimedia["Estado_cuenta"] = "Estado_cuenta";
    CategoriaMultimedia["Nomina"] = "Nomina";
    CategoriaMultimedia["Otro"] = "Otro";
})(CategoriaMultimedia || (exports.CategoriaMultimedia = CategoriaMultimedia = {}));
var TipoTransaccion;
(function (TipoTransaccion) {
    TipoTransaccion["Venta"] = "Venta";
    TipoTransaccion["Apartado"] = "Apartado";
    TipoTransaccion["Credito"] = "Credito";
    TipoTransaccion["Traspaso"] = "Traspaso";
    TipoTransaccion["Cambio"] = "Cambio";
})(TipoTransaccion || (exports.TipoTransaccion = TipoTransaccion = {}));
var RolUsuario;
(function (RolUsuario) {
    RolUsuario[RolUsuario["Administrador"] = 1] = "Administrador";
    RolUsuario[RolUsuario["Ventas"] = 2] = "Ventas";
    RolUsuario[RolUsuario["RRHH"] = 3] = "RRHH";
    RolUsuario[RolUsuario["Gerente_general"] = 4] = "Gerente_general";
    RolUsuario[RolUsuario["Capturista"] = 5] = "Capturista";
})(RolUsuario || (exports.RolUsuario = RolUsuario = {}));
