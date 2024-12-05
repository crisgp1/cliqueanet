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

interface Vehicle {
  id_vehiculo: number;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  num_serie: string;
  color: string;
  num_motor: string;
  num_factura?: string;
  placas?: string;
  tarjeta_circulacion?: string;
}

interface Document {
  id_documento?: number;
  url: string;
  tipo_documento: string;
  descripcion: string;
}

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Omit<Vehicle, 'id_vehiculo'>) => void;
  vehicle?: Vehicle;
}

export function InventoryModal({ 
  isOpen, 
  onClose, 
  onSave, 
  vehicle 
}: VehicleModalProps) {
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

  // Effect to update form when selected vehicle changes
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
      // Reset form if no vehicle is selected
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
  }, [vehicle, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert to numbers and save
    const vehicleData = {
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

    onSave(vehicleData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      // Simulate scanning process
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Mock scanned document
      setCurrentDocument({
        url: 'https://example.com/scanned-doc.pdf',
        tipo_documento: documentType,
        descripcion: documentComment
      });
    } catch (error) {
      console.error('Error scanning document:', error);
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
      // Here you would typically make an API call to save the document
      console.log('Saving document:', {
        ...currentDocument,
        descripcion: documentComment
      });
      
      // Reset form after successful save
      handleDeleteScan();
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {vehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="marca" className="text-sm font-medium">
                  Marca
                </label>
                <Input
                  id="marca"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="modelo" className="text-sm font-medium">
                  Modelo
                </label>
                <Input
                  id="modelo"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="anio" className="text-sm font-medium">
                  Año
                </label>
                <Input
                  id="anio"
                  name="anio"
                  type="number"
                  min="1900"
                  max="2100"
                  value={formData.anio}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="precio" className="text-sm font-medium">
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
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="num_serie" className="text-sm font-medium">
                  Número de Serie
                </label>
                <Input
                  id="num_serie"
                  name="num_serie"
                  value={formData.num_serie}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="color" className="text-sm font-medium">
                  Color
                </label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="num_motor" className="text-sm font-medium">
                  Número de Motor
                </label>
                <Input
                  id="num_motor"
                  name="num_motor"
                  value={formData.num_motor}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="num_factura" className="text-sm font-medium">
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
                <label htmlFor="placas" className="text-sm font-medium">
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
                <label htmlFor="tarjeta_circulacion" className="text-sm font-medium">
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

            {/* Document Scanning Section */}
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Documentos del Vehículo</h3>
              
              {!currentDocument ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="documentType" className="text-sm font-medium">
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
                    className="w-full"
                  >
                    {scanning ? 'Escaneando...' : 'Escanear Documento'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm mb-2">Documento escaneado exitosamente</p>
                    <div className="space-y-2">
                      <label htmlFor="documentComment" className="text-sm font-medium">
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
                    <Button type="button" variant="outline" onClick={handleRescan}>
                      Reescanear
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDeleteScan}>
                      Eliminar
                    </Button>
                    <Button 
                      type="button"
                      onClick={handleSaveDocument}
                      disabled={!documentComment}
                      className="ml-auto"
                    >
                      Guardar Documento
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {vehicle ? 'Guardar Cambios' : 'Agregar Vehículo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}