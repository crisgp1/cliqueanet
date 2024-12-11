import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from 'lucide-react';

interface DocumentUpload {
  file: File;
  idTipoIdentificacion: string;
  descripcion: string;
}

interface DocumentUploadSectionProps {
  tiposIdentificacion: Array<{
    id: number;
    nombre: string;
    descripcion?: string;
  }>;
  onDocumentsChange: (documents: DocumentUpload[]) => void;
}

export function DocumentUploadSection({ 
  tiposIdentificacion,
  onDocumentsChange 
}: DocumentUploadSectionProps) {
  const [documents, setDocuments] = useState<DocumentUpload[]>([{
    file: null as unknown as File,
    idTipoIdentificacion: '',
    descripcion: ''
  }]);

  const handleAddDocument = () => {
    setDocuments([...documents, {
      file: null as unknown as File,
      idTipoIdentificacion: '',
      descripcion: ''
    }]);
  };

  const handleRemoveDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    setDocuments(newDocuments);
    onDocumentsChange(newDocuments);
  };

  const handleDocumentChange = (index: number, field: keyof DocumentUpload, value: any) => {
    const newDocuments = documents.map((doc, i) => {
      if (i === index) {
        return { ...doc, [field]: value };
      }
      return doc;
    });
    setDocuments(newDocuments);
    onDocumentsChange(newDocuments);
  };

  return (
    <div className="space-y-4">
      <div className="font-medium text-sm mb-2">Documentos</div>
      {documents.map((doc, index) => (
        <div key={index} className="flex gap-4 items-start border p-4 rounded-lg relative">
          {documents.length > 1 && (
            <button
              onClick={() => handleRemoveDocument(index)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              <X size={16} />
            </button>
          )}
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-sm font-medium">
                Tipo de Identificación
              </label>
              <select
                value={doc.idTipoIdentificacion}
                onChange={(e) => handleDocumentChange(index, 'idTipoIdentificacion', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 mt-1"
              >
                <option value="">Seleccione...</option>
                {tiposIdentificacion.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">
                Documento
              </label>
              <Input
                type="file"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleDocumentChange(index, 'file', e.target.files[0]);
                  }
                }}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Descripción
              </label>
              <Input
                value={doc.descripcion}
                onChange={(e) => handleDocumentChange(index, 'descripcion', e.target.value)}
                placeholder="Descripción del documento"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddDocument}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Agregar Documento
      </Button>
    </div>
  );
}