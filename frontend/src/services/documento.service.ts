import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

export type TipoDocumentoEmpleado = 
  'identificacion' |
  'comprobante_domicilio' |
  'cv' |
  'contrato_laboral' |
  'certificaciones' |
  'titulo_profesional' |
  'otro';

export type TipoDocumentoVehiculo = 
  'factura_original' |
  'tarjeta_circulacion' |
  'pedimento' |
  'verificacion' |
  'poliza_seguro' |
  'fotos' |
  'otro';

export type TipoDocumentoTransaccion = 
  'contrato_compraventa' |
  'pagare' |
  'comprobante_pago' |
  'factura' |
  'carta_responsiva' |
  'otro';

export type EntidadOrigen = 'cliente' | 'empleado' | 'vehiculo' | 'transaccion' | 'general';

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
    estado: 'pendiente' | 'aprobado' | 'rechazado';
    nombre_archivo_original?: string;
    mime_type?: string;
    tamanio_archivo?: number;
    hash_archivo?: string;
    entidad_origen: EntidadOrigen;
    tipo_documento_empleado?: TipoDocumentoEmpleado;
    tipo_documento_vehiculo?: TipoDocumentoVehiculo;
    tipo_documento_transaccion?: TipoDocumentoTransaccion;
}

export interface CreateDocumentoDto {
    nombre: string;
    tipo: string;
    archivo: File;
    id_empleado?: number;
    id_cliente?: number;
    id_vehiculo?: number;
    id_transaccion?: number;
    descripcion?: string;
    tipo_documento_empleado?: TipoDocumentoEmpleado;
    tipo_documento_vehiculo?: TipoDocumentoVehiculo;
    tipo_documento_transaccion?: TipoDocumentoTransaccion;
}

export interface UpdateDocumentoDto {
    nombre?: string;
    tipo?: string;
    archivo?: File;
    estado?: 'pendiente' | 'aprobado' | 'rechazado';
    descripcion?: string;
    tipo_documento_empleado?: TipoDocumentoEmpleado;
    tipo_documento_vehiculo?: TipoDocumentoVehiculo;
    tipo_documento_transaccion?: TipoDocumentoTransaccion;
}

export interface DocumentosResponse {
    documentosPendientes: boolean;
    documentos: Documento[];
}

export interface GenerarPdfResponse {
    url: string;
    filename: string;
}

export interface VerificarIntegridadResponse {
    integridadVerificada: boolean;
    hashOriginal: string;
    hashActual: string;
}

class DocumentoService {
    private baseUrl = `${API_BASE_URL}/documentos`;

    private getFullUrl(url: string): string {
        if (url.startsWith('http')) {
            return url;
        }
        return `${API_BASE_URL}${url}`;
    }

    private processDocumento(documento: Documento): Documento {
        return {
            ...documento,
            url: this.getFullUrl(documento.url)
        };
    }

    private processDocumentos(documentos: Documento[]): Documento[] {
        return documentos.map(doc => this.processDocumento(doc));
    }

    async obtenerDocumentos(): Promise<Documento[]> {
        try {
            const response = await axios.get<{ data: Documento[] }>(this.baseUrl); 
            return this.processDocumentos(response.data.data);
        } catch (error) {
            console.error('Error al obtener documentos:', error);
            throw error;
        }
    }

    async obtenerDocumentoPorId(id: number): Promise<Documento> {
        try {
            const response = await axios.get<{ data: Documento }>(`${this.baseUrl}/${id}`);
            return this.processDocumento(response.data.data);
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
            return {
                ...response.data.data,
                documentos: this.processDocumentos(response.data.data.documentos)
            };
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
            return {
                ...response.data.data,
                documentos: this.processDocumentos(response.data.data.documentos)
            };
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
            formData.append('file', documento.archivo);
            if (documento.id_empleado) {
                formData.append('id_empleado', documento.id_empleado.toString());
                if (documento.tipo_documento_empleado) {
                    formData.append('tipo_documento_empleado', documento.tipo_documento_empleado);
                }
            }
            if (documento.id_cliente) formData.append('id_cliente', documento.id_cliente.toString());
            if (documento.id_vehiculo) {
                formData.append('id_vehiculo', documento.id_vehiculo.toString());
                if (documento.tipo_documento_vehiculo) {
                    formData.append('tipo_documento_vehiculo', documento.tipo_documento_vehiculo);
                }
            }
            if (documento.id_transaccion) {
                formData.append('id_transaccion', documento.id_transaccion.toString());
                if (documento.tipo_documento_transaccion) {
                    formData.append('tipo_documento_transaccion', documento.tipo_documento_transaccion);
                }
            }
            if (documento.descripcion) formData.append('descripcion', documento.descripcion);

            const response = await axios.post<{ data: Documento }>(this.baseUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return this.processDocumento(response.data.data);
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
            if (documento.archivo) formData.append('file', documento.archivo);
            if (documento.estado) formData.append('estado', documento.estado);
            if (documento.descripcion) formData.append('descripcion', documento.descripcion);
            if (documento.tipo_documento_empleado) {
                formData.append('tipo_documento_empleado', documento.tipo_documento_empleado);
            }
            if (documento.tipo_documento_vehiculo) {
                formData.append('tipo_documento_vehiculo', documento.tipo_documento_vehiculo);
            }
            if (documento.tipo_documento_transaccion) {
                formData.append('tipo_documento_transaccion', documento.tipo_documento_transaccion);
            }

            const response = await axios.put<{ data: Documento }>(`${this.baseUrl}/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return this.processDocumento(response.data.data);
        } catch (error) {
            console.error(`Error al actualizar documento ${id}:`, error);
            throw error;
        }
    }

    async aprobarDocumento(id: number, idUsuario: number, comentario?: string): Promise<Documento> {
        try {
            const response = await axios.post<{ data: Documento }>(`${this.baseUrl}/${id}/aprobar`, {
                idUsuario,
                comentario
            });
            return this.processDocumento(response.data.data);
        } catch (error) {
            console.error(`Error al aprobar documento ${id}:`, error);
            throw error;
        }
    }

    async rechazarDocumento(id: number, idUsuario: number, comentario?: string): Promise<Documento> {
        try {
            const response = await axios.post<{ data: Documento }>(`${this.baseUrl}/${id}/rechazar`, {
                idUsuario,
                comentario
            });
            return this.processDocumento(response.data.data);
        } catch (error) {
            console.error(`Error al rechazar documento ${id}:`, error);
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

    async verificarIntegridad(id: number): Promise<VerificarIntegridadResponse> {
        try {
            const response = await axios.get<{ data: VerificarIntegridadResponse }>(
                `${this.baseUrl}/${id}/verificar-integridad`
            );
            return response.data.data;
        } catch (error) {
            console.error(`Error al verificar integridad del documento ${id}:`, error);
            throw error;
        }
    }

    async generarCompraVentaPdf(idTransaccion: number): Promise<GenerarPdfResponse> {
        try {
            const response = await axios.post<{ data: GenerarPdfResponse }>(
                `${this.baseUrl}/generar-compraventa/${idTransaccion}`
            );
            return {
                ...response.data.data,
                url: this.getFullUrl(response.data.data.url)
            };
        } catch (error) {
            console.error(`Error al generar PDF de compraventa para transacción ${idTransaccion}:`, error);
            throw error;
        }
    }

    async escanearDocumentos(idTransaccion: number, archivos: File[]): Promise<Documento[]> {
        try {
            const formData = new FormData();
            archivos.forEach((archivo, index) => {
                formData.append(`file[${index}]`, archivo);
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
            return this.processDocumentos(response.data.data);
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