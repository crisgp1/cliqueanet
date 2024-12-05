import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { FileText, Scan, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

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

  const handleGeneratePdf = () => {
    if (pdfAttempts < 3) {
      console.log('Generating PDF for transaction:', transactionId);
      const blob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compraventa_${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setPdfAttempts(prev => prev + 1);
    }
  };

  const handleScanDocuments = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setShowSignatureConfirm(true);
    }, 2000);
  };

  const handleSignatureConfirm = (isValid: boolean) => {
    if (isValid) {
      setShowSignatureConfirm(false);
      setIsUploading(true);
      // Mock upload process
      setTimeout(() => {
        setIsUploading(false);
        setShowSuccess(true);
        if (onUpdateStatus) {
          onUpdateStatus(transactionId);
        }
        // Close modal after showing success
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 1500);
      }, 2000);
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
              <p className="text-sm text-gray-500">Subiendo documentos...</p>
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