export type ScannerState = 'READY' | 'BUSY' | 'ERROR' | 'OFFLINE' | 'PAPER_JAM';

export interface ScanOptions {
  resolution?: number;
  colorMode?: 'Color' | 'Gris' | 'ByN';
  paperSize?: string;
  outputFormat?: 'PDF' | 'JPG' | 'PNG';
  duplex?: boolean;
  brightness?: number;
  contrast?: number;
  documentId?: number;
  clienteId?: number;
  tipoDocumento?: string;
}

const scannerConfig = {
  network: {
    // Configuración de red para Brother ADS-1700W
    scannerIp: process.env.SCANNER_IP || '192.168.100.200', // Actualizar con la IP real del escáner
    community: process.env.SNMP_COMMUNITY || 'public',
    snmpPort: 161,
    timeout: 5000,
    retries: 1
  },
  snmpOids: {
    // OIDs específicos para Brother ADS-1700W
    deviceStatus: '1.3.6.1.2.1.25.3.2.1.5.1',
    deviceName: '1.3.6.1.2.1.25.3.2.1.3.1',
    scannerStatus: '1.3.6.1.2.1.25.3.5.1.1.1',
    paperJam: '1.3.6.1.2.1.25.3.5.1.2.1'
  },
  sharedFolder: {
    // Configuración de la carpeta compartida
    basePath: process.env.SCANNER_UPLOAD_PATH || '/home/ubuntu/cliqueanet/backend/uploads/scanner',
    allowedExtensions: ['.pdf', '.jpg', '.png'] as const
  },
  defaultScanOptions: {
    resolution: 300,
    colorMode: 'Color' as const,
    paperSize: 'A4',
    outputFormat: 'PDF' as const,
    duplex: false,
    brightness: 0,
    contrast: 0
  }
};

export default scannerConfig;