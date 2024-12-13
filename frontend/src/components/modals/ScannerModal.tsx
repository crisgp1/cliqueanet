import React, { useState } from 'react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import { toast } from '../ui/use-toast';
import { ScannerInterface } from '../ScannerInterface';
import { TipoDocumento, VALIDACION_DOCUMENTOS } from '../../types/documento.types';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteId?: number;
  documentId?: number;
  onDocumentScanned?: (documentId: number) => void;
  initialTipoDocumento?: TipoDocumento;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  clienteId,
  documentId,
  onDocumentScanned,
  initialTipoDocumento
}) => {
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>(
    initialTipoDocumento || 'Otro'
  );

  const handleDocumentScanned = (newDocumentId: number) => {
    toast({
      title: 'Documento escaneado',
      description: 'El documento se ha escaneado y guardado correctamente.',
      variant: 'default'
    });

    if (onDocumentScanned) {
      onDocumentScanned(newDocumentId);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Escanear Documento</h2>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Tipo de Documento
            </label>
            <Select
              value={tipoDocumento}
              onValueChange={(value: TipoDocumento) => setTipoDocumento(value)}
            >
              {Object.keys(VALIDACION_DOCUMENTOS).map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </Select>
            {tipoDocumento !== 'Otro' && (
              <div className="mt-2 text-sm text-gray-500">
                <p>Requisitos del documento:</p>
                <ul className="list-disc list-inside">
                  <li>
                    Formatos permitidos:{' '}
                    {VALIDACION_DOCUMENTOS[tipoDocumento].extensionesPermitidas.join(', ')}
                  </li>
                  <li>
                    Tamaño máximo: {VALIDACION_DOCUMENTOS[tipoDocumento].tamañoMaximoMB}MB
                  </li>
                  {VALIDACION_DOCUMENTOS[tipoDocumento].vigenciaRequerida && (
                    <li>
                      Vigencia máxima:{' '}
                      {VALIDACION_DOCUMENTOS[tipoDocumento].antiguedadMaximaMeses} meses
                    </li>
                  )}
                  {VALIDACION_DOCUMENTOS[tipoDocumento].requiereVerificacion && (
                    <li>Requiere verificación</li>
                  )}
                  {VALIDACION_DOCUMENTOS[tipoDocumento].requiereFirma && (
                    <li>Requiere firma</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <ScannerInterface
            clienteId={clienteId}
            documentId={documentId}
            tipoDocumento={tipoDocumento}
            onDocumentScanned={handleDocumentScanned}
          />

          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ScannerModal;