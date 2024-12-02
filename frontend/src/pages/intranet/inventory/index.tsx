import { SetStateAction, useState } from 'react';
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
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { InventoryModal } from '@/components/modals/InventoryModal';

interface Vehicle {
  id_vehiculo: number;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  num_serie: string;
  color: string;
  num_motor: string;
  num_factura?: string;
  placas?: string;
  tarjeta_circulacion?: string;
}

const vehiclesMock: Vehicle[] = [
  {
    id_vehiculo: 1,
    marca: "Toyota",
    modelo: "Corolla",
    anio: 2020,
    precio: 20000,
    num_serie: "JTDBT923481234567",
    color: "Blanco",
    num_motor: "1NZ-FE1234567",
    num_factura: "FA-2020-001",
    placas: "ABC-123",
    tarjeta_circulacion: "TC-2020-001"
  },
  {
    id_vehiculo: 2,
    marca: "Honda",
    modelo: "Civic",
    anio: 2019,
    precio: 18000,
    num_serie: "2HGFC2F56KH123456",
    color: "Gris",
    num_motor: "R18A1-9876543",
    num_factura: "FA-2019-002",
    placas: "DEF-456",
    tarjeta_circulacion: "TC-2019-002"
  }
];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>(vehiclesMock);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>(undefined);

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (vehicleData: Omit<Vehicle, 'id_vehiculo'>) => {
    if (selectedVehicle) {
      // Editar vehículo existente
      setVehicles(vehicles.map(veh => 
        veh.id_vehiculo === selectedVehicle.id_vehiculo 
          ? { ...vehicleData, id_vehiculo: selectedVehicle.id_vehiculo }
          : veh
      ));
    } else {
      // Crear nuevo vehículo
      const newVehicle = {
        ...vehicleData,
        id_vehiculo: vehicles.length > 0 
          ? Math.max(...vehicles.map(v => v.id_vehiculo)) + 1 
          : 1
      };
      setVehicles([...vehicles, newVehicle]);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = (vehicleId: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este vehículo?')) {
      setVehicles(vehicles.filter(veh => veh.id_vehiculo !== vehicleId));
    }
  };

  const handleAddNew = () => {
    setSelectedVehicle(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventario</h2>
          <p className="text-muted-foreground">
            Gestiona la información de los vehículos del sistema
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
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
                placeholder="Buscar vehículo por marca o modelo..."
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
                {filteredVehicles.map((vehicle) => (
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
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(vehicle.id_vehiculo)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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