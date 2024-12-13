import { Request, Response } from 'express';
import { Documento } from '../models/documento.model';
import { moveFileToFinal } from '../middlewares/upload.middleware';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class DocumentoController {
    // Función auxiliar para generar el hash de un archivo
    private generarHashArchivo = async (filePath: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = fs.createReadStream(filePath);
            
            stream.on('error', err => reject(err));
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
        });
    }

    // Función auxiliar para determinar la entidad origen
    private determinarEntidadOrigen = (body: any): 'cliente' | 'empleado' | 'vehiculo' | 'transaccion' | 'general' => {
        if (body.id_empleado) return 'empleado';
        if (body.id_cliente) return 'cliente';
        if (body.id_vehiculo) return 'vehiculo';
        if (body.id_transaccion) return 'transaccion';
        return 'general';
    }

    // Obtener todos los documentos
    public obtenerDocumentos = async (req: Request, res: Response): Promise<void> => {
        try {
            const documentos = await Documento.findAll();
            res.status(200).json({
                success: true,
                data: documentos,
                message: 'Documentos obtenidos exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener los documentos',
                error: error
            });
        }
    }

    // Obtener documentos por empleado
    public obtenerDocumentosPorEmpleado = async (req: Request, res: Response): Promise<void> => {
        try {
            const { idEmpleado } = req.params;
            const documentos = await Documento.getDocumentosPorTipoYEntidad('empleado', {
                idEmpleado: parseInt(idEmpleado)
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
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener los documentos del empleado',
                error: error
            });
        }
    }

    // Obtener un documento por ID
    public obtenerDocumentoPorId = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const documento = await Documento.findByPk(id);
            
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
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener el documento',
                error: error
            });
        }
    }

    // Crear un nuevo documento
    public crearDocumento = async (req: Request, res: Response): Promise<void> => {
        try {
            const file = req.file;
            if (!file) {
                res.status(400).json({
                    success: false,
                    message: 'No se ha proporcionado ningún archivo'
                });
                return;
            }

            // Mover el archivo al directorio de documentos
            const documentosDir = path.join(process.cwd(), 'uploads', 'documentos');
            if (!fs.existsSync(documentosDir)) {
                fs.mkdirSync(documentosDir, { recursive: true });
            }

            const finalPath = path.join(documentosDir, file.filename);
            fs.renameSync(file.path, finalPath);
            
            // Generar hash del archivo
            const hashArchivo = await this.generarHashArchivo(finalPath);
            
            // Determinar la entidad origen
            const entidadOrigen = this.determinarEntidadOrigen(req.body);
            
            // Determinar el tipo de documento específico según la entidad
            let tipoDocumentoEspecifico = null;
            if (entidadOrigen === 'empleado' && req.body.tipo_documento_empleado) {
                tipoDocumentoEspecifico = {
                    tipo_documento_empleado: req.body.tipo_documento_empleado
                };
            } else if (entidadOrigen === 'vehiculo' && req.body.tipo_documento_vehiculo) {
                tipoDocumentoEspecifico = {
                    tipo_documento_vehiculo: req.body.tipo_documento_vehiculo
                };
            } else if (entidadOrigen === 'transaccion' && req.body.tipo_documento_transaccion) {
                tipoDocumentoEspecifico = {
                    tipo_documento_transaccion: req.body.tipo_documento_transaccion
                };
            }
            
            const fileUrl = `/uploads/documentos/${file.filename}`;
            
            const nuevoDocumento = await Documento.create({
                ...req.body,
                ...tipoDocumentoEspecifico,
                url: fileUrl,
                estado: 'pendiente',
                fecha_subida: new Date(),
                nombre_archivo_original: file.originalname,
                mime_type: file.mimetype,
                tamanio_archivo: file.size,
                hash_archivo: hashArchivo,
                entidad_origen: entidadOrigen
            });
    
            res.status(201).json({
                success: true,
                data: nuevoDocumento,
                message: 'Documento creado exitosamente'
            });
        } catch (error) {
            // Si hay un error, intentar eliminar el archivo si existe
            if (req.file) {
                const filePath = path.join(process.cwd(), 'uploads', 'documentos', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            console.error('Error al crear documento:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear el documento',
                error: error
            });
        }
    }

    // Actualizar un documento
    public actualizarDocumento = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const documento = await Documento.findByPk(id);
            
            if (!documento) {
                res.status(404).json({
                    success: false,
                    message: 'Documento no encontrado'
                });
                return;
            }

            // Si hay un nuevo archivo
            if (req.file) {
                // Eliminar el archivo anterior
                const oldFilePath = path.join(process.cwd(), documento.url);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }

                // Mover el nuevo archivo al directorio de documentos
                const documentosDir = path.join(process.cwd(), 'uploads', 'documentos');
                if (!fs.existsSync(documentosDir)) {
                    fs.mkdirSync(documentosDir, { recursive: true });
                }

                const finalPath = path.join(documentosDir, req.file.filename);
                fs.renameSync(req.file.path, finalPath);
                
                // Generar hash del nuevo archivo
                const hashArchivo = await this.generarHashArchivo(finalPath);
                
                req.body.url = `/uploads/documentos/${req.file.filename}`;
                req.body.nombre_archivo_original = req.file.originalname;
                req.body.mime_type = req.file.mimetype;
                req.body.tamanio_archivo = req.file.size;
                req.body.hash_archivo = hashArchivo;
            }

            await documento.update(req.body);
            
            res.status(200).json({
                success: true,
                data: documento,
                message: 'Documento actualizado exitosamente'
            });
        } catch (error) {
            // Si hay un error y se subió un nuevo archivo, intentar eliminarlo
            if (req.file) {
                const filePath = path.join(process.cwd(), 'uploads', 'documentos', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            res.status(500).json({
                success: false,
                message: 'Error al actualizar el documento',
                error: error
            });
        }
    }

    // Aprobar un documento
    public aprobarDocumento = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const documento = await Documento.findByPk(id);
            
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

            await documento.cambiarEstado('aprobado', req.body.idUsuario, req.body.comentario);
            
            res.status(200).json({
                success: true,
                data: documento,
                message: 'Documento aprobado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al aprobar el documento',
                error: error
            });
        }
    }

    // Rechazar un documento
    public rechazarDocumento = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const documento = await Documento.findByPk(id);
            
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

            await documento.cambiarEstado('rechazado', req.body.idUsuario, req.body.comentario);
            
            res.status(200).json({
                success: true,
                data: documento,
                message: 'Documento rechazado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al rechazar el documento',
                error: error
            });
        }
    }

    // Eliminar un documento
    public eliminarDocumento = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const documento = await Documento.findByPk(id);
            
            if (!documento) {
                res.status(404).json({
                    success: false,
                    message: 'Documento no encontrado'
                });
                return;
            }

            // Eliminar el archivo físico
            const filePath = path.join(process.cwd(), documento.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            await documento.destroy();
            
            res.status(200).json({
                success: true,
                message: 'Documento eliminado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar el documento',
                error: error
            });
        }
    }

    // Verificar integridad del documento
    public verificarIntegridad = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const documento = await Documento.findByPk(id);
            
            if (!documento) {
                res.status(404).json({
                    success: false,
                    message: 'Documento no encontrado'
                });
                return;
            }

            const filePath = path.join(process.cwd(), documento.url);
            if (!fs.existsSync(filePath)) {
                res.status(404).json({
                    success: false,
                    message: 'Archivo físico no encontrado'
                });
                return;
            }

            const hashActual = await this.generarHashArchivo(filePath);
            const integridadVerificada = hashActual === documento.hashArchivo;

            res.status(200).json({
                success: true,
                data: {
                    integridadVerificada,
                    hashOriginal: documento.hashArchivo,
                    hashActual
                },
                message: integridadVerificada 
                    ? 'La integridad del documento ha sido verificada'
                    : 'El documento ha sido modificado'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al verificar la integridad del documento',
                error: error
            });
        }
    }
}

export const documentoController = new DocumentoController();