import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IdentificationHelper } from '../helpers/IdentificationHelper';
import { Cliente, CreateClienteDto } from '@/services/cliente.service';
import { documentoService, Documento } from '@/services/documento.service';
import { toast } from '@/components/ui/use-toast';
import { DocumentChecklist } from '../DocumentChecklist';

interface TipoIdentificacion {
  id: number;
  nombre: string;
  descripcion?: string;
}

type TipoPersona = "Física" | "Moral";

interface FormData {
  nombre: string;
  curp: string | undefined;
  idTipoIdentificacion: string;
  numIdentificacion: string;
  fechaNacimiento: string;
  telefono: string;
  correo: string;
  domicilio: string;
  tipoPersona: TipoPersona;
  representanteLegal?: string;
  razonSocial?: string;
  rfc?: string;
  fechaConstitucion?: string;
  regimenFiscal?: string;
}

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: CreateClienteDto) => Promise<Cliente>;
  customer?: Cliente;
  tiposIdentificacion: TipoIdentificacion[];
}

interface DocumentWithDescription {
  file: File;
  description: string;
  id?: number;
}

export function CustomerModal({
  isOpen,
  onClose,
  onSave,
  customer,
  tiposIdentificacion = []
}: CustomerModalProps) {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    curp: "",
    idTipoIdentificacion: "",
    numIdentificacion: "",
    fechaNacimiento: "",
    telefono: "",
    correo: "",
    domicilio: "",
    tipoPersona: "Física",
    representanteLegal: "",
    razonSocial: "",
    rfc: "",
    fechaConstitucion: "",
    regimenFiscal: ""
  });

  const [documents, setDocuments] = useState<DocumentWithDescription[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        nombre: customer.nombre,
        curp: customer.curp || "",
        idTipoIdentificacion: customer.idTipoIdentificacion?.toString() || "",
        numIdentificacion: customer.numIdentificacion,
        fechaNacimiento: customer.fechaNacimiento 
          ? new Date(customer.fechaNacimiento).toISOString().split("T")[0]
          : "",
        telefono: customer.telefono,
        correo: customer.correo,
        domicilio: customer.domicilio,
        tipoPersona: customer.tipoPersona,
        representanteLegal: customer.representanteLegal || "",
        razonSocial: customer.razonSocial || "",
        rfc: customer.rfc || "",
        fechaConstitucion: customer.fechaConstitucion
          ? new Date(customer.fechaConstitucion).toISOString().split("T")[0]
          : "",
        regimenFiscal: customer.regimenFiscal || ""
      });
    } else {
      setFormData({
        nombre: "",
        curp: "",
        idTipoIdentificacion: "",
        numIdentificacion: "",
        fechaNacimiento: "",
        telefono: "",
        correo: "",
        domicilio: "",
        tipoPersona: "Física",
        representanteLegal: "",
        razonSocial: "",
        rfc: "",
        fechaConstitucion: "",
        regimenFiscal: ""
      });
    }
    setErrors({});
    setDocuments([]);
  }, [customer, isOpen]);

  const validateCURP = (curp: string) => {
    const curpRegex = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/;
    return curpRegex.test(curp);
  };

  const validateRFC = (rfc: string) => {
    const rfcRegex = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    return rfcRegex.test(rfc);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\d\s()+-]{10,15}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "tipoPersona") {
      const tipoPersonaValue = value as TipoPersona;
      if (tipoPersonaValue === "Física" || tipoPersonaValue === "Moral") {
        setIsTransitioning(true);
        setTimeout(() => {
          setFormData(prev => ({ 
            ...prev, 
            tipoPersona: tipoPersonaValue,
            rfc: "",
            curp: tipoPersonaValue === "Moral" ? undefined : "",
            razonSocial: tipoPersonaValue === "Moral" ? "" : undefined,
            representanteLegal: tipoPersonaValue === "Moral" ? "" : undefined,
            fechaConstitucion: tipoPersonaValue === "Moral" ? "" : undefined,
            regimenFiscal: tipoPersonaValue === "Moral" ? "" : undefined
          }));
          setIsTransitioning(false);
        }, 150);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));

      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const isMoral = formData.tipoPersona === "Moral";

    // Validaciones comunes
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.idTipoIdentificacion) {
      newErrors.idTipoIdentificacion = "El tipo de identificación es requerido";
    }

    if (!formData.numIdentificacion) {
      newErrors.numIdentificacion = "El número de identificación es requerido";
    } else if (formData.numIdentificacion.length < 5) {
      newErrors.numIdentificacion = "El número de identificación debe tener al menos 5 caracteres";
    }

    if (!formData.telefono) {
      newErrors.telefono = "El teléfono es requerido";
    } else if (!validatePhone(formData.telefono)) {
      newErrors.telefono = "El formato del teléfono no es válido";
    }

    if (!formData.correo) {
      newErrors.correo = "El correo es requerido";
    } else if (!validateEmail(formData.correo)) {
      newErrors.correo = "El formato del correo no es válido";
    }

    if (!formData.domicilio.trim()) {
      newErrors.domicilio = "El domicilio es requerido";
    } else if (formData.domicilio.length < 10) {
      newErrors.domicilio = "El domicilio debe ser más detallado";
    }

    // Validaciones específicas por tipo de persona
    if (isMoral) {
      if (!formData.razonSocial) {
        newErrors.razonSocial = "La razón social es requerida";
      }
      if (!formData.rfc) {
        newErrors.rfc = "El RFC es requerido";
      } else if (!validateRFC(formData.rfc)) {
        newErrors.rfc = "El formato del RFC no es válido";
      }
      if (!formData.fechaConstitucion) {
        newErrors.fechaConstitucion = "La fecha de constitución es requerida";
      }
      if (!formData.regimenFiscal) {
        newErrors.regimenFiscal = "El régimen fiscal es requerido";
      }
      if (!formData.representanteLegal) {
        newErrors.representanteLegal = "El representante legal es requerido";
      }
      if (documents.length === 0) {
        newErrors.documentos = "Debe subir al menos un documento";
      }
    } else {
      if (!formData.curp) {
        newErrors.curp = "El CURP es requerido";
      } else if (!validateCURP(formData.curp)) {
        newErrors.curp = "El formato del CURP no es válido";
      }
      if (!formData.fechaNacimiento) {
        newErrors.fechaNacimiento = "La fecha de nacimiento es requerida";
      }
      if (formData.rfc && !validateRFC(formData.rfc)) {
        newErrors.rfc = "El formato del RFC no es válido";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDocumentsChange = (newDocuments: DocumentWithDescription[]) => {
    setDocuments(newDocuments);
  };

  const uploadDocuments = async () => {
    try {
      const uploadPromises = documents.map(doc => 
        documentoService.crearDocumento({
          nombre: doc.file.name,
          tipo: doc.file.type,
          archivo: doc.file
        })
      );

      const uploadedDocs = await Promise.all(uploadPromises);
      return uploadedDocs;
    } catch (error) {
      console.error('Error al subir documentos:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrija los errores en el formulario",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Primero subir los documentos
      let uploadedDocuments: Documento[] = [];
      if (documents.length > 0) {
        uploadedDocuments = await uploadDocuments();
      }

      const dataToSend: CreateClienteDto = {
        ...formData,
        idTipoIdentificacion: parseInt(formData.idTipoIdentificacion),
        fechaNacimiento: new Date(formData.fechaNacimiento),
        fechaConstitucion: formData.fechaConstitucion ? new Date(formData.fechaConstitucion) : undefined,
        rfc: formData.tipoPersona === "Física" ? (formData.rfc || undefined) : formData.rfc,
        razonSocial: formData.tipoPersona === "Moral" ? formData.razonSocial : undefined,
        representanteLegal: formData.tipoPersona === "Moral" ? formData.representanteLegal : undefined,
        regimenFiscal: formData.tipoPersona === "Moral" ? formData.regimenFiscal : undefined,
        curp: formData.tipoPersona === "Moral" ? "" : formData.curp || "",
        actaConstitutivaUrl: uploadedDocuments.find(doc => doc.tipo === 'application/pdf')?.url,
        poderNotarialUrl: uploadedDocuments.find(doc => doc.tipo === 'application/pdf')?.url,
        comprobanteDomicilioUrl: uploadedDocuments.find(doc => doc.tipo.startsWith('image/'))?.url
      };

      const savedCliente = await onSave(dataToSend);

      // Actualizar los documentos con el ID del cliente
      if (uploadedDocuments.length > 0) {
        await Promise.all(uploadedDocuments.map(doc =>
          documentoService.actualizarDocumento(doc.id, {
            nombre: doc.nombre,
            tipo: doc.tipo,
            estado: 'pendiente'
          })
        ));
      }

      toast({
        title: "Éxito",
        description: `Cliente ${customer ? 'actualizado' : 'creado'} correctamente`,
      });

      onClose();
    } catch (error: any) {
      // Si hay error, intentar eliminar los documentos subidos
      if (documents.length > 0) {
        try {
          await Promise.all(documents.map(doc =>
            doc.id ? documentoService.eliminarDocumento(doc.id) : Promise.resolve()
          ));
        } catch (cleanupError) {
          console.error('Error al limpiar documentos:', cleanupError);
        }
      }

      if (error.response?.data?.errors) {
        const serverErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          serverErrors[err.field] = err.message;
        });
        setErrors(serverErrors);
        toast({
          title: "Error",
          description: "Por favor, corrija los errores señalados",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || `Error al ${customer ? 'actualizar' : 'crear'} el cliente`,
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Editar Cliente" : "Nuevo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {customer 
              ? "Actualice la información del cliente y sus documentos" 
              : "Complete el formulario para registrar un nuevo cliente. Los campos marcados con * son obligatorios."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="tipoPersona" className="text-sm font-medium">
                Tipo de Persona *
              </label>
              <select
                id="tipoPersona"
                name="tipoPersona"
                value={formData.tipoPersona}
                onChange={handleChange}
                required
                className="w-full border rounded-md p-2"
              >
                <option value="Física">Persona Física</option>
                <option value="Moral">Persona Moral</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="nombre" className="text-sm font-medium">
                {formData.tipoPersona === "Moral" ? "Nombre Comercial" : "Nombre Completo"} *
              </label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className={errors.nombre ? "border-red-500" : ""}
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm">{errors.nombre}</p>
              )}
            </div>

            {formData.tipoPersona === "Moral" && (
              <>
                <div className="space-y-2">
                  <label htmlFor="razonSocial" className="text-sm font-medium">
                    Razón Social *
                  </label>
                  <Input
                    id="razonSocial"
                    name="razonSocial"
                    value={formData.razonSocial}
                    onChange={handleChange}
                    required
                    className={errors.razonSocial ? "border-red-500" : ""}
                  />
                  {errors.razonSocial && (
                    <p className="text-red-500 text-sm">{errors.razonSocial}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="representanteLegal" className="text-sm font-medium">
                    Representante Legal *
                  </label>
                  <Input
                    id="representanteLegal"
                    name="representanteLegal"
                    value={formData.representanteLegal}
                    onChange={handleChange}
                    required
                    className={errors.representanteLegal ? "border-red-500" : ""}
                  />
                  {errors.representanteLegal && (
                    <p className="text-red-500 text-sm">{errors.representanteLegal}</p>
                  )}
                </div>
              </>
            )}

            {formData.tipoPersona === "Física" ? (
              <>
                <div className="space-y-2">
                  <label htmlFor="curp" className="text-sm font-medium">
                    CURP *
                  </label>
                  <Input
                    id="curp"
                    name="curp"
                    value={formData.curp}
                    onChange={handleChange}
                    required
                    maxLength={18}
                    className={errors.curp ? "border-red-500" : ""}
                  />
                  {errors.curp && (
                    <p className="text-red-500 text-sm">{errors.curp}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="fechaNacimiento" className="text-sm font-medium">
                    Fecha de Nacimiento *
                  </label>
                  <Input
                    id="fechaNacimiento"
                    name="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split("T")[0]}
                    className={errors.fechaNacimiento ? "border-red-500" : ""}
                  />
                  {errors.fechaNacimiento && (
                    <p className="text-red-500 text-sm">{errors.fechaNacimiento}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="fechaConstitucion" className="text-sm font-medium">
                    Fecha de Constitución *
                  </label>
                  <Input
                    id="fechaConstitucion"
                    name="fechaConstitucion"
                    type="date"
                    value={formData.fechaConstitucion}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split("T")[0]}
                    className={errors.fechaConstitucion ? "border-red-500" : ""}
                  />
                  {errors.fechaConstitucion && (
                    <p className="text-red-500 text-sm">{errors.fechaConstitucion}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="regimenFiscal" className="text-sm font-medium">
                    Régimen Fiscal *
                  </label>
                  <Input
                    id="regimenFiscal"
                    name="regimenFiscal"
                    value={formData.regimenFiscal}
                    onChange={handleChange}
                    required
                    className={errors.regimenFiscal ? "border-red-500" : ""}
                  />
                  {errors.regimenFiscal && (
                    <p className="text-red-500 text-sm">{errors.regimenFiscal}</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <label htmlFor="rfc" className="text-sm font-medium">
                RFC {formData.tipoPersona === "Moral" ? "*" : "(Opcional)"}
              </label>
              <Input
                id="rfc"
                name="rfc"
                value={formData.rfc}
                onChange={handleChange}
                required={formData.tipoPersona === "Moral"}
                maxLength={13}
                className={errors.rfc ? "border-red-500" : ""}
              />
              {errors.rfc && (
                <p className="text-red-500 text-sm">{errors.rfc}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="idTipoIdentificacion" className="text-sm font-medium">
                Tipo de Identificación *
              </label>
              <select
                id="idTipoIdentificacion"
                name="idTipoIdentificacion"
                value={formData.idTipoIdentificacion}
                onChange={handleChange}
                required
                className={`w-full border rounded-md p-2 ${
                  errors.idTipoIdentificacion ? "border-red-500" : ""
                }`}
              >
                <option value="">Seleccione...</option>
                {tiposIdentificacion.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
              {errors.idTipoIdentificacion && (
                <p className="text-red-500 text-sm">{errors.idTipoIdentificacion}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="numIdentificacion" className="text-sm font-medium">
                  Número de Identificación *
                </label>
                <IdentificationHelper selectedType={formData.idTipoIdentificacion} />
              </div>
              <Input
                id="numIdentificacion"
                name="numIdentificacion"
                value={formData.numIdentificacion}
                onChange={handleChange}
                required
                className={errors.numIdentificacion ? "border-red-500" : ""}
              />
              {errors.numIdentificacion && (
                <p className="text-red-500 text-sm">{errors.numIdentificacion}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="telefono" className="text-sm font-medium">
                Teléfono *
              </label>
              <Input
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className={errors.telefono ? "border-red-500" : ""}
              />
              {errors.telefono && (
                <p className="text-red-500 text-sm">{errors.telefono}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="correo" className="text-sm font-medium">
                Correo Electrónico *
              </label>
              <Input
                id="correo"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                required
                className={errors.correo ? "border-red-500" : ""}
              />
              {errors.correo && (
                <p className="text-red-500 text-sm">{errors.correo}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label htmlFor="domicilio" className="text-sm font-medium">
                Domicilio *
              </label>
              <Input
                id="domicilio"
                name="domicilio"
                value={formData.domicilio}
                onChange={handleChange}
                required
                className={errors.domicilio ? "border-red-500" : ""}
              />
              {errors.domicilio && (
                <p className="text-red-500 text-sm">{errors.domicilio}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <DocumentChecklist
                tipoPersona={formData.tipoPersona}
                onDocumentsChange={handleDocumentsChange}
              />
              {errors.documentos && (
                <p className="text-red-500 text-sm mt-2">{errors.documentos}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : customer ? "Guardar Cambios" : "Crear Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}