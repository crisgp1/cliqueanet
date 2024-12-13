import { useState, useEffect, ChangeEvent } from 'react';
import { Check, Upload } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

interface DocumentItem {
  id: string;
  name: string;
  required: boolean;
  uploaded: boolean;
  file: File | null;
  description: string;
}

interface DocumentChecklistProps {
  tipoPersona: 'Física' | 'Moral';
  tipoTransaccion?: 'VENTA' | 'CREDITO' | 'CONSIGNACION';
  onDocumentsChange: (documents: { file: File; description: string }[]) => void;
}

const DOCUMENTOS_REQUERIDOS = {
  VENTA: ['Identificación', 'Comprobante de Domicilio', 'Factura', 'Contrato'],
  CREDITO: ['Identificación', 'Comprobante de Domicilio', 'Comprobante de Ingresos', 'Estado de Cuenta'],
  CONSIGNACION: ['Identificación', 'Comprobante de Domicilio', 'Carta Responsiva', 'Contrato']
} as const;

export function DocumentChecklist({ tipoPersona, tipoTransaccion, onDocumentsChange }: DocumentChecklistProps) {
  const getInitialDocuments = (): DocumentItem[] => {
    const commonDocuments = [
      {
        id: 'identificacion',
        name: 'Identificación Oficial',
        required: true,
        uploaded: false,
        file: null,
        description: ''
      },
      {
        id: 'comprobante_domicilio',
        name: 'Comprobante de Domicilio',
        required: true,
        uploaded: false,
        file: null,
        description: ''
      }
    ];

    if (tipoTransaccion) {
      const documentosRequeridos = DOCUMENTOS_REQUERIDOS[tipoTransaccion];
      const additionalDocs: DocumentItem[] = [];

      if (tipoTransaccion === 'VENTA') {
        additionalDocs.push(
          {
            id: 'factura',
            name: 'Factura',
            required: true,
            uploaded: false,
            file: null,
            description: ''
          },
          {
            id: 'contrato_venta',
            name: 'Contrato de Compra-Venta',
            required: true,
            uploaded: false,
            file: null,
            description: ''
          }
        );
      } else if (tipoTransaccion === 'CREDITO') {
        additionalDocs.push(
          {
            id: 'comprobante_ingresos',
            name: 'Comprobante de Ingresos',
            required: true,
            uploaded: false,
            file: null,
            description: ''
          },
          {
            id: 'estado_cuenta',
            name: 'Estado de Cuenta',
            required: true,
            uploaded: false,
            file: null,
            description: ''
          }
        );
      } else if (tipoTransaccion === 'CONSIGNACION') {
        additionalDocs.push(
          {
            id: 'carta_responsiva',
            name: 'Carta Responsiva',
            required: true,
            uploaded: false,
            file: null,
            description: ''
          },
          {
            id: 'contrato_consignacion',
            name: 'Contrato de Consignación',
            required: true,
            uploaded: false,
            file: null,
            description: ''
          }
        );
      }

      return [...commonDocuments, ...additionalDocs];
    }

    if (tipoPersona === 'Moral') {
      return [
        ...commonDocuments,
        {
          id: 'acta_constitutiva',
          name: 'Acta Constitutiva',
          required: true,
          uploaded: false,
          file: null,
          description: ''
        },
        {
          id: 'poder_notarial',
          name: 'Poder Notarial',
          required: true,
          uploaded: false,
          file: null,
          description: ''
        },
        {
          id: 'rfc',
          name: 'RFC de la Empresa',
          required: true,
          uploaded: false,
          file: null,
          description: ''
        },
        {
          id: 'identificacion_representante',
          name: 'Identificación del Representante Legal',
          required: true,
          uploaded: false,
          file: null,
          description: ''
        }
      ];
    }

    return commonDocuments;
  };

  const [documents, setDocuments] = useState<DocumentItem[]>(getInitialDocuments());
  const [customDocuments, setCustomDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    setDocuments(getInitialDocuments());
  }, [tipoTransaccion, tipoPersona]);

  const handleFileChange = (id: string, file: File | null, isCustom: boolean = false) => {
    const updateDocuments = (docs: DocumentItem[]) =>
      docs.map(doc =>
        doc.id === id
          ? {
              ...doc,
              file,
              uploaded: !!file
            }
          : doc
      );

    if (isCustom) {
      setCustomDocuments(updateDocuments(customDocuments));
    } else {
      setDocuments(updateDocuments(documents));
    }

    // Notify parent component of all uploaded documents
    const allDocuments = [...documents, ...customDocuments]
      .filter(doc => doc.file)
      .map(doc => ({
        file: doc.file as File,
        description: doc.description
      }));
    onDocumentsChange(allDocuments);
  };

  const handleDescriptionChange = (id: string, description: string, isCustom: boolean = false) => {
    const updateDocuments = (docs: DocumentItem[]) =>
      docs.map(doc =>
        doc.id === id
          ? {
              ...doc,
              description
            }
          : doc
      );

    if (isCustom) {
      setCustomDocuments(updateDocuments(customDocuments));
    } else {
      setDocuments(updateDocuments(documents));
    }

    // Notify parent component of all uploaded documents
    const allDocuments = [...documents, ...customDocuments]
      .filter(doc => doc.file)
      .map(doc => ({
        file: doc.file as File,
        description: doc.description
      }));
    onDocumentsChange(allDocuments);
  };

  const addCustomDocument = () => {
    const newDoc: DocumentItem = {
      id: `custom_${customDocuments.length + 1}`,
      name: 'Documento Adicional',
      required: false,
      uploaded: false,
      file: null,
      description: ''
    };
    setCustomDocuments([...customDocuments, newDoc]);
  };

  const renderDocumentItem = (doc: DocumentItem, isCustom: boolean = false) => (
    <div key={doc.id} className="flex flex-col space-y-2 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {doc.uploaded && (
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
          <span className="font-medium">
            {doc.name} {doc.required && <span className="text-red-500">*</span>}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Descripción del documento"
          value={doc.description}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleDescriptionChange(doc.id, e.target.value, isCustom)}
          className="w-full"
        />
        <div className="flex items-center space-x-2">
          <Input
            type="file"
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(doc.id, e.target.files?.[0] || null, isCustom)}
            className="flex-1"
            accept=".pdf,.jpg,.png,.xml"
          />
          {doc.uploaded && (
            <span className="text-sm text-green-500">
              {doc.file?.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {documents.map(doc => renderDocumentItem(doc))}
      </div>

      {customDocuments.length > 0 && (
        <div className="space-y-4 mt-4">
          <h3 className="font-medium">Documentos Adicionales</h3>
          {customDocuments.map(doc => renderDocumentItem(doc, true))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={addCustomDocument}
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        Agregar Documento Adicional
      </Button>
    </div>
  );
}