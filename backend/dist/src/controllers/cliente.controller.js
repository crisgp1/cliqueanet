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
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchClientes = exports.deleteCliente = exports.updateCliente = exports.createCliente = exports.getClienteById = exports.getAllClientes = void 0;
const cliente_model_1 = require("../models/cliente.model");
const sequelize_1 = require("sequelize");
// GET all clientes
const getAllClientes = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clientes = yield cliente_model_1.Cliente.findAll({
            include: ['tipoIdentificacion']
        });
        res.json(clientes);
    }
    catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ message: 'Error al obtener clientes', error });
    }
});
exports.getAllClientes = getAllClientes;
// GET cliente by ID
const getClienteById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cliente = yield cliente_model_1.Cliente.findByPk(req.params.id, {
            include: ['tipoIdentificacion']
        });
        if (!cliente) {
            res.status(404).json({ message: 'Cliente no encontrado' });
            return;
        }
        res.json(cliente);
    }
    catch (error) {
        console.error('Error al obtener cliente:', error);
        res.status(500).json({ message: 'Error al obtener cliente', error });
    }
});
exports.getClienteById = getClienteById;
// POST create new cliente
const createCliente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validar campos requeridos según el tipo de persona
        const { tipoPersona } = req.body;
        if (tipoPersona === 'Moral') {
            if (!req.body.razonSocial || !req.body.rfc || !req.body.fechaConstitucion || !req.body.regimenFiscal) {
                res.status(400).json({
                    message: 'Para personas morales, razón social, RFC, fecha de constitución y régimen fiscal son obligatorios'
                });
                return;
            }
        }
        else if (tipoPersona === 'Física') {
            if (!req.body.curp) {
                res.status(400).json({
                    message: 'Para personas físicas, el CURP es obligatorio'
                });
                return;
            }
        }
        else {
            res.status(400).json({
                message: 'El tipo de persona debe ser "Física" o "Moral"'
            });
            return;
        }
        // Verificar si ya existe un cliente con el mismo CURP, RFC o correo
        const existingCliente = yield cliente_model_1.Cliente.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    ...(req.body.curp ? [{ curp: req.body.curp }] : []),
                    ...(req.body.rfc ? [{ rfc: req.body.rfc }] : []),
                    { correo: req.body.correo },
                    { numIdentificacion: req.body.numIdentificacion }
                ]
            }
        });
        if (existingCliente) {
            res.status(400).json({
                message: 'Ya existe un cliente con el mismo CURP, RFC, correo o número de identificación'
            });
            return;
        }
        // Validar formato de RFC si es proporcionado
        if (req.body.rfc && !/^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(req.body.rfc)) {
            res.status(400).json({
                message: 'El formato del RFC no es válido'
            });
            return;
        }
        // Validar formato de CURP si es proporcionado
        if (req.body.curp && !/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/.test(req.body.curp)) {
            res.status(400).json({
                message: 'El formato del CURP no es válido'
            });
            return;
        }
        const cliente = yield cliente_model_1.Cliente.create(req.body);
        const clienteConRelaciones = yield cliente_model_1.Cliente.findByPk(cliente.id, {
            include: ['tipoIdentificacion']
        });
        res.status(201).json(clienteConRelaciones);
    }
    catch (error) {
        console.error('Error al crear cliente:', error);
        if (error instanceof sequelize_1.ValidationError) {
            res.status(400).json({
                message: 'Error de validación',
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }
        else {
            res.status(400).json({ message: 'Error al crear cliente', error });
        }
    }
});
exports.createCliente = createCliente;
// PUT update cliente
const updateCliente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cliente = yield cliente_model_1.Cliente.findByPk(req.params.id);
        if (!cliente) {
            res.status(404).json({ message: 'Cliente no encontrado' });
            return;
        }
        // Validar campos requeridos según el tipo de persona
        const tipoPersona = req.body.tipoPersona || cliente.tipoPersona;
        if (tipoPersona === 'Moral') {
            const razonSocial = req.body.razonSocial || cliente.razonSocial;
            const rfc = req.body.rfc || cliente.rfc;
            const fechaConstitucion = req.body.fechaConstitucion || cliente.fechaConstitucion;
            const regimenFiscal = req.body.regimenFiscal || cliente.regimenFiscal;
            if (!razonSocial || !rfc || !fechaConstitucion || !regimenFiscal) {
                res.status(400).json({
                    message: 'Para personas morales, razón social, RFC, fecha de constitución y régimen fiscal son obligatorios'
                });
                return;
            }
        }
        else if (tipoPersona === 'Física') {
            const curp = req.body.curp || cliente.curp;
            if (!curp) {
                res.status(400).json({
                    message: 'Para personas físicas, el CURP es obligatorio'
                });
                return;
            }
        }
        // Verificar si ya existe otro cliente con el mismo CURP, RFC o correo
        if (req.body.curp || req.body.rfc || req.body.correo || req.body.numIdentificacion) {
            const whereConditions = [];
            if (req.body.curp)
                whereConditions.push({ curp: req.body.curp });
            if (req.body.rfc)
                whereConditions.push({ rfc: req.body.rfc });
            if (req.body.correo)
                whereConditions.push({ correo: req.body.correo });
            if (req.body.numIdentificacion)
                whereConditions.push({ numIdentificacion: req.body.numIdentificacion });
            const existingCliente = yield cliente_model_1.Cliente.findOne({
                where: {
                    id: { [sequelize_1.Op.ne]: req.params.id },
                    [sequelize_1.Op.or]: whereConditions
                }
            });
            if (existingCliente) {
                res.status(400).json({
                    message: 'Ya existe otro cliente con el mismo CURP, RFC, correo o número de identificación'
                });
                return;
            }
        }
        // Validar formato de RFC si es proporcionado
        if (req.body.rfc && !/^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(req.body.rfc)) {
            res.status(400).json({
                message: 'El formato del RFC no es válido'
            });
            return;
        }
        // Validar formato de CURP si es proporcionado
        if (req.body.curp && !/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/.test(req.body.curp)) {
            res.status(400).json({
                message: 'El formato del CURP no es válido'
            });
            return;
        }
        yield cliente.update(req.body);
        const clienteActualizado = yield cliente_model_1.Cliente.findByPk(req.params.id, {
            include: ['tipoIdentificacion']
        });
        res.json(clienteActualizado);
    }
    catch (error) {
        console.error('Error al actualizar cliente:', error);
        if (error instanceof sequelize_1.ValidationError) {
            res.status(400).json({
                message: 'Error de validación',
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }
        else {
            res.status(400).json({ message: 'Error al actualizar cliente', error });
        }
    }
});
exports.updateCliente = updateCliente;
// DELETE cliente
const deleteCliente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cliente = yield cliente_model_1.Cliente.findByPk(req.params.id);
        if (!cliente) {
            res.status(404).json({ message: 'Cliente no encontrado' });
            return;
        }
        yield cliente.destroy();
        res.status(204).send();
    }
    catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({ message: 'Error al eliminar cliente', error });
    }
});
exports.deleteCliente = deleteCliente;
// GET clientes by search term
const searchClientes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { term } = req.query;
        const clientes = yield cliente_model_1.Cliente.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { nombre: { [sequelize_1.Op.iLike]: `%${term}%` } },
                    { curp: { [sequelize_1.Op.iLike]: `%${term}%` } },
                    { rfc: { [sequelize_1.Op.iLike]: `%${term}%` } },
                    { numIdentificacion: { [sequelize_1.Op.iLike]: `%${term}%` } },
                    { correo: { [sequelize_1.Op.iLike]: `%${term}%` } },
                    { razonSocial: { [sequelize_1.Op.iLike]: `%${term}%` } }
                ]
            },
            include: ['tipoIdentificacion']
        });
        res.json(clientes);
    }
    catch (error) {
        console.error('Error al buscar clientes:', error);
        res.status(500).json({ message: 'Error al buscar clientes', error });
    }
});
exports.searchClientes = searchClientes;
