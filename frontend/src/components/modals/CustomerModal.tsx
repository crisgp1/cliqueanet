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

// Interfaz según el DDL
interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: any) => void;
  cliente?: {
    id_cliente?: number;  // SERIAL en DB, no se envía en create
    nombre: string;       // VARCHAR(100) NOT NULL
    id_tipo_identificacion: number;  // INTEGER con FK
    num_identificacion: string;      // VARCHAR(50) NOT NULL
    fecha_nacimiento: string;        // DATE NOT NULL
    telefono: string;                // VARCHAR(20) NOT NULL
    correo: string;                  // VARCHAR(100) NOT NULL
    domicilio: string;               // VARCHAR(200) NOT NULL
    curp: string;                    // VARCHAR(18) NOT NULL
  };
}

export function CustomerModal({ isOpen, onClose, onSave, cliente }: CustomerModalProps) {
  const [formData, setFormData] = useState({
    nombre: cliente?.nombre || '',
    id_tipo_identificacion: cliente?.id_tipo_identificacion || '',
    num_identificacion: cliente?.num_identificacion || '',
    fecha_nacimiento: cliente?.fecha_nacimiento ? new Date(cliente.fecha_nacimiento).toISOString().split('T')[0] : '',
    telefono: cliente?.telefono || '',
    correo: cliente?.correo || '',
    domicilio: cliente?.domicilio || '',
    curp: cliente?.curp || '',
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
      id_tipo_identificacion: customType 
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
                {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
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
                   onChange={handleIdentificationTypeChange}
                   required
                   className="border border-gray-300 rounded-md p-2 w-full bg-white"
                  >
                   <option value="" disabled hidden>
                     Seleccione una opción
                   </option>
                   <option value="1">INE</option>
                   <option value="2">Pasaporte</option>
                   <option value="3">Licencia de Conducir</option>
                   <option value="4">Cédula profesional</option>
                   <option value="Otro">Otro</option>
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
                    value={formData.fecha_nacimiento}
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
                <div className="md:col-span-2 space-y-2">
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
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {cliente ? 'Guardar Cambios' : 'Crear Cliente'}
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
              value={formData.id_tipo_identificacion === 'Otro' ? '' : formData.id_tipo_identificacion}
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
              if (formData.id_tipo_identificacion && formData.id_tipo_identificacion !== 'Otro') {
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