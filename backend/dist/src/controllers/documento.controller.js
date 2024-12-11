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
exports.documentoController = exports.DocumentoController = void 0;
const documento_model_1 = require("../models/documento.model");
class DocumentoController {
    // Obtener todos los documentos
    obtenerDocumentos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const documentos = yield documento_model_1.Documento.findAll();
                res.status(200).json({
                    success: true,
                    data: documentos,
                    message: 'Documentos obtenidos exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener los documentos',
                    error: error
                });
            }
        });
    }
    // Obtener documentos por empleado
    obtenerDocumentosPorEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idEmpleado } = req.params;
                const documentos = yield documento_model_1.Documento.findAll({
                    where: {
                        idEmpleado: idEmpleado
                    }
                });
                // Verificar si hay documentos pendientes
                const documentosPendientes = documentos.some(doc => doc.estado === 'pendiente');
                res.status(200).json({
                    success: true,
                    data: {
                        documentosPendientes,
                        documentos
                    },
                    message: 'Documentos del empleado obtenidos exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener los documentos del empleado',
                    error: error
                });
            }
        });
    }
    // Obtener un documento por ID
    obtenerDocumentoPorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const documento = yield documento_model_1.Documento.findByPk(id);
                if (!documento) {
                    res.status(404).json({
                        success: false,
                        message: 'Documento no encontrado'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: documento,
                    message: 'Documento obtenido exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener el documento',
                    error: error
                });
            }
        });
    }
    // Crear un nuevo documento
    crearDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const file = req.file;
                if (!file) {
                    res.status(400).json({
                        success: false,
                        message: 'No se ha proporcionado ningún archivo'
                    });
                    return;
                }
                const fileUrl = `/uploads/${file.filename}`;
                const nuevoDocumento = yield documento_model_1.Documento.create(Object.assign(Object.assign({}, req.body), { url: fileUrl, estado: 'pendiente', fecha_subida: new Date() }));
                res.status(201).json({
                    success: true,
                    data: nuevoDocumento,
                    message: 'Documento creado exitosamente'
                });
            }
            catch (error) {
                console.error('Error al crear documento:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al crear el documento',
                    error: error
                });
            }
        });
    }
    // Actualizar un documento
    actualizarDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const documento = yield documento_model_1.Documento.findByPk(id);
                if (!documento) {
                    res.status(404).json({
                        success: false,
                        message: 'Documento no encontrado'
                    });
                    return;
                }
                yield documento.update(req.body);
                res.status(200).json({
                    success: true,
                    data: documento,
                    message: 'Documento actualizado exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar el documento',
                    error: error
                });
            }
        });
    }
    // Aprobar un documento
    aprobarDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const documento = yield documento_model_1.Documento.findByPk(id);
                if (!documento) {
                    res.status(404).json({
                        success: false,
                        message: 'Documento no encontrado'
                    });
                    return;
                }
                if (documento.estado !== 'pendiente') {
                    res.status(400).json({
                        success: false,
                        message: 'El documento no está en estado pendiente'
                    });
                    return;
                }
                yield documento.update({ estado: 'aprobado' });
                res.status(200).json({
                    success: true,
                    data: documento,
                    message: 'Documento aprobado exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al aprobar el documento',
                    error: error
                });
            }
        });
    }
    // Rechazar un documento
    rechazarDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const documento = yield documento_model_1.Documento.findByPk(id);
                if (!documento) {
                    res.status(404).json({
                        success: false,
                        message: 'Documento no encontrado'
                    });
                    return;
                }
                if (documento.estado !== 'pendiente') {
                    res.status(400).json({
                        success: false,
                        message: 'El documento no está en estado pendiente'
                    });
                    return;
                }
                yield documento.update({ estado: 'rechazado' });
                res.status(200).json({
                    success: true,
                    data: documento,
                    message: 'Documento rechazado exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al rechazar el documento',
                    error: error
                });
            }
        });
    }
    // Eliminar un documento
    eliminarDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const documento = yield documento_model_1.Documento.findByPk(id);
                if (!documento) {
                    res.status(404).json({
                        success: false,
                        message: 'Documento no encontrado'
                    });
                    return;
                }
                yield documento.destroy();
                res.status(200).json({
                    success: true,
                    message: 'Documento eliminado exitosamente'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar el documento',
                    error: error
                });
            }
        });
    }
}
exports.DocumentoController = DocumentoController;
exports.documentoController = new DocumentoController();
