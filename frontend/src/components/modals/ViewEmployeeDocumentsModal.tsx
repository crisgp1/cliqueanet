import { useState, useEffect } from 'react';
import { BaseModal } from "../ui/base-modal";
import { Button } from "../ui/button";
import { FaDownload, FaEye, FaFileAlt } from 'react-icons/fa';
import { documentoService, Documento } from '../../services/documento.service';
import { IEmpleado } from '../../services/empleado.service';
import { toast } from '../ui/use-toast';
import { Loader2 } from 'lucide-react';

interface ViewEmployeeDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: IEmpleado;
}

export function ViewEmployeeDocumentsModal({ isOpen, onClose, employee }: ViewEmployeeDocumentsModalProps) {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && employee.id) {
      loadDocumentos();
    }
  }, [isOpen, employee.id]);

  const loadDocumentos = async () => {
    try {
      setIsLoading(true);
      if (!employee.id) {
        throw new Error('ID de empleado no válido');
      }
      const response = await documentoService.obtenerDocumentosPorEmpleado(employee.id);
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
    window.open(documento.url, '_blank');
  };

  const getDocumentTypeLabel = (tipo: string) => {
    const tipos = {
      'cv': 'Curriculum Vitae',
      'ine': 'Identificación INE',
      'curp': 'CURP',
      'comprobante_domicilio': 'Comprobante de Domicilio',
      'rfc': 'RFC',
      'acta_nacimiento': 'Acta de Nacimiento',
      'comprobante_estudios': 'Comprobante de Estudios'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const modalContent = (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <FaFileAlt className="text-gray-500 text-xl" />
          <div>
            <h3 className="font-semibold">Documentos de {employee.nombre}</h3>
            {employee.id && (
              <p className="text-sm text-gray-500">ID: {employee.id}</p>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Cargando documentos...</span>
        </div>
      ) : documentos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay documentos disponibles
        </div>
      ) : (
        <div className="space-y-4">
          {documentos.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FaFileAlt className="text-gray-400" />
                <div>
                  <p className="font-medium">{getDocumentTypeLabel(doc.tipo)}</p>
                  <p className="text-sm text-gray-500">
                    Actualizado: {new Date(doc.fecha_subida).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => handleView(doc)}
                >
                  <FaEye className="h-4 w-4" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => handleDownload(doc)}
                >
                  <FaDownload className="h-4 w-4" />
                  Descargar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const modalFooter = (
    <Button variant="outline" onClick={onClose}>
      Cerrar
    </Button>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Documentos del Empleado"
      maxWidth="lg"
      footer={modalFooter}
    >
      {modalContent}
    </BaseModal>
  );
}