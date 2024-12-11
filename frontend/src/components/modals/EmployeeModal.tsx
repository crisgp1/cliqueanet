import { useState, useEffect, useRef } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { BaseModal } from "../ui/base-modal";

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

import { toast } from "../ui/use-toast";
import { empleadoService, IEmpleado, IUsuarioEmpleado } from '../../services/empleado.service';
import { rolUsuarioService, RolUsuario } from '../../services/rol-usuario.service';
import { tipoIdentificacionService, TipoIdentificacion } from '../../services/tipo-identificacion.service';
import { documentoService } from '../../services/documento.service';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { usuario: IUsuarioEmpleado; empleado: Omit<IEmpleado, 'id_empleado' | 'usuario'> }) => void;
  employee?: IEmpleado;
}

interface EmployeeFormData {
  // Datos de usuario
  correo: string;
  id_rol: number;
  password?: string;
  username?: string;
  // Datos de empleado
  nombre: string;
  idTipoIdentificacion: number;
  num_identificacion: string;
  curp: string;
  fecha_nacimiento: Date;
  telefono: string;
  domicilio: string;
  fecha_contratacion: Date;
  num_empleado?: string;
  tipoDocumento?: string;
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

export function EmployeeModal({ isOpen, onClose, onSave, employee }: EmployeeModalProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    // Datos de usuario
    correo: employee?.usuario?.correo || '',
    id_rol: employee?.usuario?.id_rol || 0,
    username: employee?.usuario?.username || '',
    // Datos de empleado
    nombre: employee?.nombre || '',
    idTipoIdentificacion: employee?.idTipoIdentificacion || 0,
    num_identificacion: employee?.num_identificacion || '',
    curp: employee?.curp || '',
    fecha_nacimiento: employee?.fecha_nacimiento ? new Date(employee.fecha_nacimiento) : new Date(),
    telefono: employee?.telefono || '',
    domicilio: employee?.domicilio || '',
    fecha_contratacion: employee?.fecha_contratacion ? new Date(employee.fecha_contratacion) : new Date(),
    num_empleado: employee?.num_empleado || '',
    tipoDocumento: ''
  });

  const [roles, setRoles] = useState<RolUsuario[]>([]);
  const [tiposIdentificacion, setTiposIdentificacion] = useState<TipoIdentificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documentosStatus, setDocumentosStatus] = useState<DocumentoStatus[]>([]);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<string>('');
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
      if (employee?.id_empleado) {
        try {
          const response = await documentoService.obtenerDocumentosPorEmpleado(employee.id_empleado);
          const statusInicial = DOCUMENTOS_REQUERIDOS.map(doc => ({
            id: doc.id,
            subido: response.documentos.some(d => d.tipo === doc.id),
            url: response.documentos.find(d => d.tipo === doc.id)?.url
          }));
          setDocumentosStatus(statusInicial);
        } catch (error) {
          console.error('Error al cargar documentos:', error);
          toast({
            title: "Error",
            description: "No se pudieron cargar los documentos del empleado",
            variant: "destructive"
          });
        }
      }
    };

    if (isOpen && employee?.id_empleado) {
      cargarDocumentos();
    }
  }, [isOpen, employee?.id_empleado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { correo, id_rol, password, username, tipoDocumento, ...empleadoData } = formData;
      
      const data = {
        usuario: {
          correo,
          id_rol,
          ...(password && { password }),
          ...(username && { username })
        },
        empleado: {
          ...empleadoData,
          idTipoIdentificacion: formData.idTipoIdentificacion
        }
      };

      await onSave(data);
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

    if (name === 'idTipoIdentificacion' || name === 'id_rol') {
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
    if (!files || files.length === 0 || !employee?.id_empleado || !documentoSeleccionado) return;

    setIsUploading(true);
    try {
      const response = await documentoService.crearDocumento({
        nombre: files[0].name,
        tipo: documentoSeleccionado,
        archivo: files[0],
        id_empleado: employee.id_empleado
      });

      setDocumentosStatus(prev => prev.map(doc =>
        doc.id === documentoSeleccionado
          ? { ...doc, subido: true, url: response.url }
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

  const handleDocumentoClick = (docId: string) => {
    setDocumentoSeleccionado(docId);
    handleFileUpload();
  };

  const modalContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Datos de Usuario */}
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
        {!employee && (
          <>
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
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Nombre de Usuario
              </label>
              <Input
                id="username"
                name="username"
                value={formData.username || ''}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {/* Datos de Empleado */}
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
          <label htmlFor="idTipoIdentificacion" className="text-sm font-medium">
            Tipo de Identificación
          </label>
          <select
            id="idTipoIdentificacion"
            name="idTipoIdentificacion"
            value={formData.idTipoIdentificacion}
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
          <label htmlFor="num_empleado" className="text-sm font-medium">
            Número de Empleado
          </label>
          <Input
            id="num_empleado"
            name="num_empleado"
            value={formData.num_empleado || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      {employee?.id_empleado && (
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
              const isSubido = documentosStatus.find(d => d.id === doc.id)?.subido;
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
                          onClick={() => window.open(documentosStatus.find(d => d.id === doc.id)?.url, '_blank')}
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