import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaCalendar, FaUser, FaCar, FaMoneyBillWave, FaFileContract, FaUserTie } from 'react-icons/fa';

// Mock data temporal
const mockClientes = [
  { id_cliente: 1, nombre: 'Ana López', curp: 'LOPA900101MDFXXX01' },
  { id_cliente: 2, nombre: 'Carlos Ruiz', curp: 'RUIC880305HDFXXX02' }
];

const mockVehiculos = [
  { 
    id_vehiculo: 5, 
    marca: 'Toyota', 
    modelo: 'Corolla', 
    anio: 2022,
    precio: 350000.00,
    num_serie: 'TOY123456789',
    color: 'Blanco'
  },
  { 
    id_vehiculo: 7, 
    marca: 'Honda', 
    modelo: 'Civic', 
    anio: 2023,
    precio: 420000.00,
    num_serie: 'HON987654321',
    color: 'Negro'
  }
];

const mockTiposTransaccion = [
  { id_tipo_transaccion: 1, nombre: 'Venta' },
  { id_tipo_transaccion: 2, nombre: 'Apartado' },
  { id_tipo_transaccion: 3, nombre: 'Credito' },
  { id_tipo_transaccion: 4, nombre: 'Traspaso' },
  { id_tipo_transaccion: 5, nombre: 'Cambio' }
];

interface TransaccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaccion: any) => void;
  transaccion?: {
    id_transaccion?: number;
    fecha: string;
    id_usuario: number;
    id_cliente: number;
    id_vehiculo: number;
    id_credito?: number;
    id_tipo_transaccion: number;
  };
}

export const TransactionsModal: React.FC<TransaccionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  transaccion 
}) => {
  const [step, setStep] = useState<'form' | 'preview' | 'confirm'>('form');
  const [formData, setFormData] = useState({
    fecha: transaccion?.fecha || new Date().toISOString().split('T')[0],
    id_usuario: 1001, // ID del usuario actual (mock)
    id_cliente: transaccion?.id_cliente || '',
    id_vehiculo: transaccion?.id_vehiculo || '',
    id_credito: transaccion?.id_credito || '',
    id_tipo_transaccion: transaccion?.id_tipo_transaccion || ''
  });
  const [confirmationInput, setConfirmationInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('preview');
  };

  const handleConfirm = () => {
    if (confirmationInput === '1001') {
      onSave(formData);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectedCliente = mockClientes.find(c => c.id_cliente === Number(formData.id_cliente));
  const selectedVehiculo = mockVehiculos.find(v => v.id_vehiculo === Number(formData.id_vehiculo));
  const selectedTipoTransaccion = mockTiposTransaccion.find(t => t.id_tipo_transaccion === Number(formData.id_tipo_transaccion));

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        {step === 'form' && (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {transaccion ? 'Editar Transacción' : 'Nueva Transacción'}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Usuario actual (bloqueado) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FaUserTie className="text-gray-500" />
                    Usuario Actual
                  </label>
                  <Input
                    value="1001"
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                {/* Fecha */}
                <div className="space-y-2">
                  <label htmlFor="fecha" className="text-sm font-medium flex items-center gap-2">
                    <FaCalendar className="text-gray-500" />
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

                {/* Cliente */}
                <div className="space-y-2">
                  <label htmlFor="id_cliente" className="text-sm font-medium flex items-center gap-2">
                    <FaUser className="text-gray-500" />
                    Cliente
                  </label>
                  <select
                    id="id_cliente"
                    name="id_cliente"
                    value={formData.id_cliente}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-md p-2"
                  >
                    <option value="">Seleccione un cliente</option>
                    {mockClientes.map(cliente => (
                      <option key={cliente.id_cliente} value={cliente.id_cliente}>
                        {cliente.nombre} - {cliente.curp}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vehículo */}
                <div className="space-y-2">
                  <label htmlFor="id_vehiculo" className="text-sm font-medium flex items-center gap-2">
                    <FaCar className="text-gray-500" />
                    Vehículo
                  </label>
                  <select
                    id="id_vehiculo"
                    name="id_vehiculo"
                    value={formData.id_vehiculo}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-md p-2"
                  >
                    <option value="">Seleccione un vehículo</option>
                    {mockVehiculos.map(vehiculo => (
                      <option key={vehiculo.id_vehiculo} value={vehiculo.id_vehiculo}>
                        {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio} - {vehiculo.color}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Transacción */}
                <div className="space-y-2">
                  <label htmlFor="id_tipo_transaccion" className="text-sm font-medium flex items-center gap-2">
                    <FaFileContract className="text-gray-500" />
                    Tipo de Transacción
                  </label>
                  <select
                    id="id_tipo_transaccion"
                    name="id_tipo_transaccion"
                    value={formData.id_tipo_transaccion}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-md p-2"
                  >
                    <option value="">Seleccione tipo</option>
                    {mockTiposTransaccion.map(tipo => (
                      <option key={tipo.id_tipo_transaccion} value={tipo.id_tipo_transaccion}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Crédito (opcional) */}
                <div className="space-y-2">
                  <label htmlFor="id_credito" className="text-sm font-medium flex items-center gap-2">
                    <FaMoneyBillWave className="text-gray-500" />
                    Crédito (Opcional)
                  </label>
                  <Input
                    id="id_credito"
                    name="id_credito"
                    type="number"
                    value={formData.id_credito}
                    onChange={handleChange}
                    placeholder="ID del crédito si aplica"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Previsualizar
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'preview' && (
          <>
            <DialogHeader>
              <DialogTitle>Previsualización de Transacción</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><strong>Fecha:</strong> {formData.fecha}</p>
                <p><strong>Usuario:</strong> ID: {formData.id_usuario}</p>
                <p><strong>Cliente:</strong> {selectedCliente?.nombre}</p>
                <p><strong>Vehículo:</strong> {selectedVehiculo?.marca} {selectedVehiculo?.modelo} {selectedVehiculo?.anio}</p>
                <p><strong>Tipo de Transacción:</strong> {selectedTipoTransaccion?.nombre}</p>
                {formData.id_credito && <p><strong>ID Crédito:</strong> {formData.id_credito}</p>}
              </div>
              <Button 
                onClick={() => setStep('confirm')}
                className="w-full"
              >
                Confirmar y Proceder
              </Button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle>Confirmar Transacción</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-gray-600">
                Para confirmar la transacción, ingrese su número de empleado:
              </p>
              <Input
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder="Número de empleado"
              />
              <Button 
                onClick={handleConfirm}
                className="w-full"
                disabled={confirmationInput !== '1001'}
              >
                Confirmar y Guardar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

