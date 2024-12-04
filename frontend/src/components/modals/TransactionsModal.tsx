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

// Mock data for dropdowns (you'll replace these with actual API calls)
const mockClientes = [
  { id_cliente: 1, nombre: 'Ana López' },
  { id_cliente: 2, nombre: 'Carlos Ruiz' }
];

const mockVehiculos = [
  { id_vehiculo: 5, modelo: 'Toyota Corolla 2022' },
  { id_vehiculo: 7, modelo: 'Honda Civic 2023' }
];

const mockTiposTransaccion = [
  { id_tipo_transaccion: 1, nombre: 'Venta' },
  { id_tipo_transaccion: 2, nombre: 'Crédito' }
];

const mockCreditos = [
  { id_credito: 3, descripcion: 'Crédito 12 meses' },
  { id_credito: null, descripcion: 'N/A' }
];

interface TransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
  transaction?: {
    id_transaccion?: number;
    fecha: string;
    id_usuario: number;
    id_cliente: number;
    id_vehiculo: number;
    id_credito?: number | null;
    id_tipo_transaccion: number;
  };
}

export function TransactionsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  transaction 
}: TransactionsModalProps) {
  const [formData, setFormData] = useState({
    fecha: transaction?.fecha ? new Date(transaction.fecha).toISOString().split('T')[0] : '',
    id_usuario: transaction?.id_usuario || 1, // Default to current user
    id_cliente: transaction?.id_cliente || 0,
    id_vehiculo: transaction?.id_vehiculo || 0,
    id_credito: transaction?.id_credito || null,
    id_tipo_transaccion: transaction?.id_tipo_transaccion || 0
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        fecha: new Date(transaction.fecha).toISOString().split('T')[0],
        id_usuario: transaction.id_usuario,
        id_cliente: transaction.id_cliente,
        id_vehiculo: transaction.id_vehiculo,
        id_credito: transaction.id_credito || null,
        id_tipo_transaccion: transaction.id_tipo_transaccion
      });
    } else {
      // Reset form when creating a new transaction
      setFormData({
        fecha: '',
        id_usuario: 1,
        id_cliente: 0,
        id_vehiculo: 0,
        id_credito: null,
        id_tipo_transaccion: 0
      });
    }
  }, [transaction, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fecha || formData.id_cliente === 0 || 
        formData.id_vehiculo === 0 || formData.id_tipo_transaccion === 0) {
      alert('Por favor complete todos los campos requeridos.');
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'id_credito' ? (value === '' ? null : Number(value)) : 
              ['id_cliente', 'id_vehiculo', 'id_tipo_transaccion', 'id_usuario'].includes(name) ? Number(value) : value 
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {transaction ? 'Editar Transacción' : 'Nueva Transacción'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="fecha" className="text-sm font-medium">
                  Fecha
                </label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="id_cliente" className="text-sm font-medium">
                  Cliente
                </label>
                <select
                  id="id_cliente"
                  name="id_cliente"
                  value={formData.id_cliente}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 rounded-md p-2 w-full"
                >
                  <option value={0} disabled>Seleccione un cliente</option>
                  {mockClientes.map(cliente => (
                    <option key={cliente.id_cliente} value={cliente.id_cliente}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="id_vehiculo" className="text-sm font-medium">
                  Vehículo
                </label>
                <select
                  id="id_vehiculo"
                  name="id_vehiculo"
                  value={formData.id_vehiculo}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 rounded-md p-2 w-full"
                >
                  <option value={0} disabled>Seleccione un vehículo</option>
                  {mockVehiculos.map(vehiculo => (
                    <option key={vehiculo.id_vehiculo} value={vehiculo.id_vehiculo}>
                      {vehiculo.modelo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="id_tipo_transaccion" className="text-sm font-medium">
                  Tipo de Transacción
                </label>
                <select
                  id="id_tipo_transaccion"
                  name="id_tipo_transaccion"
                  value={formData.id_tipo_transaccion}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 rounded-md p-2 w-full"
                >
                  <option value={0} disabled>Seleccione un tipo</option>
                  {mockTiposTransaccion.map(tipo => (
                    <option key={tipo.id_tipo_transaccion} value={tipo.id_tipo_transaccion}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="id_credito" className="text-sm font-medium">
                  Crédito
                </label>
                <select
                  id="id_credito"
                  name="id_credito"
                  value={formData.id_credito || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                >
                  <option value="">Seleccione un crédito (opcional)</option>
                  {mockCreditos.map(credito => (
                    <option 
                      key={credito.id_credito || 'null'} 
                      value={credito.id_credito || ''}
                    >
                      {credito.descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {transaction ? 'Guardar Cambios' : 'Crear Transacción'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}