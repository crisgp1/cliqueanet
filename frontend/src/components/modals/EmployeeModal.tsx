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

interface UsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (usuario: any) => void;
  usuario?: {
    id_empleado?: number;  // SERIAL en DB, no se envía en create
    nombre: string;        // VARCHAR(100) NOT NULL
    id_tipo_identificacion: number;  // INTEGER con FK
    num_identificacion: string;      // VARCHAR(50) NOT NULL
    curp: string;                    // VARCHAR(18) NOT NULL
    fecha_nacimiento: string;        // DATE NOT NULL
    telefono: string;                // VARCHAR(20) NOT NULL
    correo: string;                  // VARCHAR(100) NOT NULL
    domicilio: string;               // VARCHAR(200) NOT NULL
    fecha_contratacion: string;      // DATE NOT NULL
    id_rol: number;                  // INTEGER NOT NULL con FK
  };
}

export function EmployeeModal({ isOpen, onClose, onSave, usuario }: UsuarioModalProps) {
  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    id_tipo_identificacion: usuario?.id_tipo_identificacion || '',
    num_identificacion: usuario?.num_identificacion || '',
    curp: usuario?.curp || '',
    fecha_nacimiento: usuario?.fecha_nacimiento ? new Date(usuario.fecha_nacimiento).toISOString().split('T')[0] : '',
    telefono: usuario?.telefono || '',
    correo: usuario?.correo || '',
    domicilio: usuario?.domicilio || '',
    fecha_contratacion: usuario?.fecha_contratacion ? new Date(usuario.fecha_contratacion).toISOString().split('T')[0] : '',
    id_rol: usuario?.id_rol || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {usuario ? 'Editar Empleado' : 'Nuevo Empleado'}
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
                 onChange={handleChange}
                 required
                 className="border border-gray-300 rounded-md p-2 w-full bg-white"
                >
                 <option value="" disabled hidden>
                   Seleccione una opción
                 </option>
                 <option value="1">INE</option>
                 <option value="2">Pasaporte</option>
                 <option value="3">Cédula profesional</option>
                 <option value="4">Licencia de conducir</option>
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
                  value={formData.fecha_contratacion}
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
                  className="border border-gray-300 rounded-md p-2 w-full bg-white"
                >
                  <option value="" disabled hidden>
                    Seleccione un rol
                  </option>
                  <option value="1">Administrador</option>
                  <option value="2">Ventas</option>
                  <option value="3">RRHH</option>
                  <option value="4">Gerente_general</option>
                  <option value="5">Capturista</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {usuario ? 'Guardar Cambios' : 'Crear Empleado'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

