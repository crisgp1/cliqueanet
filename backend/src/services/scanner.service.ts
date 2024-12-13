import * as snmp from 'net-snmp';
import * as chokidar from 'chokidar';
import * as path from 'path';
import * as fs from 'fs';
import scannerConfig, { ScannerState, ScanOptions } from '../config/scanner.config';
import { Documento } from '../models/documento.model';

interface ScannerConfig {
  scannerIp: string;
  snmpCommunity: string;
  uploadPath: string;
}

class ScannerService {
  private session: snmp.Session | null = null;
  private watcher: chokidar.FSWatcher | null = null;
  private currentState: ScannerState = 'READY';
  private static instance: ScannerService;

  private constructor() {
    this.initializeSnmpSession();
    this.initializeWatcher();
  }

  public static getInstance(): ScannerService {
    if (!ScannerService.instance) {
      ScannerService.instance = new ScannerService();
    }
    return ScannerService.instance;
  }

  private initializeSnmpSession() {
    try {
      this.session = snmp.createSession(
        scannerConfig.network.scannerIp,
        scannerConfig.network.community,
        {
          port: scannerConfig.network.snmpPort,
          timeout: scannerConfig.network.timeout,
          retries: 1,
          transport: "udp4"
        }
      );

      this.session.on('error', (error: Error) => {
        console.error('Error en sesión SNMP:', error);
        this.currentState = 'ERROR';
      });
    } catch (error) {
      console.error('Error al inicializar sesión SNMP:', error);
      this.currentState = 'ERROR';
    }
  }

  private initializeWatcher() {
    try {
      // Asegurarse de que la carpeta existe
      if (!fs.existsSync(scannerConfig.sharedFolder.basePath)) {
        fs.mkdirSync(scannerConfig.sharedFolder.basePath, { recursive: true });
      }

      this.watcher = chokidar.watch(scannerConfig.sharedFolder.basePath, {
        ignored: /(^|[\/\\])\../, // ignorar archivos ocultos
        persistent: true,
        awaitWriteFinish: {
          stabilityThreshold: 2000,
          pollInterval: 100
        }
      });

      this.watcher
        .on('add', (filePath) => this.handleNewScan(filePath))
        .on('error', (error) => {
          console.error('Error en el watcher:', error);
        });

    } catch (error) {
      console.error('Error al inicializar watcher:', error);
    }
  }

  private async handleNewScan(filePath: string) {
    try {
      const extension = path.extname(filePath).toLowerCase();
      
      // Verificar si la extensión está permitida
      if (!scannerConfig.sharedFolder.allowedExtensions.includes(extension as any)) {
        console.error(`Extensión no permitida: ${extension}`);
        return;
      }

      // Mover el archivo a la carpeta de uploads
      const fileName = path.basename(filePath);
      const newPath = path.join('backend/uploads', fileName);
      
      fs.renameSync(filePath, newPath);

      // Crear registro en la base de datos
      const documento = await Documento.create({
        url: newPath,
        tipoDocumento: 'Otro', // Por defecto, se puede actualizar después
        fechaSubida: new Date(),
        estado: 'pendiente',
        permisosAcceso: 'privado'
      });

      console.log(`Documento escaneado procesado: ${documento.id}`);

    } catch (error) {
      console.error('Error al procesar documento escaneado:', error);
    }
  }

  public async getScannerStatus(): Promise<ScannerState> {
    return new Promise((resolve, reject) => {
      if (!this.session) {
        reject(new Error('Sesión SNMP no inicializada'));
        return;
      }

      this.session.get([scannerConfig.snmpOids.deviceStatus], (error: Error | null, varbinds: snmp.VarBind[]) => {
        if (error) {
          console.error('Error al obtener estado del escáner:', error);
          this.currentState = 'ERROR';
          reject(error);
        } else {
          const status = varbinds[0]?.value?.toString();
          this.currentState = this.mapSnmpStatusToState(status);
          resolve(this.currentState);
        }
      });
    });
  }

  private mapSnmpStatusToState(status: string | undefined): ScannerState {
    // Mapeo específico para Brother ADS-1700W
    switch (status) {
      case '1': return 'READY';
      case '2': return 'BUSY';
      case '3': return 'ERROR';
      case '4': return 'PAPER_JAM';
      default: return 'OFFLINE';
    }
  }

  public async startScan(options: ScanOptions = {}): Promise<boolean> {
    try {
      if (this.currentState !== 'READY') {
        throw new Error(`Escáner no está listo. Estado actual: ${this.currentState}`);
      }

      // Configurar opciones de escaneo vía SNMP
      await this.configureScanOptions(options);

      // Iniciar el escaneo
      // Aquí iría la lógica específica para iniciar el escaneo vía SNMP
      // Por ahora, simulamos que el escaneo fue exitoso
      console.log('Iniciando escaneo con opciones:', options);
      
      return true;
    } catch (error) {
      console.error('Error al iniciar escaneo:', error);
      return false;
    }
  }

  private async configureScanOptions(options: ScanOptions): Promise<void> {
    if (!this.session) {
      throw new Error('Sesión SNMP no inicializada');
    }

    // Aquí iría la configuración específica del escáner vía SNMP
    // Por ejemplo, configurar resolución, modo de color, etc.
    console.log('Configurando opciones de escaneo:', options);
  }

  public async disconnect(): Promise<void> {
    if (this.session) {
      this.session.close();
      this.session = null;
    }
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
  }

  public async reinitialize(config: ScannerConfig): Promise<void> {
    // Desconectar las conexiones existentes
    await this.disconnect();

    // Actualizar la configuración
    scannerConfig.network.scannerIp = config.scannerIp;
    scannerConfig.network.community = config.snmpCommunity;
    scannerConfig.sharedFolder.basePath = config.uploadPath;

    // Reinicializar las conexiones
    this.initializeSnmpSession();
    this.initializeWatcher();
  }
}

export default ScannerService;