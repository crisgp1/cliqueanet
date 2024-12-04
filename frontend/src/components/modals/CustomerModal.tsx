import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: any) => void;
  customer?: {
    customer_id?: number;
    name: string;
    identification_type: string;
    identification_number: string;
    birth_date: string;
    phone: string;
    email: string;
    address: string;
    curp: string;
  };
}

export function CustomerModal({ isOpen, onClose, onSave, customer }: CustomerModalProps) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    identification_type: customer?.identification_type || '',
    identification_number: customer?.identification_number || '',
    birth_date: customer?.birth_date ? new Date(customer.birth_date).toISOString().split('T')[0] : '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    curp: customer?.curp || '',
  });

  const [isCustomIdentificationModalOpen, setIsCustomIdentificationModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIdentificationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (value === 'Otro') {
      setIsCustomIdentificationModalOpen(true);
    } else {
      handleChange(e);
    }
  };

  const handleCustomIdentificationSave = (customType: string) => {
    setFormData(prev => ({ 
      ...prev, 
      identification_type: customType 
    }));
    setIsCustomIdentificationModalOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nombre
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                 <label htmlFor="identification_type" className="text-sm font-medium">
                   Tipo de Identificación
                 </label>
                 <select
                   id="identification_type"
                   name="identification_type"
                   value={formData.identification_type}
                   onChange={handleIdentificationTypeChange}
                   required
                   className="border border-gray-300 rounded-md p-2 w-full bg-white"
                  >
                   <option value="" disabled hidden>
                     Seleccione una opción
                   </option>
                   <option value="INE">INE</option>
                   <option value="Pasaporte">Pasaporte</option>
                   <option value="Licencia de Conducir">Licencia de Conducir</option>
                   <option value="FM3">FM3</option>
                   <option value="Otro">Otro</option>
                </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="identification_number" className="text-sm font-medium">
                    Número de Identificación
                  </label>
                  <Input
                    id="identification_number"
                    name="identification_number"
                    value={formData.identification_number}
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
                  <label htmlFor="birth_date" className="text-sm font-medium">
                    Fecha Nacimiento
                  </label>
                  <Input
                    id="birth_date"
                    name="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Teléfono
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Correo
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    Domicilio
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
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
                {customer ? 'Guardar Cambios' : 'Crear Cliente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomIdentificationModalOpen} onOpenChange={() => setIsCustomIdentificationModalOpen(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ingrese el Tipo de Identificación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Escriba el tipo de identificación"
              value={formData.identification_type === 'Otro' ? '' : formData.identification_type}
              onChange={(e) => {
                const customType = e.target.value;
                handleCustomIdentificationSave(customType);
              }}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCustomIdentificationModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => {
              if (formData.identification_type && formData.identification_type !== 'Otro') {
                setIsCustomIdentificationModalOpen(false);
              }
            }}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}