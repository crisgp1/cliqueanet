import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Eye } from 'lucide-react';

interface ViewDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: number;
}

export function ViewDocumentsModal({ isOpen, onClose, transactionId }: ViewDocumentsModalProps) {
  const handleDownload = () => {
    // Mock download functionality
    const blob = new Blob(['Mock document content'], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documentos_transaccion_${transactionId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleView = () => {
    // Mock view functionality - in a real app, this would open the document in a new tab
    window.open(`#/view-document/${transactionId}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Documentos de la Transacción</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar Documentos
            </Button>

            <Button
              className="w-full"
              variant="outline"
              onClick={handleView}
            >
              <Eye className="mr-2 h-4 w-4" />
              Visualizar Documentos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}