import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { FaCalendar, FaUser, FaCar, FaMoneyBillWave, FaFileContract, FaUserTie } from 'react-icons/fa';
import { toast } from "../../components/ui/use-toast";
import clienteService, { Cliente } from '../../services/cliente.service';
import vehiculoService, { Vehiculo } from '../../services/vehiculo.service';
import { authService } from '../../services/auth.service';
import transaccionService, { CreateTransaccionDto, UpdateTransaccionDto, Transaccion } from '../../services/transaccion.service';
import tipoTransaccionService from '../../services/tipo-transaccion.service';
import { TipoTransaccion } from '../../types';

interface TransaccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaccion: Transaccion) => void;
  transaccion?: Transaccion;
}

interface FormState {
  fechaTransaccion: string;
  createData: CreateTransaccionDto;
}

export const TransactionsModal: React.FC<TransaccionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  transaccion 
}) => {
  const [step, setStep] = useState<'form' | 'preview' | 'confirm'>('form');
  const [formState, setFormState] = useState<FormState>({
    fechaTransaccion: transaccion?.fecha?.toString().split('T')[0] || new Date().toISOString().split('T')[0],
    createData: {
      idUsuario: transaccion?.idUsuario || authService.getCurrentUser()?.id || 0,
      idCliente: transaccion?.idCliente || 0,
      idVehiculo: transaccion?.idVehiculo || 0,
      idCredito: transaccion?.idCredito,
      idTipoTransaccion: transaccion?.idTipoTransaccion || 0
    }
  });
  const [confirmationInput, setConfirmationInput] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [tiposTransaccion, setTiposTransaccion] = useState<TipoTransaccion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientesData, vehiculosData, tiposTransaccionData] = await Promise.all([
          clienteService.getAll(),
          vehiculoService.getAll(),
          tipoTransaccionService.getAll()
        ]);
        setClientes(clientesData);
        setVehiculos(vehiculosData);
        setTiposTransaccion(tiposTransaccionData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos necesarios",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('preview');
  };

  const handleConfirm = async () => {
    const currentUser = authService.getCurrentUser();
    if (confirmationInput === currentUser?.id.toString()) {
      try {
        let savedTransaccion: Transaccion;
        if (transaccion?.id) {
          savedTransaccion = await transaccionService.update(transaccion.id, formState.createData);
        } else {
          savedTransaccion = await transaccionService.create(formState.createData);
        }
        onSave(savedTransaccion);
        toast({
          title: "Éxito",
          description: `Transacción ${transaccion?.id ? 'actualizada' : 'creada'} correctamente`,
        });
        onClose();
      } catch (error) {
        console.error('Error al guardar transacción:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar la transacción",
          variant: "destructive"
        });
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'fechaTransaccion') {
      setFormState(prev => ({ ...prev, fechaTransaccion: value }));
    } else {
      setFormState(prev => ({
        ...prev,
        createData: { ...prev.createData, [name]: value }
      }));
    }
  };

  const selectedCliente = clientes.find(c => c.id === Number(formState.createData.idCliente));
  const selectedVehiculo = vehiculos.find(v => v.id_vehiculo === Number(formState.createData.idVehiculo));
  const selectedTipoTransaccion = tiposTransaccion.find(t => t.id === Number(formState.createData.idTipoTransaccion));

  if (!isOpen) return null;
  if (loading) return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="flex justify-center items-center h-40">
          Cargando...
        </div>
      </DialogContent>
    </Dialog>
  );

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
                    value={authService.getCurrentUser()?.nombre || ''}
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                {/* Fecha */}
                <div className="space-y-2">
                  <label htmlFor="fechaTransaccion" className="text-sm font-medium flex items-center gap-2">
                    <FaCalendar className="text-gray-500" />
                    Fecha
                  </label>
                  <Input
                    id="fechaTransaccion"
                    name="fechaTransaccion"
                    type="date"
                    value={formState.fechaTransaccion}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Cliente */}
                <div className="space-y-2">
                  <label htmlFor="idCliente" className="text-sm font-medium flex items-center gap-2">
                    <FaUser className="text-gray-500" />
                    Cliente
                  </label>
                  <select
                    id="idCliente"
                    name="idCliente"
                    value={formState.createData.idCliente}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-md p-2"
                  >
                    <option value="">Seleccione un cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} - {cliente.curp}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vehículo */}
                <div className="space-y-2">
                  <label htmlFor="idVehiculo" className="text-sm font-medium flex items-center gap-2">
                    <FaCar className="text-gray-500" />
                    Vehículo
                  </label>
                  <select
                    id="idVehiculo"
                    name="idVehiculo"
                    value={formState.createData.idVehiculo}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-md p-2"
                  >
                    <option value="">Seleccione un vehículo</option>
                    {vehiculos.map(vehiculo => (
                      <option key={vehiculo.id_vehiculo} value={vehiculo.id_vehiculo}>
                        {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio} - {vehiculo.color}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Transacción */}
                <div className="space-y-2">
                  <label htmlFor="idTipoTransaccion" className="text-sm font-medium flex items-center gap-2">
                    <FaFileContract className="text-gray-500" />
                    Tipo de Transacción
                  </label>
                  <select
                    id="idTipoTransaccion"
                    name="idTipoTransaccion"
                    value={formState.createData.idTipoTransaccion}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-md p-2"
                  >
                    <option value="">Seleccione tipo</option>
                    {tiposTransaccion.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Crédito (opcional) */}
                <div className="space-y-2">
                  <label htmlFor="idCredito" className="text-sm font-medium flex items-center gap-2">
                    <FaMoneyBillWave className="text-gray-500" />
                    Crédito (Opcional)
                  </label>
                  <Input
                    id="idCredito"
                    name="idCredito"
                    type="number"
                    value={formState.createData.idCredito || ''}
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
                <p><strong>Fecha:</strong> {formState.fechaTransaccion}</p>
                <p><strong>Usuario:</strong> {authService.getCurrentUser()?.nombre}</p>
                <p><strong>Cliente:</strong> {selectedCliente?.nombre}</p>
                <p><strong>Vehículo:</strong> {selectedVehiculo?.marca} {selectedVehiculo?.modelo} {selectedVehiculo?.anio}</p>
                <p><strong>Tipo de Transacción:</strong> {selectedTipoTransaccion?.nombre}</p>
                {formState.createData.idCredito && <p><strong>ID Crédito:</strong> {formState.createData.idCredito}</p>}
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmationInput(e.target.value)}
                placeholder="Número de empleado"
              />
              <Button 
                onClick={handleConfirm}
                className="w-full"
                disabled={confirmationInput !== authService.getCurrentUser()?.id.toString()}
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