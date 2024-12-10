import { Request, Response } from 'express';
import { Documento } from '../models/documento.model';

export class DocumentoController {
    // Obtener todos los documentos
    public async obtenerDocumentos(req: Request, res: Response): Promise<void> {
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

    // Obtener un documento por ID
    public async obtenerDocumentoPorId(req: Request, res: Response): Promise<void> {
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
    public async crearDocumento(req: Request, res: Response): Promise<void> {
        try {
            const nuevoDocumento = await Documento.create(req.body);
            res.status(201).json({
                success: true,
                data: nuevoDocumento,
                message: 'Documento creado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al crear el documento',
                error: error
            });
        }
    }

    // Actualizar un documento
    public async actualizarDocumento(req: Request, res: Response): Promise<void> {
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

            await documento.update(req.body);
            
            res.status(200).json({
                success: true,
                data: documento,
                message: 'Documento actualizado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el documento',
                error: error
            });
        }
    }

    // Eliminar un documento
    public async eliminarDocumento(req: Request, res: Response): Promise<void> {
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
}

export const documentoController = new DocumentoController();