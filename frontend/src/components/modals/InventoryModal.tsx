import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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