import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { FaCar } from 'react-icons/fa';
import { BsCalendarDate, BsCardText } from 'react-icons/bs';
import { MdAttachMoney, MdQrCode, MdCardMembership, MdSave, MdDelete, MdRefresh, MdClose, MdDocumentScanner } from 'react-icons/md';
import { IoColorPalette } from 'react-icons/io5';
import { GiCarWheel } from 'react-icons/gi';
import { RiFileList3Line, RiFileTextLine } from 'react-icons/ri';
import { Loader2 } from 'lucide-react';
import { useToast } from "../ui/use-toast";
import { Vehiculo, CreateVehiculoDto } from '../../services/vehiculo.service';

interface Document {
  id_documento?: number;
  url: string;
  tipo_documento: string;
  descripcion: string;
}

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: CreateVehiculoDto) => Promise<void>;
  vehicle?: Vehiculo;
}

export function InventoryModal({ 
  isOpen, 
  onClose, 
  onSave, 
  vehicle 
}: VehicleModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    anio: '',
    precio: '',
    num_serie: '',
    color: '',
    num_motor: '',
    num_factura: '',
    placas: '',
    tarjeta_circulacion: '',
  });

  const [scanning, setScanning] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [documentComment, setDocumentComment] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (vehicle) {
      setFormData({
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        anio: vehicle.anio.toString(),
        precio: vehicle.precio.toString(),
        num_serie: vehicle.num_serie,
        color: vehicle.color,
        num_motor: vehicle.num_motor,
        num_factura: vehicle.num_factura || '',
        placas: vehicle.placas || '',
        tarjeta_circulacion: vehicle.tarjeta_circulacion || '',
      });
    } else {
      setFormData({
        marca: '',
        modelo: '',
        anio: '',
        precio: '',
        num_serie: '',
        color: '',
        num_motor: '',
        num_factura: '',
        placas: '',
        tarjeta_circulacion: '',
      });
    }
    setErrors({});
  }, [vehicle, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const currentYear = new Date().getFullYear();

    if (!formData.marca.trim()) newErrors.marca = 'La marca es requerida';
    if (!formData.modelo.trim()) newErrors.modelo = 'El modelo es requerido';
    if (!formData.anio) {
      newErrors.anio = 'El año es requerido';
    } else {
      const year = Number(formData.anio);
      if (year < 1900 || year > currentYear + 1) {
        newErrors.anio = `El año debe estar entre 1900 y ${currentYear + 1}`;
      }
    }
    if (!formData.precio) {
      newErrors.precio = 'El precio es requerido';
    } else if (Number(formData.precio) <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    }
    if (!formData.num_serie.trim()) {
      newErrors.num_serie = 'El número de serie es requerido';
    } else if (formData.num_serie.length !== 17) {
      newErrors.num_serie = 'El número de serie debe tener 17 caracteres';
    }
    if (!formData.color.trim()) newErrors.color = 'El color es requerido';
    if (!formData.num_motor.trim()) newErrors.num_motor = 'El número de motor es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    try {
      setIsSubmitting(true);
      const vehicleData: CreateVehiculoDto = {
        marca: formData.marca,
        modelo: formData.modelo,
        anio: Number(formData.anio),
        precio: Number(formData.precio),
        num_serie: formData.num_serie,
        color: formData.color,
        num_motor: formData.num_motor,
        num_factura: formData.num_factura || undefined,
        placas: formData.placas || undefined,
        tarjeta_circulacion: formData.tarjeta_circulacion || undefined
      };

      await onSave(vehicleData);
      onClose();
    } catch (error) {
      console.error('Error al guardar vehículo:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el vehículo. Por favor, intente de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentDocument({
        url: 'https://example.com/scanned-doc.pdf',
        tipo_documento: documentType,
        descripcion: documentComment
      });
      toast({
        title: "Éxito",
        description: "Documento escaneado correctamente",
      });
    } catch (error) {
      console.error('Error scanning document:', error);
      toast({
        title: "Error",
        description: "Error al escanear el documento. Por favor, intente de nuevo.",
        variant: "destructive"
      });
    } finally {
      setScanning(false);
    }
  };

  const handleRescan = () => {
    setCurrentDocument(null);
    handleScan();
  };

  const handleDeleteScan = () => {
    setCurrentDocument(null);
    setDocumentComment('');
    setDocumentType('');
  };

  const handleSaveDocument = async () => {
    if (!currentDocument) return;
    
    try {
      console.log('Saving document:', {
        ...currentDocument,
        descripcion: documentComment
      });
      
      toast({
        title: "Éxito",
        description: "Documento guardado correctamente",
      });
      handleDeleteScan();
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Error",
        description: "Error al guardar el documento. Por favor, intente de nuevo.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <FaCar className="h-5 w-5" />
            {vehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/40 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300/60 [&::-webkit-scrollbar-track]:bg-slate-100/50 transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="marca" className="text-sm font-medium flex items-center gap-2">
                  <FaCar className="h-4 w-4" />
                  Marca
                </label>
                <Input
                  id="marca"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  required
                  className={errors.marca ? 'border-red-500' : ''}
                />
                {errors.marca && (
                  <p className="text-sm text-red-500">{errors.marca}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="modelo" className="text-sm font-medium flex items-center gap-2">
                  <FaCar className="h-4 w-4" />
                  Modelo
                </label>
                <Input
                  id="modelo"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  required
                  className={errors.modelo ? 'border-red-500' : ''}
                />
                {errors.modelo && (
                  <p className="text-sm text-red-500">{errors.modelo}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="anio" className="text-sm font-medium flex items-center gap-2">
                  <BsCalendarDate className="h-4 w-4" />
                  Año
                </label>
                <Input
                  id="anio"
                  name="anio"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.anio}
                  onChange={handleChange}
                  required
                  className={errors.anio ? 'border-red-500' : ''}
                />
                {errors.anio && (
                  <p className="text-sm text-red-500">{errors.anio}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="precio" className="text-sm font-medium flex items-center gap-2">
                  <MdAttachMoney className="h-4 w-4" />
                  Precio
                </label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  min="0"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  className={errors.precio ? 'border-red-500' : ''}
                />
                {errors.precio && (
                  <p className="text-sm text-red-500">{errors.precio}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="num_serie" className="text-sm font-medium flex items-center gap-2">
                  <MdQrCode className="h-4 w-4" />
                  Número de Serie
                </label>
                <Input
                  id="num_serie"
                  name="num_serie"
                  value={formData.num_serie}
                  onChange={handleChange}
                  required
                  className={errors.num_serie ? 'border-red-500' : ''}
                />
                {errors.num_serie && (
                  <p className="text-sm text-red-500">{errors.num_serie}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="color" className="text-sm font-medium flex items-center gap-2">
                  <IoColorPalette className="h-4 w-4" />
                  Color
                </label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  required
                  className={errors.color ? 'border-red-500' : ''}
                />
                {errors.color && (
                  <p className="text-sm text-red-500">{errors.color}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="num_motor" className="text-sm font-medium flex items-center gap-2">
                  <GiCarWheel className="h-4 w-4" />
                  Número de Motor
                </label>
                <Input
                  id="num_motor"
                  name="num_motor"
                  value={formData.num_motor}
                  onChange={handleChange}
                  required
                  className={errors.num_motor ? 'border-red-500' : ''}
                />
                {errors.num_motor && (
                  <p className="text-sm text-red-500">{errors.num_motor}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="num_factura" className="text-sm font-medium flex items-center gap-2">
                  <RiFileList3Line className="h-4 w-4" />
                  Número de Factura
                </label>
                <Input
                  id="num_factura"
                  name="num_factura"
                  value={formData.num_factura}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="placas" className="text-sm font-medium flex items-center gap-2">
                  <BsCardText className="h-4 w-4" />
                  Placas
                </label>
                <Input
                  id="placas"
                  name="placas"
                  value={formData.placas}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="tarjeta_circulacion" className="text-sm font-medium flex items-center gap-2">
                  <MdCardMembership className="h-4 w-4" />
                  Tarjeta de Circulación
                </label>
                <Input
                  id="tarjeta_circulacion"
                  name="tarjeta_circulacion"
                  value={formData.tarjeta_circulacion}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <RiFileTextLine className="h-5 w-5" />
                Documentos del Vehículo
              </h3>
              
              {!currentDocument ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="documentType" className="text-sm font-medium flex items-center gap-2">
                      <RiFileTextLine className="h-4 w-4" />
                      Tipo de Documento
                    </label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo de documento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="factura">Factura</SelectItem>
                        <SelectItem value="tarjeta_circulacion">Tarjeta de Circulación</SelectItem>
                        <SelectItem value="identificacion">Identificación</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    type="button"
                    onClick={handleScan}
                    disabled={scanning || !documentType}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Escaneando...
                      </>
                    ) : (
                      <>
                        <MdDocumentScanner className="h-4 w-4" />
                        Escanear Documento
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm mb-2">Documento escaneado exitosamente</p>
                    <div className="space-y-2">
                      <label htmlFor="documentComment" className="text-sm font-medium flex items-center gap-2">
                        <RiFileTextLine className="h-4 w-4" />
                        Comentarios
                      </label>
                      <Textarea
                        id="documentComment"
                        value={documentComment}
                        onChange={(e) => setDocumentComment(e.target.value)}
                        placeholder="Agregar comentarios sobre el documento..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleRescan} className="flex items-center gap-2">
                      <MdRefresh className="h-4 w-4" />
                      Reescanear
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDeleteScan} className="flex items-center gap-2">
                      <MdDelete className="h-4 w-4" />
                      Eliminar
                    </Button>
                    <Button 
                      type="button"
                      onClick={handleSaveDocument}
                      disabled={!documentComment}
                      className="ml-auto flex items-center gap-2"
                    >
                      <MdSave className="h-4 w-4" />
                      Guardar Documento
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t mt-auto">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex items-center gap-2"
              disabled={isSubmitting}
            >
              <MdClose className="h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MdSave className="h-4 w-4" />
              )}
              {vehicle ? 'Guardar Cambios' : 'Agregar Vehículo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}