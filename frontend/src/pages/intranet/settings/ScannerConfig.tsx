import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { toast } from '../../../components/ui/use-toast';
import { scannerService } from '../../../services/scanner.service';

interface ScannerStatus {
  status: string;
  message?: string;
}

interface ScannerConfig {
  scannerIp: string;
  snmpCommunity: string;
  uploadPath: string;
}

export const ScannerConfig = () => {
  const [status, setStatus] = useState<ScannerStatus>({ status: 'Desconocido' });
  const [config, setConfig] = useState<ScannerConfig>({
    scannerIp: '',
    snmpCommunity: '',
    uploadPath: ''
  });
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfig();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadConfig = async () => {
    try {
      const response = await scannerService.configure();
      setConfig(response);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la configuración del escáner',
        variant: 'destructive'
      });
    }
  };

  const checkStatus = async () => {
    try {
      const response = await scannerService.getStatus();
      setStatus(response);
    } catch (error) {
      setStatus({ status: 'ERROR', message: 'No se pudo obtener el estado del escáner' });
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const response = await scannerService.testConnection();
      toast({
        title: response.connected ? 'Conexión exitosa' : 'Error de conexión',
        description: response.message,
        variant: response.connected ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo probar la conexión',
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await scannerService.configure();
      toast({
        title: 'Configuración guardada',
        description: 'La configuración del escáner se ha actualizado correctamente',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
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

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configuración del Escáner</h1>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Estado del Escáner</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${getStatusColor()}`}>
                Estado: {status.status}
              </p>
              {status.message && (
                <p className="text-sm text-gray-500">{status.message}</p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? 'Probando...' : 'Probar Conexión'}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Configuración de Red</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Dirección IP del Escáner
              </label>
              <Input
                type="text"
                value={config.scannerIp}
                onChange={(e) => setConfig({ ...config, scannerIp: e.target.value })}
                placeholder="192.168.1.100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Comunidad SNMP
              </label>
              <Input
                type="text"
                value={config.snmpCommunity}
                onChange={(e) => setConfig({ ...config, snmpCommunity: e.target.value })}
                placeholder="public"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Ruta de Guardado
              </label>
              <Input
                type="text"
                value={config.uploadPath}
                onChange={(e) => setConfig({ ...config, uploadPath: e.target.value })}
                placeholder="/uploads/scanner"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </Card>
              
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Información del Dispositivo</h2>
          <div className="space-y-2">
            <p><strong>Modelo:</strong> Brother ADS-1700W</p>
            <p><strong>Protocolo:</strong> SNMP v1/v2c</p>
            <p><strong>Puerto:</strong> 161 (SNMP)</p>
            <p><strong>Formatos Soportados:</strong> PDF, JPEG, PNG</p>
            <p><strong>Resoluciones:</strong> 200 DPI, 300 DPI, 600 DPI</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ScannerConfig;