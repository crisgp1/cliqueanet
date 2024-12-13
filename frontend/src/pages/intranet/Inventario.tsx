import React, { useState, useEffect } from 'react';
import { Truck, Edit, Trash2, PlusCircle } from 'lucide-react';
import { InventoryModal } from '../../components/modals/InventoryModal';
import { vehiculoService, type Vehiculo } from '../../services/vehiculo.service';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/use-toast';

const Inventario: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehiculo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehiculo | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const data = await vehiculoService.getAll();
      setVehicles(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los vehículos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (vehicle?: Vehiculo) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedVehicle(undefined);
    setIsModalOpen(false);
  };

  const handleSaveVehicle = async (vehicleData: Omit<Vehiculo, 'id_vehiculo'>) => {
    try {
      if (selectedVehicle?.id_vehiculo) {
        // Update existing vehicle
        await vehiculoService.update(selectedVehicle.id_vehiculo, vehicleData);
        toast({
          title: "Éxito",
          description: "Vehículo actualizado correctamente"
        });
      } else {
        // Create new vehicle
        await vehiculoService.create(vehicleData);
        toast({
          title: "Éxito",
          description: "Vehículo agregado correctamente"
        });
      }
      // Refresh the vehicles list
      await fetchVehicles();
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar el vehículo",
        variant: "destructive"
      });
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este vehículo?')) {
      try {
        await vehiculoService.delete(id);
        toast({
          title: "Éxito",
          description: "Vehículo eliminado correctamente"
        });
        await fetchVehicles();
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al eliminar el vehículo",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Truck className="mr-4 text-blue-600" size={40} />
          <h1 className="text-3xl font-bold text-gray-800">Inventario de Vehículos</h1>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" />
          Agregar Vehículo
        </Button>
      </div>

      {/* Vehicle List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Marca</th>
                <th className="p-3 text-left">Modelo</th>
                <th className="p-3 text-left">Año</th>
                <th className="p-3 text-left">Color</th>
                <th className="p-3 text-left">Precio</th>
                <th className="p-3 text-left">Número de Serie</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id_vehiculo} className="border-b hover:bg-gray-50">
                  <td className="p-3">{vehicle.marca}</td>
                  <td className="p-3">{vehicle.modelo}</td>
                  <td className="p-3">{vehicle.anio}</td>
                  <td className="p-3">{vehicle.color}</td>
                  <td className="p-3">${vehicle.precio.toLocaleString()}</td>
                  <td className="p-3">{vehicle.num_serie}</td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(vehicle)}
                        className="text-blue-500 hover:text-blue-700 h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteVehicle(vehicle.id_vehiculo)}
                        className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && vehicles.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-3 text-center text-gray-500">
                    No hay vehículos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vehicle Modal */}
      <InventoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveVehicle}
        vehicle={selectedVehicle}
      />
    </div>
  );
};

export default Inventario;