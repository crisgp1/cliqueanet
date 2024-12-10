import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Download, Eye, Loader2 } from 'lucide-react';
import documentoService, { Documento } from '../../services/documento.service';
import { toast } from '../../components/ui/use-toast';

interface ViewDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: number;
}

export function ViewDocumentsModal({ isOpen, onClose, transactionId }: ViewDocumentsModalProps) {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadDocumentos();
    }
  }, [isOpen, transactionId]);

  const loadDocumentos = async () => {
    try {
      const response = await documentoService.obtenerDocumentosPorTransaccion(transactionId);
      setDocumentos(response.documentos);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (documento: Documento) => {
    try {
      // Asumimos que el documento.url es una URL válida para descargar
      const response = await fetch(documento.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documento.nombre;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar documento:', error);
      toast({
        title: "Error",
        description: "No se pudo descargar el documento",
        variant: "destructive"
      });
    }
  };

  const handleView = (documento: Documento) => {
    // Abre el documento en una nueva pestaña
    window.open(documento.url, '_blank');
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-sm text-gray-500">Cargando documentos...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Documentos de la Transacción</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {documentos.length === 0 ? (
            <p className="text-center text-gray-500">No hay documentos disponibles</p>
          ) : (
            <div className="space-y-4">
              {documentos.map((documento) => (
                <div key={documento.id} className="border rounded-lg p-4 space-y-2">
                  <p className="font-medium">{documento.nombre}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(documento.fecha_creacion).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleDownload(documento)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </Button>
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => handleView(documento)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}