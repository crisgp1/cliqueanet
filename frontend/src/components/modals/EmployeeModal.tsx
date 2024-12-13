import { useState, useEffect, useRef } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { BaseModal } from "../ui/base-modal";
import { toast } from "../ui/use-toast";
import {
  FileText,
  Upload,
  CheckCircle2,
  Circle,
  UserSquare2,
  Home,
  GraduationCap,
  UserRound,
  ScrollText,
  Binary,
  Check,
  X,
  Scan
} from 'lucide-react';

import { empleadoService, IEmpleado, IUsuarioEmpleado } from '../../services/empleado.service';
import { rolUsuarioService, RolUsuario } from '../../services/rol-usuario.service';
import { tipoIdentificacionService, TipoIdentificacion } from '../../services/tipo-identificacion.service';
import { documentoService, Documento, CreateDocumentoDto } from '../../services/documento.service';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { usuario: IUsuarioEmpleado; empleado: Omit<IEmpleado, 'id' | 'usuario' | 'numEmpleado'> }) => void;
  employee?: IEmpleado;
}

interface EmployeeFormData {
  correo: string;
  id_rol: number;
  password?: string;
  nombre: string;
  idTipoIdentificacion: number;
  numIdentificacion: string;
  curp: string;
  fechaNacimiento: string;
  telefono: string;
  domicilio: string;
  fechaContratacion: string;
}

interface DocumentoStatus {
  id: string;
  subido: boolean;
  url?: string;
}

const DOCUMENTOS_REQUERIDOS = [
  {
    id: 'cv',
    label: 'CV',
    obligatorio: true,
    icon: ScrollText,
    description: 'Currículum Vitae actualizado'
  },
  {
    id: 'ine',
    label: 'INE',
    obligatorio: true,
    icon: UserSquare2,
    description: 'Identificación oficial vigente'
  },
  {
    id: 'curp',
    label: 'CURP',
    obligatorio: true,
    icon: UserRound,
    description: 'Clave Única de Registro de Población'
  },
  {
    id: 'comprobante_domicilio',
    label: 'Comprobante de Domicilio',
    obligatorio: true,
    icon: Home,
    description: 'No mayor a 3 meses'
  },
  {
    id: 'rfc',
    label: 'RFC',
    obligatorio: false,
    icon: FileText,
    description: 'Registro Federal de Contribuyentes'
  },
  {
    id: 'acta_nacimiento',
    label: 'Acta de Nacimiento',
    obligatorio: true,
    icon: FileText,
    description: 'Original o copia certificada'
  },
  {
    id: 'comprobante_estudios',
    label: 'Comprobante de Estudios',
    obligatorio: false,
    icon: GraduationCap,
    description: 'Título, cédula o certificado'
  }
];

const MIN_DOMICILIO_LENGTH = 10;
const MAX_DOMICILIO_LENGTH = 200;
const MIN_AGE = 18;

export function EmployeeModal({ isOpen, onClose, onSave, employee }: EmployeeModalProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    correo: employee?.usuario?.correo || '',
    id_rol: employee?.usuario?.id_rol || 0,
    password: '',
    nombre: employee?.nombre || '',
    idTipoIdentificacion: employee?.idTipoIdentificacion || 0,
    numIdentificacion: employee?.numIdentificacion || '',
    curp: employee?.curp || '',
    fechaNacimiento: employee?.fechaNacimiento ? new Date(employee.fechaNacimiento).toISOString().split('T')[0] : '',
    telefono: employee?.telefono || '',
    domicilio: employee?.domicilio || '',
    fechaContratacion: employee?.fechaContratacion ? new Date(employee.fechaContratacion).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  });

  const [roles, setRoles] = useState<RolUsuario[]>([]);
  const [tiposIdentificacion, setTiposIdentificacion] = useState<TipoIdentificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documentosStatus, setDocumentosStatus] = useState<DocumentoStatus[]>([]);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
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

  useEffect(() => {
    const cargarDocumentos = async () => {
      if (employee?.id) {
        try {
          const response = await documentoService.obtenerDocumentosPorEmpleado(employee.id);
          const statusInicial = DOCUMENTOS_REQUERIDOS.map(doc => ({
            id: doc.id,
            subido: response.documentos.some(d => d.tipo === doc.id),
            url: response.documentos.find(d => d.tipo === doc.id)?.url
          }));
          setDocumentosStatus(statusInicial);
        } catch (error: any) {
          console.error('Error al cargar documentos:', error);
          toast({
            title: "Error",
            description: "No se pudieron cargar los documentos del empleado",
            variant: "destructive"
          });
        }
      }
    };

    if (isOpen && employee?.id) {
      cargarDocumentos();
    }
  }, [isOpen, employee?.id]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    const today = new Date();
    const fechaNacimiento = new Date(formData.fechaNacimiento);
    const fechaContratacion = new Date(formData.fechaContratacion);
    const age = Math.floor((today.getTime() - fechaNacimiento.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    // Validación de correo
    if (!formData.correo) {
      errors.correo = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      errors.correo = "El correo no es válido";
    }

    // Validación de rol
    if (!formData.id_rol) {
      errors.id_rol = "El rol es requerido";
    }

    // Validación de contraseña para nuevos empleados
    if (!employee && !formData.password) {
      errors.password = "La contraseña es requerida para nuevos empleados";
    }

    // Validación de nombre
    if (!formData.nombre) {
      errors.nombre = "El nombre es requerido";
    }

    // Validación de tipo de identificación
    if (!formData.idTipoIdentificacion) {
      errors.idTipoIdentificacion = "El tipo de identificación es requerido";
    }

    // Validación de número de identificación
    if (!formData.numIdentificacion) {
      errors.numIdentificacion = "El número de identificación es requerido";
    }

    // Validación de CURP
    if (!formData.curp) {
      errors.curp = "El CURP es requerido";
    } else if (!/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/.test(formData.curp)) {
      errors.curp = "El CURP no tiene el formato correcto";
    }

    // Validación de fecha de nacimiento
    if (!formData.fechaNacimiento) {
      errors.fechaNacimiento = "La fecha de nacimiento es requerida";
    } else if (age < MIN_AGE) {
      errors.fechaNacimiento = `El empleado debe ser mayor de ${MIN_AGE} años`;
    }

    // Validación de teléfono
    if (!formData.telefono) {
      errors.telefono = "El teléfono es requerido";
    } else if (!/^[0-9]{10}$/.test(formData.telefono)) {
      errors.telefono = "El teléfono debe tener 10 dígitos";
    }

    // Validación de domicilio
    if (!formData.domicilio) {
      errors.domicilio = "El domicilio es requerido";
    } else if (formData.domicilio.length < MIN_DOMICILIO_LENGTH) {
      errors.domicilio = `El domicilio debe tener al menos ${MIN_DOMICILIO_LENGTH} caracteres`;
    } else if (formData.domicilio.length > MAX_DOMICILIO_LENGTH) {
      errors.domicilio = `El domicilio no puede exceder ${MAX_DOMICILIO_LENGTH} caracteres`;
    }

    // Validación de fecha de contratación
    if (!formData.fechaContratacion) {
      errors.fechaContratacion = "La fecha de contratación es requerida";
    } else if (fechaContratacion > today) {
      errors.fechaContratacion = "La fecha de contratación no puede ser futura";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Por favor, corrija los errores en el formulario",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { correo, id_rol, password, fechaNacimiento, fechaContratacion, ...restEmpleadoData } = formData;

      // Usa directamente el correo ingresado por el usuario
      const data = {
        usuario: {
          correo: formData.correo, 
          id_rol,
          ...(password && { password })
        },
        empleado: {
          ...restEmpleadoData,
          fechaNacimiento: new Date(fechaNacimiento),
          fechaContratacion: new Date(fechaContratacion)
        }
      };

      await onSave(data);
      onClose();
    } catch (error: any) {
      console.error('Error al guardar empleado:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el empleado",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue: string | number = value;

    if (name === 'idTipoIdentificacion' || name === 'id_rol') {
      newValue = parseInt(value, 10);
    } else if (type === 'number') {
      newValue = parseInt(value, 10);
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    // Limpiar el error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleScanDocument = async (docId: string) => {
    try {
      toast({
        title: "Información",
        description: "Funcionalidad de escaneo en desarrollo",
      });
    } catch (error) {
      console.error('Error al escanear documento:', error);
      toast({
        title: "Error",
        description: "No se pudo escanear el documento",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !employee?.id || !documentoSeleccionado) return;

    setIsUploading(true);
    try {
      const archivo = files[0];
      const documentoDto: CreateDocumentoDto = {
        nombre: archivo.name,
        tipo: documentoSeleccionado,
        archivo: archivo,
        id_empleado: employee.id
      };

      const documento = await documentoService.crearDocumento(documentoDto);
      
      setDocumentosStatus(prev => prev.map(doc =>
        doc.id === documentoSeleccionado
          ? { ...doc, subido: true, url: documento.url }
          : doc
      ));

      toast({
        title: "Éxito",
        description: "Documento subido correctamente"
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setDocumentoSeleccionado('');
    } catch (error: any) {
      console.error('Error al subir documento:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo subir el documento",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentoClick = (docId: string) => {
    setDocumentoSeleccionado(docId);
    handleFileUpload();
  };

  const modalContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            className={formErrors.correo ? 'border-red-500' : ''}
          />
          {formErrors.correo && (
            <p className="text-red-500 text-xs">{formErrors.correo}</p>
          )}
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
            className={`w-full p-2 border rounded-md ${formErrors.id_rol ? 'border-red-500' : ''}`}
          >
            <option value="">Seleccione rol</option>
            {roles.map(rol => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </select>
          {formErrors.id_rol && (
            <p className="text-red-500 text-xs">{formErrors.id_rol}</p>
          )}
        </div>

        {!employee && (
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password || ''}
              onChange={handleChange}
              required={!employee}
              className={formErrors.password ? 'border-red-500' : ''}
            />
            {formErrors.password && (
              <p className="text-red-500 text-xs">{formErrors.password}</p>
            )}
          </div>
        )}

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
            className={formErrors.nombre ? 'border-red-500' : ''}
          />
          {formErrors.nombre && (
            <p className="text-red-500 text-xs">{formErrors.nombre}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="idTipoIdentificacion" className="text-sm font-medium">
            Tipo de Identificación
          </label>
          <select
            id="idTipoIdentificacion"
            name="idTipoIdentificacion"
            value={formData.idTipoIdentificacion}
            onChange={handleChange}
            required
            className={`w-full p-2 border rounded-md ${formErrors.idTipoIdentificacion ? 'border-red-500' : ''}`}
          >
            <option value="">Seleccione tipo</option>
            {tiposIdentificacion.map(tipo => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
          {formErrors.idTipoIdentificacion && (
            <p className="text-red-500 text-xs">{formErrors.idTipoIdentificacion}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="numIdentificacion" className="text-sm font-medium">
            Número de Identificación
          </label>
          <Input
            id="numIdentificacion"
            name="numIdentificacion"
            value={formData.numIdentificacion}
            onChange={handleChange}
            required
            className={formErrors.numIdentificacion ? 'border-red-500' : ''}
          />
          {formErrors.numIdentificacion && (
            <p className="text-red-500 text-xs">{formErrors.numIdentificacion}</p>
          )}
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
            className={`font-mono ${formErrors.curp ? 'border-red-500' : ''}`}
          />
          {formErrors.curp && (
            <p className="text-red-500 text-xs">{formErrors.curp}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="fechaNacimiento" className="text-sm font-medium">
            Fecha Nacimiento
          </label>
          <Input
            id="fechaNacimiento"
            name="fechaNacimiento"
            type="date"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            required
            className={formErrors.fechaNacimiento ? 'border-red-500' : ''}
          />
          {formErrors.fechaNacimiento && (
            <p className="text-red-500 text-xs">{formErrors.fechaNacimiento}</p>
          )}
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
            pattern="[0-9]{10}"
            title="Teléfono a 10 dígitos"
            className={formErrors.telefono ? 'border-red-500' : ''}
          />
          {formErrors.telefono && (
            <p className="text-red-500 text-xs">{formErrors.telefono}</p>
          )}
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
            minLength={MIN_DOMICILIO_LENGTH}
            maxLength={MAX_DOMICILIO_LENGTH}
            className={formErrors.domicilio ? 'border-red-500' : ''}
          />
          {formErrors.domicilio && (
            <p className="text-red-500 text-xs">{formErrors.domicilio}</p>
          )}
          <p className="text-xs text-gray-500">
            {`El domicilio debe tener entre ${MIN_DOMICILIO_LENGTH} y ${MAX_DOMICILIO_LENGTH} caracteres`}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="fechaContratacion" className="text-sm font-medium">
            Fecha de Contratación
          </label>
          <Input
            id="fechaContratacion"
            name="fechaContratacion"
            type="date"
            value={formData.fechaContratacion}
            onChange={handleChange}
            required
            max={new Date().toISOString().split('T')[0]}
            className={formErrors.fechaContratacion ? 'border-red-500' : ''}
          />
          {formErrors.fechaContratacion && (
            <p className="text-red-500 text-xs">{formErrors.fechaContratacion}</p>
          )}
        </div>
      </div>

      {employee?.id && (
        <div className="border rounded-lg p-4 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Binary className="h-5 w-5 text-blue-500" />
              Documentos del Empleado
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg w-full sm:w-auto">
              <div className="flex items-center gap-2 flex-1 sm:flex-auto justify-center">
                <Circle className="h-4 w-4 text-gray-400" />
                <span>Pendiente</span>
              </div>
              <div className="flex items-center gap-2 flex-1 sm:flex-auto justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Completado</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {DOCUMENTOS_REQUERIDOS.map(doc => {
              const documento = documentosStatus.find(d => d.id === doc.id);
              const isSubido = documento?.subido;
              const IconComponent = doc.icon;

              return (
                <div
                  key={doc.id}
                  className={`
                    flex flex-col p-4 rounded-lg border
                    ${isSubido ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}
                    transition-all duration-200 hover:shadow-md
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      p-2 rounded-lg
                      ${isSubido ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'}
                      min-w-[2.5rem] flex items-center justify-center
                    `}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{doc.label}</span>
                        {doc.obligatorio && (
                          <span className="text-red-500 text-xs px-2 py-0.5 bg-red-50 rounded-full">Requerido</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{doc.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start mt-4 pt-3 border-t border-dashed gap-2">
                    <div className="flex items-center gap-2">
                      {isSubido ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400" />
                      )}
                      <span className="text-sm font-medium">
                        {isSubido ? 'Completado' : 'Pendiente'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {isSubido ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => window.open(documento?.url, '_blank')}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDocumentoClick(doc.id)}
                            className="flex items-center gap-1"
                          >
                            <Upload className="h-4 w-4" />
                            Subir
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleScanDocument(doc.id)}
                            className="flex items-center gap-1"
                          >
                            <Scan className="h-4 w-4" />
                            Escanear
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>
      )}
    </form>
  );

  const modalFooter = (
    <>
      <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
        Cancelar
      </Button>
      <Button type="submit" onClick={handleSubmit} disabled={isSaving || isUploading}>
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