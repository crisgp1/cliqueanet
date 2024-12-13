import { useState, useEffect, ChangeEvent } from 'react';
import { Check, Upload, AlertCircle } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { TipoDocumentoEmpleado, TipoDocumentoVehiculo, TipoDocumentoTransaccion, EntidadOrigen } from '@/services/documento.service';

interface DocumentItem {
  id: string;
  name: string;
  required: boolean;
  uploaded: boolean;
  file: File | null;
  description: string;
  uploading?: boolean;
  error?: string;
  tipoDocumentoEmpleado?: TipoDocumentoEmpleado;
  tipoDocumentoVehiculo?: TipoDocumentoVehiculo;
  tipoDocumentoTransaccion?: TipoDocumentoTransaccion;
  entidadOrigen: EntidadOrigen;
}

interface DocumentChecklistProps {
  tipoPersona: 'Física' | 'Moral';
  tipoTransaccion?: 'VENTA' | 'CREDITO' | 'CONSIGNACION';
  entidadOrigen?: EntidadOrigen;
  onDocumentsChange: (documents: { 
    file: File; 
    description: string;
    tipoDocumentoEmpleado?: TipoDocumentoEmpleado;
    tipoDocumentoVehiculo?: TipoDocumentoVehiculo;
    tipoDocumentoTransaccion?: TipoDocumentoTransaccion;
    entidadOrigen: EntidadOrigen;
  }[]) => void;
}

const DOCUMENTOS_REQUERIDOS = {
  VENTA: ['Identificación', 'Comprobante de Domicilio', 'Factura', 'Contrato'],
  CREDITO: ['Identificación', 'Comprobante de Domicilio', 'Comprobante de Ingresos', 'Estado de Cuenta'],
  CONSIGNACION: ['Identificación', 'Comprobante de Domicilio', 'Carta Responsiva', 'Contrato']
} as const;

// Tamaño máximo de archivo en bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function DocumentChecklist({ tipoPersona, tipoTransaccion, entidadOrigen = 'cliente', onDocumentsChange }: DocumentChecklistProps) {
  const getInitialDocuments = (): DocumentItem[] => {
    const commonDocuments = [
      {
        id: 'identificacion',
        name: 'Identificación Oficial',
        required: true,
        uploaded: false,
        file: null,
        description: '',
        entidadOrigen,
        ...(entidadOrigen === 'empleado' && { tipoDocumentoEmpleado: 'identificacion' as TipoDocumentoEmpleado })
      },
      {
        id: 'comprobante_domicilio',
        name: 'Comprobante de Domicilio',
        required: true,
        uploaded: false,
        file: null,
        description: '',
        entidadOrigen,
        ...(entidadOrigen === 'empleado' && { tipoDocumentoEmpleado: 'comprobante_domicilio' as TipoDocumentoEmpleado })
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
            description: '',
            entidadOrigen: 'transaccion',
            tipoDocumentoTransaccion: 'factura'
          },
          {
            id: 'contrato_venta',
            name: 'Contrato de Compra-Venta',
            required: true,
            uploaded: false,
            file: null,
            description: '',
            entidadOrigen: 'transaccion',
            tipoDocumentoTransaccion: 'contrato_compraventa'
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
            description: '',
            entidadOrigen: 'transaccion',
            tipoDocumentoTransaccion: 'comprobante_pago'
          },
          {
            id: 'estado_cuenta',
            name: 'Estado de Cuenta',
            required: true,
            uploaded: false,
            file: null,
            description: '',
            entidadOrigen: 'transaccion',
            tipoDocumentoTransaccion: 'otro'
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
            description: '',
            entidadOrigen: 'transaccion',
            tipoDocumentoTransaccion: 'carta_responsiva'
          },
          {
            id: 'contrato_consignacion',
            name: 'Contrato de Consignación',
            required: true,
            uploaded: false,
            file: null,
            description: '',
            entidadOrigen: 'transaccion',
            tipoDocumentoTransaccion: 'contrato_compraventa'
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
          description: '',
          entidadOrigen
        },
        {
          id: 'poder_notarial',
          name: 'Poder Notarial',
          required: true,
          uploaded: false,
          file: null,
          description: '',
          entidadOrigen
        },
        {
          id: 'rfc',
          name: 'RFC de la Empresa',
          required: true,
          uploaded: false,
          file: null,
          description: '',
          entidadOrigen
        },
        {
          id: 'identificacion_representante',
          name: 'Identificación del Representante Legal',
          required: true,
          uploaded: false,
          file: null,
          description: '',
          entidadOrigen
        }
      ];
    }

    return commonDocuments;
  };

  const [documents, setDocuments] = useState<DocumentItem[]>(getInitialDocuments());
  const [customDocuments, setCustomDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    setDocuments(getInitialDocuments());
  }, [tipoTransaccion, tipoPersona, entidadOrigen]);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'El archivo excede el tamaño máximo permitido (10MB)';
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/xml'
    ];

    if (!allowedTypes.includes(file.type)) {
      return 'Tipo de archivo no permitido. Solo se permiten PDF, JPG, PNG y XML';
    }

    return null;
  };

  const handleFileChange = (id: string, file: File | null, isCustom: boolean = false) => {
    if (file) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive"
        });
        return;
      }
    }

    const updateDocuments = (docs: DocumentItem[]) =>
      docs.map(doc =>
        doc.id === id
          ? {
              ...doc,
              file,
              uploaded: !!file,
              error: undefined
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
        description: doc.description,
        tipoDocumentoEmpleado: doc.tipoDocumentoEmpleado,
        tipoDocumentoVehiculo: doc.tipoDocumentoVehiculo,
        tipoDocumentoTransaccion: doc.tipoDocumentoTransaccion,
        entidadOrigen: doc.entidadOrigen
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
        description: doc.description,
        tipoDocumentoEmpleado: doc.tipoDocumentoEmpleado,
        tipoDocumentoVehiculo: doc.tipoDocumentoVehiculo,
        tipoDocumentoTransaccion: doc.tipoDocumentoTransaccion,
        entidadOrigen: doc.entidadOrigen
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
      description: '',
      entidadOrigen
    };
    setCustomDocuments([...customDocuments, newDoc]);
  };

  const renderDocumentItem = (doc: DocumentItem, isCustom: boolean = false) => (
    <div key={doc.id} className="flex flex-col space-y-2 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {doc.uploaded && !doc.error && (
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
          {doc.error && (
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
              <AlertCircle className="w-3 h-3 text-white" />
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
            disabled={doc.uploading}
          />
          {doc.uploaded && !doc.error && (
            <span className="text-sm text-green-500">
              {doc.file?.name}
            </span>
          )}
          {doc.error && (
            <span className="text-sm text-red-500">
              {doc.error}
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