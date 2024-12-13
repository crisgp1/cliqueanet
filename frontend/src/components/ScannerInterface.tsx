import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select } from './ui/select';
import { Input } from './ui/input';
import { scannerService } from '../services/scanner.service';
import { useToast } from './ui/use-toast';
import { TipoDocumento, VALIDACION_DOCUMENTOS } from '../types/documento.types';

interface ScannerInterfaceProps {
  onDocumentScanned?: (documentId: number) => void;
  clienteId?: number;
  documentId?: number;
  tipoDocumento?: TipoDocumento;
}

type ColorMode = 'Color' | 'Gris' | 'ByN';
type OutputFormat = 'PDF' | 'JPG' | 'PNG';
type PaperSize = 'A4' | 'Letter' | 'Legal';

interface ScanOptions {
  resolution: number;
  colorMode: ColorMode;
  paperSize: PaperSize;
  outputFormat: OutputFormat;
  duplex: boolean;
  brightness: number;
  contrast: number;
}

export const ScannerInterface: React.FC<ScannerInterfaceProps> = ({
  onDocumentScanned,
  clienteId,
  documentId,
  tipoDocumento = 'Otro'
}) => {
  const [scannerStatus, setScannerStatus] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanOptions, setScanOptions] = useState<ScanOptions>({
    resolution: 300,
    colorMode: 'Color',
    paperSize: 'A4',
    outputFormat: 'PDF',
    duplex: false,
    brightness: 0,
    contrast: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    checkScannerStatus();
    const interval = setInterval(checkScannerStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Validar opciones según el tipo de documento
  useEffect(() => {
    if (tipoDocumento) {
      const validacion = VALIDACION_DOCUMENTOS[tipoDocumento];
      const formatoPermitido = validacion.extensionesPermitidas.includes('.pdf') ? 'PDF' :
                             validacion.extensionesPermitidas.includes('.jpg') ? 'JPG' :
                             'PNG';
      setScanOptions(prev => ({
        ...prev,
        outputFormat: formatoPermitido as OutputFormat
      }));
    }
  }, [tipoDocumento]);

  const checkScannerStatus = async () => {
    try {
      const { status } = await scannerService.getStatus();
      setScannerStatus(status);
    } catch (error) {
      console.error('Error al obtener estado del escáner:', error);
      setScannerStatus('ERROR');
    }
  };

  const handleStartScan = async () => {
    try {
      setIsScanning(true);
      const response = await scannerService.startScan({
        ...scanOptions,
        clienteId,
        documentId,
        tipoDocumento
      });
      
      toast({
        title: 'Escaneo completado',
        description: response.message,
        variant: 'default'
      });

      if (onDocumentScanned && 'documentId' in response) {
        onDocumentScanned(response.documentId);
      }
    } catch (error) {
      console.error('Error al escanear:', error);
      toast({
        title: 'Error al escanear',
        description: 'No se pudo completar el escaneo. Por favor, intente nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleOptionChange = <K extends keyof ScanOptions>(
    option: K,
    value: ScanOptions[K] | string
  ) => {
    setScanOptions(prev => {
      const newValue = option === 'resolution' || option === 'brightness' || option === 'contrast'
        ? parseInt(value as string, 10)
        : value;
      return {
        ...prev,
        [option]: newValue
      };
    });
  };

  const getStatusColor = () => {
    switch (scannerStatus) {
      case 'READY':
        return 'text-green-500';
      case 'BUSY':
        return 'text-yellow-500';
      case 'ERROR':
      case 'OFFLINE':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const validacion = VALIDACION_DOCUMENTOS[tipoDocumento];

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Escáner Brother ADS-1700W</h3>
        <span className={`font-medium ${getStatusColor()}`}>
          Estado: {scannerStatus || 'Desconocido'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Resolución (DPI)</label>
          <Select
            value={scanOptions.resolution.toString()}
            onValueChange={(value) => handleOptionChange('resolution', value)}
          >
            <option value="200">200 DPI</option>
            <option value="300">300 DPI</option>
            <option value="600">600 DPI</option>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Modo de Color</label>
          <Select
            value={scanOptions.colorMode}
            onValueChange={(value) => handleOptionChange('colorMode', value as ColorMode)}
          >
            <option value="Color">Color</option>
            <option value="Gris">Escala de Grises</option>
            <option value="ByN">Blanco y Negro</option>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Formato de Salida</label>
          <Select
            value={scanOptions.outputFormat}
            onValueChange={(value) => handleOptionChange('outputFormat', value as OutputFormat)}
            disabled={tipoDocumento !== 'Otro'}
          >
            {validacion.extensionesPermitidas.includes('.pdf') && <option value="PDF">PDF</option>}
            {validacion.extensionesPermitidas.includes('.jpg') && <option value="JPG">JPG</option>}
            {validacion.extensionesPermitidas.includes('.png') && <option value="PNG">PNG</option>}
          </Select>
          {tipoDocumento !== 'Otro' && (
            <p className="text-xs text-gray-500">
              Formato fijo según tipo de documento
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tamaño de Papel</label>
          <Select
            value={scanOptions.paperSize}
            onValueChange={(value) => handleOptionChange('paperSize', value as PaperSize)}
          >
            <option value="A4">A4</option>
            <option value="Letter">Carta</option>
            <option value="Legal">Legal</option>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Brillo</label>
          <Input
            type="range"
            min="-50"
            max="50"
            value={scanOptions.brightness}
            onChange={(e) => handleOptionChange('brightness', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Contraste</label>
          <Input
            type="range"
            min="-50"
            max="50"
            value={scanOptions.contrast}
            onChange={(e) => handleOptionChange('contrast', e.target.value)}
          />
        </div>
      </div>

      {validacion.tamañoMaximoMB && (
        <p className="text-sm text-gray-500">
          Tamaño máximo permitido: {validacion.tamañoMaximoMB}MB
        </p>
      )}

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => scannerService.testConnection()}
        >
          Probar Conexión
        </Button>
        <Button
          onClick={handleStartScan}
          disabled={isScanning || scannerStatus !== 'READY'}
        >
          {isScanning ? 'Escaneando...' : 'Iniciar Escaneo'}
        </Button>
      </div>
    </Card>
  );
};

export default ScannerInterface;