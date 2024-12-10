import { useState, useEffect, useRef } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { BaseModal } from "../ui/base-modal";
import { FileText, Upload } from 'lucide-react';
import { toast } from "../ui/use-toast";
import { empleadoService, IEmpleado } from '../../services/empleado.service';
import { rolUsuarioService, RolUsuario } from '../../services/rol-usuario.service';
import { tipoIdentificacionService, TipoIdentificacion } from '../../services/tipo-identificacion.service';
import { documentoService } from '../../services/documento.service';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: IEmpleado) => void;
  employee?: IEmpleado;
}

interface EmployeeFormData extends Omit<IEmpleado, 'id_empleado'> {
  tipoDocumento?: string;
}

const TIPOS_DOCUMENTO = [
  { value: 'cv', label: 'CV' },
  { value: 'ine', label: 'INE' },
  { value: 'curp', label: 'CURP' },
  { value: 'comprobante_domicilio', label: 'Comprobante de Domicilio' },
  { value: 'rfc', label: 'RFC' },
  { value: 'acta_nacimiento', label: 'Acta de Nacimiento' },
  { value: 'comprobante_estudios', label: 'Comprobante de Estudios' }
];

export function EmployeeModal({ isOpen, onClose, onSave, employee }: EmployeeModalProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    nombre: employee?.nombre || '',
    id_tipo_identificacion: employee?.id_tipo_identificacion || 0,
    num_identificacion: employee?.num_identificacion || '',
    curp: employee?.curp || '',
    fecha_nacimiento: employee?.fecha_nacimiento ? new Date(employee.fecha_nacimiento) : new Date(),
    telefono: employee?.telefono || '',
    correo: employee?.correo || '',
    domicilio: employee?.domicilio || '',
    fecha_contratacion: employee?.fecha_contratacion ? new Date(employee.fecha_contratacion) : new Date(),
    id_rol: employee?.id_rol || 0,
    tipoDocumento: ''
  });

  const [roles, setRoles] = useState<RolUsuario[]>([]);
  const [tiposIdentificacion, setTiposIdentificacion] = useState<TipoIdentificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [rolesData, tiposIdData] = await Promise.all([
          rolUsuarioService.getAll(),
          tipoIdentificacionService.getAll()
        ]);
        setRoles(rolesData);
        setTiposIdentificacion(tiposIdData);
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los catálogos",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadCatalogs();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { tipoDocumento, ...employeeData } = formData;
      await onSave(employeeData);
      onClose();
    } catch (error) {
      console.error('Error al guardar empleado:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el empleado",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue: string | number | Date = value;

    if (name === 'id_tipo_identificacion' || name === 'id_rol') {
      newValue = parseInt(value, 10);
    } else if (type === 'date') {
      newValue = new Date(value);
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !employee?.id_empleado || !formData.tipoDocumento) return;

    setIsUploading(true);
    try {
      await documentoService.crearDocumento({
        nombre: files[0].name,
        tipo: formData.tipoDocumento,
        archivo: files[0],
        id_empleado: employee.id_empleado
      });

      toast({
        title: "Éxito",
        description: "Documento subido correctamente"
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFormData(prev => ({ ...prev, tipoDocumento: '' }));
    } catch (error) {
      console.error('Error al subir documento:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el documento",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
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
            <option value="">Seleccione tipo</option>
            {tiposIdentificacion.map(tipo => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
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
            value={formData.fecha_nacimiento.toISOString().split('T')[0]}
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
            value={formData.fecha_contratacion.toISOString().split('T')[0]}
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
            <option value="">Seleccione rol</option>
            {roles.map(rol => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {employee?.id_empleado && (
        <div className="border-t pt-4 mt-6">
          <h3 className="text-lg font-semibold mb-4">Documentos del Empleado</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <select
                  id="tipoDocumento"
                  name="tipoDocumento"
                  value={formData.tipoDocumento}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="" disabled hidden>Seleccione tipo de documento</option>
                  {TIPOS_DOCUMENTO.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                onClick={handleFileUpload}
                disabled={!formData.tipoDocumento || isUploading}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Subiendo...' : 'Subir Documento'}
              </Button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
        </div>
      )}
    </form>
  );

  const modalFooter = (
    <>
      <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
        Cancelar
      </Button>
      <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
        {isSaving ? 'Guardando...' : employee ? 'Guardar Cambios' : 'Crear Empleado'}
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
      isLoading={isLoading}
    >
      {modalContent}
    </BaseModal>
  );
}