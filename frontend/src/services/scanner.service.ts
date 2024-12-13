import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';
import { TipoDocumento } from '../types/documento.types';

interface ScanResponse {
  message: string;
  documentId?: number;
  url?: string;
}

interface ScannerConfig {
  scannerIp: string;
  snmpCommunity: string;
  uploadPath: string;
}

interface ScanOptions {
  resolution?: number;
  colorMode?: 'Color' | 'Gris' | 'ByN';
  paperSize?: string;
  outputFormat?: 'PDF' | 'JPG' | 'PNG';
  duplex?: boolean;
  brightness?: number;
  contrast?: number;
  documentId?: number;
  clienteId?: number;
  tipoDocumento?: TipoDocumento;
}

interface ScannerStatus {
  status: 'READY' | 'BUSY' | 'ERROR' | 'OFFLINE' | 'PAPER_JAM';
  message?: string;
}

interface ConnectionTestResult {
  connected: boolean;
  status: string;
  message: string;
}

export class ScannerService {
  private static instance: ScannerService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = `${API_BASE_URL}/scanner`;
  }

  public static getInstance(): ScannerService {
    if (!ScannerService.instance) {
      ScannerService.instance = new ScannerService();
    }
    return ScannerService.instance;
  }

  public async getStatus(): Promise<ScannerStatus> {
    try {
      const response = await axios.get<ScannerStatus>(`${this.baseUrl}/status`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async startScan(options: ScanOptions): Promise<ScanResponse> {
    try {
      const response = await axios.post<ScanResponse>(`${this.baseUrl}/scan`, options);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async configure(): Promise<ScannerConfig> {
    try {
      const response = await axios.post<ScannerConfig>(`${this.baseUrl}/configure`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async testConnection(): Promise<ConnectionTestResult> {
    try {
      const response = await axios.get<ConnectionTestResult>(`${this.baseUrl}/test-connection`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async scanToDocument(options: {
    documentId: number;
    clienteId: number;
    tipoDocumento: TipoDocumento;
    resolution?: number;
    colorMode?: 'Color' | 'Gris' | 'ByN';
  }): Promise<ScanResponse> {
    try {
      const response = await axios.post<ScanResponse>(`${this.baseUrl}/scan`, {
        ...options,
        outputFormat: 'PDF',
        paperSize: 'A4',
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async isReady(): Promise<boolean> {
    try {
      const { status } = await this.getStatus();
      return status === 'READY';
    } catch {
      return false;
    }
  }

  public getDocumentUrl(documentId: number): string {
    return `/uploads/scanner/${documentId}`;
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data.message || 'Error en la solicitud del escáner';
      return new Error(message);
    } else if (error.request) {
      return new Error('No se recibió respuesta del servidor');
    } else {
      return new Error('Error al procesar la solicitud del escáner');
    }
  }
}

export const scannerService = ScannerService.getInstance();