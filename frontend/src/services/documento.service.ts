import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class DocumentoService {
    private static instance: DocumentoService;
    private baseUrl: string;

    private constructor() {
        this.baseUrl = `${API_URL}/api/documentos`;
    }

    public static getInstance(): DocumentoService {
        if (!DocumentoService.instance) {
            DocumentoService.instance = new DocumentoService();
        }
        return DocumentoService.instance;
    }

    public async obtenerDocumentos() {
        try {
            const response = await axios.get(this.baseUrl, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async obtenerDocumentoPorId(id: number) {
        try {
            const response = await axios.get(`${this.baseUrl}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async crearDocumento(documento: any) {
        try {
            const response = await axios.post(this.baseUrl, documento, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async actualizarDocumento(id: number, documento: any) {
        try {
            const response = await axios.put(`${this.baseUrl}/${id}`, documento, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async eliminarDocumento(id: number) {
        try {
            const response = await axios.delete(`${this.baseUrl}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    private handleError(error: any): Error {
        if (error.response) {
            // El servidor respondió con un código de estado fuera del rango 2xx
            const message = error.response.data.message || 'Error en la solicitud';
            return new Error(message);
        } else if (error.request) {
            // La solicitud se realizó pero no se recibió respuesta
            return new Error('No se recibió respuesta del servidor');
        } else {
            // Ocurrió un error al configurar la solicitud
            return new Error('Error al procesar la solicitud');
        }
    }
}

export const documentoService = DocumentoService.getInstance();