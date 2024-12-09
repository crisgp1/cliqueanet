import { useState } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { BaseModal } from "../ui/base-modal";
import { FileText, Upload } from 'lucide-react';

interface Employee {
  id_empleado?: number;
  nombre: string;
  id_tipo_identificacion: number;
  num_identificacion: string;
  curp: string;
  fecha_nacimiento: string;
  telefono: string;
  correo: string;
  domicilio: string;
  fecha_contratacion: string;
  id_rol: number;
  comentarios?: string;
  expediente_completo?: boolean;
  tipo_documento?: string;
  last_document_scan?: string;
  documents_status?: 'complete' | 'pending' | 'delayed';
}

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employee?: Employee;
}

const DOCUMENT_TYPES = [
  { value: 'cv', label: 'CV' },
  { value: 'ine', label: 'INE' },
  { value: 'curp', label: 'CURP' },
  { value: 'comprobante_domicilio', label: 'Comprobante de Domicilio' },
  { value: 'rfc', label: 'RFC' },
  { value: 'acta_nacimiento', label: 'Acta de Nacimiento' },
  { value: 'comprobante_estudios', label: 'Comprobante de Estudios' }
];

export function EmployeeModal({ isOpen, onClose, onSave, employee }: EmployeeModalProps) {
  const [formData, setFormData] = useState<Omit<Employee, 'id_empleado'>>({
    nombre: employee?.nombre || '',
    id_tipo_identificacion: employee?.id_tipo_identificacion || 1,
    num_identificacion: employee?.num_identificacion || '',
    curp: employee?.curp || '',
    fecha_nacimiento: employee?.fecha_nacimiento ? new Date(employee.fecha_nacimiento).toISOString().split('T')[0] : '',
    telefono: employee?.telefono || '',
    correo: employee?.correo || '',
    domicilio: employee?.domicilio || '',
    fecha_contratacion: employee?.fecha_contratacion ? new Date(employee.fecha_contratacion).toISOString().split('T')[0] : '',
    id_rol: employee?.id_rol || 1,
    comentarios: employee?.comentarios || '',
    expediente_completo: employee?.expediente_completo || false,
    tipo_documento: employee?.tipo_documento || '',
    last_document_scan: employee?.last_document_scan,
    documents_status: employee?.documents_status
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue: string | number | boolean = value;

    if (name === 'id_tipo_identificacion' || name === 'id_rol') {
      newValue = parseInt(value, 10);
    } else if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleScanDocument = () => {
    // Aquí se implementará la lógica de escaneo
    console.log('Escanear documento:', formData.tipo_documento);
  };

  const modalContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="nombre" className="text-sm font-medium">
            Nombre
          </label>
          <Input
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="id_tipo_identificacion" className="text-sm font-medium">
            Tipo de Identificación
          </label>
          <select
            id="id_tipo_identificacion"
            name="id_tipo_identificacion"
            value={formData.id_tipo_identificacion}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          >
            <option value={1}>INE</option>
            <option value={2}>Pasaporte</option>
            <option value={3}>Cédula profesional</option>
            <option value={4}>Licencia de conducir</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="num_identificacion" className="text-sm font-medium">
            Número de Identificación
          </label>
          <Input
            id="num_identificacion"
            name="num_identificacion"
            value={formData.num_identificacion}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="curp" className="text-sm font-medium">
            CURP
          </label>
          <Input
            id="curp"
            name="curp"
            value={formData.curp}
            onChange={handleChange}
            required
            maxLength={18}
            pattern="^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$"
            title="CURP válida (formato: AAAA000000AAAAAA00)"
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="fecha_nacimiento" className="text-sm font-medium">
            Fecha Nacimiento
          </label>
          <Input
            id="fecha_nacimiento"
            name="fecha_nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="telefono" className="text-sm font-medium">
            Teléfono
          </label>
          <Input
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="correo" className="text-sm font-medium">
            Correo
          </label>
          <Input
            id="correo"
            name="correo"
            type="email"
            value={formData.correo}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="domicilio" className="text-sm font-medium">
            Domicilio
          </label>
          <Input
            id="domicilio"
            name="domicilio"
            value={formData.domicilio}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="fecha_contratacion" className="text-sm font-medium">
            Fecha de Contratación
          </label>
          <Input
            id="fecha_contratacion"
            name="fecha_contratacion"
            type="date"
            value={formData.fecha_contratacion}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="id_rol" className="text-sm font-medium">
            Rol
          </label>
          <select
            id="id_rol"
            name="id_rol"
            value={formData.id_rol}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          >
            <option value={1}>Administrador</option>
            <option value={2}>Ventas</option>
            <option value={3}>RRHH</option>
            <option value={4}>Gerente_general</option>
            <option value={5}>Capturista</option>
          </select>
        </div>
      </div>

      <div className="border-t pt-4 mt-6">
        <h3 className="text-lg font-semibold mb-4">Documentos del Empleado</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <select
                id="tipo_documento"
                name="tipo_documento"
                value={formData.tipo_documento}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="" disabled hidden>Seleccione tipo de documento</option>
                {DOCUMENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              onClick={handleScanDocument}
              disabled={!formData.tipo_documento}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Escanear Documento
            </Button>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="expediente_completo"
                checked={formData.expediente_completo}
                onChange={handleChange}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Expediente Completo</span>
            </label>
          </div>

          <div className="space-y-2">
            <label htmlFor="comentarios" className="text-sm font-medium">
              Comentarios sobre documentos faltantes
            </label>
            <Textarea
              id="comentarios"
              name="comentarios"
              value={formData.comentarios}
              onChange={handleChange}
              placeholder="Especifique los documentos faltantes o cualquier observación..."
              className="min-h-[100px]"
            />
          </div>
        </div>
      </div>
    </form>
  );

  const modalFooter = (
    <>
      <Button type="button" variant="outline" onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" onClick={handleSubmit}>
        {employee ? 'Guardar Cambios' : 'Crear Empleado'}
      </Button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? 'Editar Empleado' : 'Nuevo Empleado'}
      maxWidth="lg"
      footer={modalFooter}
    >
      {modalContent}
    </BaseModal>
  );
}