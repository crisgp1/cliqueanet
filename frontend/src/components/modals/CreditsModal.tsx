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

interface Credit {
  id_credito: number;
  id_cliente: number;
  cantidad: number;
  comentarios?: string;
  id_documento?: number;
  id_vehiculo?: number;
}

interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (credit: Omit<Credit, 'id_credito'>) => void;
  credit?: Credit;
}

export function CreditsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  credit 
}: CreditModalProps) {
  const [formData, setFormData] = useState({
    id_cliente: '',
    cantidad: '',
    comentarios: '',
    id_documento: '',
    id_vehiculo: '',
  });

  // Effect to update form when selected credit changes
  useEffect(() => {
    if (credit) {
      setFormData({
        id_cliente: credit.id_cliente.toString(),
        cantidad: credit.cantidad.toString(),
        comentarios: credit.comentarios || '',
        id_documento: credit.id_documento?.toString() || '',
        id_vehiculo: credit.id_vehiculo?.toString() || '',
      });
    } else {
      // Reset form if no credit is selected
      setFormData({
        id_cliente: '',
        cantidad: '',
        comentarios: '',
        id_documento: '',
        id_vehiculo: '',
      });
    }
  }, [credit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert to numbers and save
    const creditData = {
      id_cliente: Number(formData.id_cliente),
      cantidad: Number(formData.cantidad),
      comentarios: formData.comentarios || undefined,
      id_documento: formData.id_documento ? Number(formData.id_documento) : undefined,
      id_vehiculo: formData.id_vehiculo ? Number(formData.id_vehiculo) : undefined
    };

    onSave(creditData);
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
              {credit ? 'Editar Crédito' : 'Nuevo Crédito'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="id_cliente" className="text-sm font-medium">
                  ID Cliente
                </label>
                <Input
                  id="id_cliente"
                  name="id_cliente"
                  type="number"
                  value={formData.id_cliente}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="cantidad" className="text-sm font-medium">
                  Cantidad
                </label>
                <Input
                  id="cantidad"
                  name="cantidad"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cantidad}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="id_documento" className="text-sm font-medium">
                  ID Documento (Opcional)
                </label>
                <Input
                  id="id_documento"
                  name="id_documento"
                  type="number"
                  value={formData.id_documento}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="id_vehiculo" className="text-sm font-medium">
                  ID Vehículo (Opcional)
                </label>
                <Input
                  id="id_vehiculo"
                  name="id_vehiculo"
                  type="number"
                  value={formData.id_vehiculo}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-full space-y-2">
                <label htmlFor="comentarios" className="text-sm font-medium">
                  Comentarios
                </label>
                <Input
                  id="comentarios"
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleChange}
                  placeholder="Comentarios adicionales (opcional)"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {credit ? 'Guardar Cambios' : 'Agregar Crédito'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}