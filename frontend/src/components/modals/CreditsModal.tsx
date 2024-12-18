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
import creditoService, { Credito, CreateCreditoDto } from '@/services/credito.service';
import vehiculoService, { Vehiculo } from '@/services/vehiculo.service';
import { toast } from '@/components/ui/use-toast';
import { Search, Car } from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (credito: Credito) => void;
  credito?: Credito;
}

export function CreditsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  credito 
}: CreditsModalProps) {
  const [formData, setFormData] = useState<CreateCreditoDto>({
    clienteId: 0,
    vehiculoId: 0,
    montoTotal: 0,
    plazo: 12,
    tasaInteres: 12, // Tasa de interés predeterminada del 12%
    fechaInicio: new Date(),
    estado: 'pendiente'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'serie' | 'placas' | 'motor'>('serie');
  const [searchResults, setSearchResults] = useState<Vehiculo[]>([]);
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (credito) {
      setFormData({
        clienteId: credito.clienteId,
        vehiculoId: credito.vehiculoId,
        montoTotal: credito.montoTotal,
        plazo: credito.plazo,
        tasaInteres: credito.tasaInteres,
        fechaInicio: new Date(credito.fechaInicio),
        estado: credito.estado
      });
    }
  }, [credito, isOpen]);

  const handleSearch = async () => {
    if (!searchTerm) return;
    
    setSearching(true);
    try {
      let result: Vehiculo | null = null;
      
      switch (searchType) {
        case 'serie':
          result = await vehiculoService.getByNumSerie(searchTerm);
          break;
        case 'placas':
          result = await vehiculoService.getByPlacas(searchTerm);
          break;
        case 'motor':
          result = await vehiculoService.getByNumMotor(searchTerm);
          break;
      }

      if (result) {
        setSearchResults([result]);
      } else {
        setSearchResults([]);
        toast({
          title: "No encontrado",
          description: "No se encontró ningún vehículo con los datos proporcionados",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error al buscar vehículo:', error);
      toast({
        title: "Error",
        description: "Error al buscar el vehículo",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  const selectVehiculo = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setFormData(prev => ({
      ...prev,
      vehiculoId: vehiculo.id_vehiculo,
      montoTotal: vehiculo.precio * 0.8 // Línea de crédito: 80% del valor del vehículo
    }));
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehiculo) {
      toast({
        title: "Error",
        description: "Debe seleccionar un vehículo",
        variant: "destructive"
      });
      return;
    }

    try {
      let savedCredito: Credito;
      
      if (credito?.id) {
        savedCredito = await creditoService.actualizarCredito(credito.id, formData);
        toast({
          title: "Éxito",
          description: "Crédito actualizado correctamente",
        });
      } else {
        savedCredito = await creditoService.crearCredito(formData);
        toast({
          title: "Éxito",
          description: "Crédito creado correctamente",
        });
      }

      if (onSave) {
        onSave(savedCredito);
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar el crédito:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el crédito",
        variant: "destructive"
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fechaInicio' ? new Date(value) : 
              ['montoTotal', 'plazo', 'tasaInteres', 'clienteId'].includes(name) ? 
              Number(value) : value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {credito ? 'Editar Crédito' : 'Nuevo Crédito'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar Vehículo</label>
                <div className="flex gap-2">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as 'serie' | 'placas' | 'motor')}
                    className="border rounded-md p-2"
                  >
                    <option value="serie">Número de Serie</option>
                    <option value="placas">Placas</option>
                    <option value="motor">Número de Motor</option>
                  </select>
                  <div className="flex-1 relative">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={`Buscar por ${searchType}`}
                    />
                  </div>
                  <Button type="button" onClick={handleSearch} disabled={searching}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="border rounded-md p-2 space-y-2">
                  {searchResults.map((vehiculo) => (
                    <div
                      key={vehiculo.id_vehiculo}
                      className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                      onClick={() => selectVehiculo(vehiculo)}
                    >
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span>
                          {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio} - {vehiculo.color}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ${vehiculo.precio.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {selectedVehiculo && (
                <div className="border rounded-md p-3 bg-gray-50">
                  <h4 className="font-medium mb-2">Vehículo Seleccionado</h4>
                  <p>{selectedVehiculo.marca} {selectedVehiculo.modelo} {selectedVehiculo.anio}</p>
                  <p className="text-sm text-gray-600">
                    Serie: {selectedVehiculo.num_serie} | 
                    Placas: {selectedVehiculo.placas || 'N/A'} | 
                    Motor: {selectedVehiculo.num_motor}
                  </p>
                  <p className="text-sm text-gray-600">
                    Valor: ${selectedVehiculo.precio.toLocaleString()}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="clienteId" className="text-sm font-medium">
                  ID Cliente
                </label>
                <Input
                  id="clienteId"
                  name="clienteId"
                  type="number"
                  value={formData.clienteId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="montoTotal" className="text-sm font-medium">
                  Línea de Crédito
                </label>
                <Input
                  id="montoTotal"
                  name="montoTotal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.montoTotal}
                  onChange={handleChange}
                  required
                />
                {selectedVehiculo && (
                  <p className="text-sm text-gray-500">
                    Monto sugerido: hasta ${(selectedVehiculo.precio * 0.8).toLocaleString()} (80% del valor)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="plazo" className="text-sm font-medium">
                    Plazo (meses)
                  </label>
                  <Input
                    id="plazo"
                    name="plazo"
                    type="number"
                    min="1"
                    value={formData.plazo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="tasaInteres" className="text-sm font-medium">
                    Tasa de Interés Anual (%)
                  </label>
                  <Input
                    id="tasaInteres"
                    name="tasaInteres"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.tasaInteres}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="fechaInicio" className="text-sm font-medium">
                  Fecha de Inicio
                </label>
                <Input
                  id="fechaInicio"
                  name="fechaInicio"
                  type="date"
                  value={formData.fechaInicio.toISOString().split('T')[0]}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {credito ? 'Guardar Cambios' : 'Crear Crédito'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}