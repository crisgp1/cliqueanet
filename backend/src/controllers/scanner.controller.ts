import { Request, Response } from 'express';
import ScannerService from '../services/scanner.service';
import { ScanOptions } from '../config/scanner.config';
import * as fs from 'fs';
import * as path from 'path';

class ScannerController {
  private static instance: ScannerController;
  private scannerService: ScannerService;
  private configPath: string;

  private constructor() {
    this.scannerService = ScannerService.getInstance();
    this.configPath = path.join(process.cwd(), 'backend/src/config/scanner.config.ts');
  }

  public static getInstance(): ScannerController {
    if (!ScannerController.instance) {
      ScannerController.instance = new ScannerController();
    }
    return ScannerController.instance;
  }

  public async getStatus(_req: Request, res: Response): Promise<void> {
    try {
      const status = await this.scannerService.getScannerStatus();
      res.json({ status });
    } catch (error) {
      console.error('Error al obtener estado del escáner:', error);
      res.status(500).json({ 
        error: 'Error al obtener estado del escáner',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  public async startScan(req: Request, res: Response): Promise<void> {
    try {
      const options: ScanOptions = {
        resolution: req.body.resolution || 300,
        colorMode: req.body.colorMode || 'Color',
        paperSize: req.body.paperSize || 'A4',
        outputFormat: req.body.outputFormat || 'PDF',
        duplex: req.body.duplex || false,
        brightness: req.body.brightness || 0,
        contrast: req.body.contrast || 0,
        documentId: req.body.documentId,
        clienteId: req.body.clienteId,
        tipoDocumento: req.body.tipoDocumento
      };

      const success = await this.scannerService.startScan(options);
      
      if (success) {
        res.json({ message: 'Escaneo iniciado correctamente' });
      } else {
        res.status(500).json({ error: 'Error al iniciar el escaneo' });
      }
    } catch (error) {
      console.error('Error al iniciar escaneo:', error);
      res.status(500).json({ 
        error: 'Error al iniciar escaneo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  public async configure(req: Request, res: Response): Promise<void> {
    try {
      const currentConfig = {
        scannerIp: process.env.SCANNER_IP || '192.168.100.200',
        snmpCommunity: process.env.SNMP_COMMUNITY || 'public',
        uploadPath: process.env.SCANNER_UPLOAD_PATH || '/home/ubuntu/cliqueanet/backend/uploads/scanner'
      };

      if (req.method === 'GET') {
        res.json(currentConfig);
        return;
      }

      const newConfig = {
        scannerIp: req.body.scannerIp || currentConfig.scannerIp,
        snmpCommunity: req.body.snmpCommunity || currentConfig.snmpCommunity,
        uploadPath: req.body.uploadPath || currentConfig.uploadPath
      };

      // Actualizar variables de entorno
      process.env.SCANNER_IP = newConfig.scannerIp;
      process.env.SNMP_COMMUNITY = newConfig.snmpCommunity;
      process.env.SCANNER_UPLOAD_PATH = newConfig.uploadPath;

      // Asegurarse de que el directorio de uploads existe
      if (!fs.existsSync(newConfig.uploadPath)) {
        fs.mkdirSync(newConfig.uploadPath, { recursive: true });
      }

      // Reinicializar el servicio del escáner con la nueva configuración
      await this.scannerService.reinitialize(newConfig);

      res.json({
        message: 'Configuración actualizada correctamente',
        config: newConfig
      });
    } catch (error) {
      console.error('Error al configurar escáner:', error);
      res.status(500).json({ 
        error: 'Error al configurar escáner',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  public async testConnection(_req: Request, res: Response): Promise<void> {
    try {
      const status = await this.scannerService.getScannerStatus();
      if (status === 'READY' || status === 'BUSY') {
        res.json({ 
          connected: true,
          status,
          message: 'Conexión exitosa con el escáner'
        });
      } else {
        res.status(503).json({ 
          connected: false,
          status,
          message: 'El escáner no está disponible'
        });
      }
    } catch (error) {
      console.error('Error al probar conexión:', error);
      res.status(500).json({ 
        connected: false,
        error: 'Error al probar conexión con el escáner',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

export default ScannerController;