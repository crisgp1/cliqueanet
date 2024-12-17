import { SetStateAction, useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { InventoryModal } from '@/components/modals/InventoryModal';
import { vehiculoService, type Vehiculo } from '@/services/vehiculo.service';
import { toast } from '@/components/ui/use-toast';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState<Vehiculo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehiculo | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cargar vehículos al montar el componente
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await vehiculoService.getAll();
      setVehicles(response);
      toast({
        title: "Éxito",
        description: "Vehículos cargados correctamente",
      });
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los vehículos. Por favor, intente de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.num_serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vehicle.placas && vehicle.placas.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSave = async (vehicleData: Omit<Vehiculo, 'id_vehiculo'>) => {
    try {
      setIsProcessing(true);
      if (selectedVehicle) {
        // Editar vehículo existente
        const updatedVehicle = await vehiculoService.update(selectedVehicle.id_vehiculo, vehicleData);
        setVehicles(vehicles.map(veh => 
          veh.id_vehiculo === selectedVehicle.id_vehiculo ? updatedVehicle : veh
        ));
        toast({
          title: "Éxito",
          description: "Vehículo actualizado correctamente",
        });
      } else {
        // Crear nuevo vehículo
        const newVehicle = await vehiculoService.create(vehicleData);
        setVehicles([...vehicles, newVehicle]);
        toast({
          title: "Éxito",
          description: "Vehículo creado correctamente",
        });
      }
      setIsModalOpen(false);
      setSelectedVehicle(undefined);
    } catch (error) {
      console.error('Error al guardar vehículo:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el vehículo. Por favor, verifique los datos e intente de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (vehicle: Vehiculo) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = async (vehicleId: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este vehículo?')) {
      try {
        setIsProcessing(true);
        await vehiculoService.delete(vehicleId);
        setVehicles(vehicles.filter(veh => veh.id_vehiculo !== vehicleId));
        toast({
          title: "Éxito",
          description: "Vehículo eliminado correctamente",
        });
      } catch (error) {
        console.error('Error al eliminar vehículo:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el vehículo. Por favor, intente de nuevo.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleAddNew = () => {
    setSelectedVehicle(undefined);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventario</h2>
          <p className="text-muted-foreground">
            Gestiona la información de los vehículos del sistema
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700" 
          onClick={handleAddNew}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Nuevo Vehículo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Vehículos</CardTitle>
          <CardDescription>
            Total de vehículos registrados: {vehicles.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por marca, modelo, número de serie o placas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Año</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Número de Serie</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Número de Motor</TableHead>
                  <TableHead>Número de Factura</TableHead>
                  <TableHead>Placas</TableHead>
                  <TableHead>Tarjeta de Circulación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-4">
                      No se encontraron vehículos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id_vehiculo}>
                      <TableCell className="font-medium">{vehicle.id_vehiculo}</TableCell>
                      <TableCell>{vehicle.marca}</TableCell>
                      <TableCell>{vehicle.modelo}</TableCell>
                      <TableCell>{vehicle.anio}</TableCell>
                      <TableCell>{vehicle.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                      <TableCell>{vehicle.num_serie}</TableCell>
                      <TableCell>{vehicle.color}</TableCell>
                      <TableCell>{vehicle.num_motor}</TableCell>
                      <TableCell>{vehicle.num_factura}</TableCell>
                      <TableCell>{vehicle.placas}</TableCell>
                      <TableCell>{vehicle.tarjeta_circulacion}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleEdit(vehicle)}
                          disabled={isProcessing}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(vehicle.id_vehiculo)}
                          disabled={isProcessing}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVehicle(undefined);
        }}
        onSave={handleSave}
        vehicle={selectedVehicle}
      />
    </div>
  );
}