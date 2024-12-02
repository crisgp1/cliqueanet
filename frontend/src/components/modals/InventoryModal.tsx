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
  });

  // Efecto para actualizar el formulario cuando cambia el vehículo seleccionado
  useEffect(() => {
    if (vehicle) {
      setFormData({
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        anio: vehicle.anio.toString(),
        precio: vehicle.precio.toString(),
      });
    } else {
      // Resetear formulario si no hay vehículo seleccionado
      setFormData({
        marca: '',
        modelo: '',
        anio: '',
        precio: '',
      });
    }
  }, [vehicle, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que todos los campos estén llenos
    if (!formData.marca || !formData.modelo || !formData.anio || !formData.precio) {
      alert('Por favor, complete todos los campos');
      return;
    }

    // Convertir a números y guardar
    const vehicleData = {
      marca: formData.marca,
      modelo: formData.modelo,
      anio: Number(formData.anio),
      precio: Number(formData.precio)
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
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {vehicle ? 'Guardar Cambios' : 'Crear Vehículo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}