import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export interface Documento {
    id: number;
    nombre: string;
    tipo: string;
    url: string;
    id_empleado?: number;
    id_cliente?: number;
    id_vehiculo?: number;
    id_transaccion?: number;
    fecha_subida: Date;
    descripcion?: string;
    permisos_acceso?: string;
}

export interface CreateDocumentoDto {
    nombre: string;
    tipo: string;
    archivo: File;
    id_empleado?: number;
    id_cliente?: number;
    id_vehiculo?: number;
    id_transaccion?: number;
}

export interface UpdateDocumentoDto {
    nombre?: string;
    tipo?: string;
    archivo?: File;
    estado?: 'pendiente' | 'aprobado' | 'rechazado';
}

export interface DocumentosResponse {
    documentosPendientes: boolean;
    documentos: Documento[];
}

export interface GenerarPdfResponse {
    url: string;
    filename: string;
}

class DocumentoService {
    private baseUrl = `${API_URL}/documentos`;

    async obtenerDocumentos(): Promise<Documento[]> {
        try {
            const response = await axios.get<{ data: Documento[] }>(this.baseUrl);
            return response.data.data;
        } catch (error) {
            console.error('Error al obtener documentos:', error);
            throw error;
        }
    }

    async obtenerDocumentoPorId(id: number): Promise<Documento> {
        try {
            const response = await axios.get<{ data: Documento }>(`${this.baseUrl}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error al obtener documento ${id}:`, error);
            throw error;
        }
    }

    async obtenerDocumentosPorEmpleado(idEmpleado: number): Promise<DocumentosResponse> {
        try {
            const response = await axios.get<{ data: DocumentosResponse }>(
                `${this.baseUrl}/empleado/${idEmpleado}`
            );
            return response.data.data;
        } catch (error) {
            console.error(`Error al obtener documentos del empleado ${idEmpleado}:`, error);
            throw error;
        }
    }

    async obtenerDocumentosPorTransaccion(idTransaccion: number): Promise<DocumentosResponse> {
        try {
            const response = await axios.get<{ data: DocumentosResponse }>(
                `${this.baseUrl}/transaccion/${idTransaccion}`
            );
            return response.data.data;
        } catch (error) {
            console.error(`Error al obtener documentos de la transacción ${idTransaccion}:`, error);
            throw error;
        }
    }

    async crearDocumento(documento: CreateDocumentoDto): Promise<Documento> {
        try {
            const formData = new FormData();
            formData.append('nombre', documento.nombre);
            formData.append('tipo', documento.tipo);
            formData.append('archivo', documento.archivo);
            if (documento.id_empleado) formData.append('id_empleado', documento.id_empleado.toString());
            if (documento.id_cliente) formData.append('id_cliente', documento.id_cliente.toString());
            if (documento.id_vehiculo) formData.append('id_vehiculo', documento.id_vehiculo.toString());
            if (documento.id_transaccion) formData.append('id_transaccion', documento.id_transaccion.toString());

            const response = await axios.post<{ data: Documento }>(this.baseUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error al crear documento:', error);
            throw error;
        }
    }

    async actualizarDocumento(id: number, documento: UpdateDocumentoDto): Promise<Documento> {
        try {
            const formData = new FormData();
            if (documento.nombre) formData.append('nombre', documento.nombre);
            if (documento.tipo) formData.append('tipo', documento.tipo);
            if (documento.archivo) formData.append('archivo', documento.archivo);
            if (documento.estado) formData.append('estado', documento.estado);

            const response = await axios.put<{ data: Documento }>(`${this.baseUrl}/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.data;
        } catch (error) {
            console.error(`Error al actualizar documento ${id}:`, error);
            throw error;
        }
    }

    async eliminarDocumento(id: number): Promise<void> {
        try {
            await axios.delete(`${this.baseUrl}/${id}`);
        } catch (error) {
            console.error(`Error al eliminar documento ${id}:`, error);
            throw error;
        }
    }

    async generarCompraVentaPdf(idTransaccion: number): Promise<GenerarPdfResponse> {
        try {
            const response = await axios.post<{ data: GenerarPdfResponse }>(
                `${this.baseUrl}/generar-compraventa/${idTransaccion}`
            );
            return response.data.data;
        } catch (error) {
            console.error(`Error al generar PDF de compraventa para transacción ${idTransaccion}:`, error);
            throw error;
        }
    }

    async escanearDocumentos(idTransaccion: number, archivos: File[]): Promise<Documento[]> {
        try {
            const formData = new FormData();
            archivos.forEach((archivo, index) => {
                formData.append(`archivos[${index}]`, archivo);
            });
            formData.append('id_transaccion', idTransaccion.toString());

            const response = await axios.post<{ data: Documento[] }>(
                `${this.baseUrl}/escanear/${idTransaccion}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data.data;
        } catch (error) {
            console.error(`Error al escanear documentos para transacción ${idTransaccion}:`, error);
            throw error;
        }
    }

    async validarFirma(idDocumento: number): Promise<boolean> {
        try {
            const response = await axios.post<{ data: { valida: boolean } }>(
                `${this.baseUrl}/validar-firma/${idDocumento}`
            );
            return response.data.data.valida;
        } catch (error) {
            console.error(`Error al validar firma del documento ${idDocumento}:`, error);
            throw error;
        }
    }
}

export const documentoService = new DocumentoService();
export default documentoService;