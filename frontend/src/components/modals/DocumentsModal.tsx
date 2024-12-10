import { useState, useRef, ChangeEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
import { FileText, Scan, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import documentoService from '../../services/documento.service';
import { toast } from '../../components/ui/use-toast';

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: number;
  onUpdateStatus?: (transactionId: number) => void;
}

export function DocumentsModal({ 
  isOpen, 
  onClose, 
  transactionId,
  onUpdateStatus 
}: DocumentsModalProps) {
  const [pdfAttempts, setPdfAttempts] = useState(0);
  const [showSignatureConfirm, setShowSignatureConfirm] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentDocumentId, setCurrentDocumentId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGeneratePdf = async () => {
    if (pdfAttempts < 3) {
      try {
        const response = await documentoService.generarCompraVentaPdf(transactionId);
        const link = document.createElement('a');
        link.href = response.url;
        link.download = response.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setPdfAttempts(prev => prev + 1);
      } catch (error) {
        console.error('Error al generar PDF:', error);
        toast({
          title: "Error",
          description: "No se pudo generar el PDF",
          variant: "destructive"
        });
      }
    }
  };

  const handleScanDocuments = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    try {
      const documentos = await documentoService.escanearDocumentos(transactionId, Array.from(files));
      if (documentos.length > 0) {
        setCurrentDocumentId(documentos[0].id);
        setShowSignatureConfirm(true);
      }
    } catch (error) {
      console.error('Error al escanear documentos:', error);
      toast({
        title: "Error",
        description: "No se pudieron procesar los documentos",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSignatureConfirm = async (isValid: boolean) => {
    if (isValid && currentDocumentId) {
      setShowSignatureConfirm(false);
      setIsUploading(true);
      try {
        const isValidSignature = await documentoService.validarFirma(currentDocumentId);
        if (isValidSignature) {
          setShowSuccess(true);
          if (onUpdateStatus) {
            onUpdateStatus(transactionId);
          }
          setTimeout(() => {
            setShowSuccess(false);
            onClose();
          }, 1500);
        } else {
          toast({
            title: "Error",
            description: "La firma no es válida",
            variant: "destructive"
          });
          if (pdfAttempts < 3) {
            handleGeneratePdf();
          }
        }
      } catch (error) {
        console.error('Error al validar firma:', error);
        toast({
          title: "Error",
          description: "No se pudo validar la firma",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
      }
    } else {
      setShowSignatureConfirm(false);
      if (pdfAttempts < 3) {
        handleGeneratePdf();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Documentos de la Transacción</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {pdfAttempts >= 3 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              Se ha alcanzado el límite de intentos para generar el PDF
            </Alert>
          )}

          {!isUploading && !showSuccess && (
            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={handleGeneratePdf}
                disabled={pdfAttempts >= 3}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generar Compraventa
                {pdfAttempts > 0 && ` (${pdfAttempts}/3)`}
              </Button>

              <Button
                className="w-full"
                onClick={handleScanDocuments}
                disabled={isScanning}
              >
                <Scan className="mr-2 h-4 w-4" />
                {isScanning ? 'Escaneando...' : 'Escanear Documentos'}
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
            </div>
          )}

          {showSignatureConfirm && (
            <div className="space-y-4 border rounded-lg p-4">
              <p className="text-center font-medium">
                ¿La firma en el documento es correcta?
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="default"
                  onClick={() => handleSignatureConfirm(true)}
                >
                  Sí, Guardar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleSignatureConfirm(false)}
                >
                  No, Generar Nuevo
                </Button>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">Procesando documentos...</p>
            </div>
          )}

          {showSuccess && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <p className="text-sm text-gray-500">¡Documentos guardados exitosamente!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}