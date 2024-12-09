import React from 'react';
import { BaseModal } from "../ui/base-modal";
import { Button } from "../ui/button";
import { FaDownload, FaEye, FaFileAlt } from 'react-icons/fa';

interface Document {
  id: number;
  type: string;
  name: string;
  date: string;
}

interface ViewEmployeeDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id_empleado?: number;
    nombre: string;
    documentos?: Document[];
  };
}

// Mock data para documentos
const mockDocuments: Document[] = [
  { id: 1, type: 'cv', name: 'Curriculum Vitae', date: '2024-01-15' },
  { id: 2, type: 'ine', name: 'Identificación INE', date: '2024-01-15' },
  { id: 3, type: 'curp', name: 'CURP', date: '2024-01-15' },
  { id: 4, type: 'comprobante_domicilio', name: 'Comprobante de Domicilio', date: '2024-01-15' },
];

export function ViewEmployeeDocumentsModal({ isOpen, onClose, employee }: ViewEmployeeDocumentsModalProps) {
  const handleDownload = (document: Document) => {
    // Aquí se implementará la lógica de descarga
    console.log('Descargando documento:', document);
  };

  const handleView = (document: Document) => {
    // Aquí se implementará la lógica de visualización
    console.log('Visualizando documento:', document);
  };

  const modalContent = (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <FaFileAlt className="text-gray-500 text-xl" />
          <div>
            <h3 className="font-semibold">Documentos de {employee.nombre}</h3>
            {employee.id_empleado && (
              <p className="text-sm text-gray-500">ID: {employee.id_empleado}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {mockDocuments.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FaFileAlt className="text-gray-400" />
              <div>
                <p className="font-medium">{doc.name}</p>
                <p className="text-sm text-gray-500">
                  Actualizado: {new Date(doc.date).toLocaleDateString()}
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