import React, { useState } from 'react';
import { Truck, Car, PlusCircle, Edit, Trash2 } from 'lucide-react';

// Vehicle interface matching the database schema
interface Vehicle {
  id_vehiculo?: number;
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

const Inventario: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle>({
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    precio: 0,
    num_serie: '',
    color: '',
    num_motor: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentVehicle(prev => ({
      ...prev,
      [name]: name === 'anio' || name === 'precio' ? Number(value) : value
    }));
  };

  const addOrUpdateVehicle = () => {
    if (isEditing) {
      // Update existing vehicle
      setVehicles(prev => 
        prev.map(v => v.id_vehiculo === currentVehicle.id_vehiculo ? currentVehicle : v)
      );
    } else {
      // Add new vehicle
      setVehicles(prev => [...prev, { 
        ...currentVehicle, 
        id_vehiculo: prev.length + 1 
      }]);
    }
    
    // Reset form
    setCurrentVehicle({
      marca: '',
      modelo: '',
      anio: new Date().getFullYear(),
      precio: 0,
      num_serie: '',
      color: '',
      num_motor: ''
    });
    setIsEditing(false);
  };

  const editVehicle = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle);
    setIsEditing(true);
  };

  const deleteVehicle = (id: number | undefined) => {
    setVehicles(prev => prev.filter(v => v.id_vehiculo !== id));
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center mb-6">
        <Truck className="mr-4 text-blue-600" size={40} />
        <h1 className="text-3xl font-bold text-gray-800">Inventario de Vehículos</h1>
      </div>
      
      {/* Vehicle Entry Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Editar Vehículo' : 'Agregar Nuevo Vehículo'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="marca"
            placeholder="Marca"
            value={currentVehicle.marca}
            onChange={handleInputChange}
            className="input border rounded p-2"
          />
          <input
            type="text"
            name="modelo"
            placeholder="Modelo"
            value={currentVehicle.modelo}
            onChange={handleInputChange}
            className="input border rounded p-2"
          />
          <input
            type="number"
            name="anio"
            placeholder="Año"
            value={currentVehicle.anio}
            onChange={handleInputChange}
            className="input border rounded p-2"
          />
          <input
            type="number"
            name="precio"
            placeholder="Precio"
            value={currentVehicle.precio}
            onChange={handleInputChange}
            className="input border rounded p-2"
          />
          <input
            type="text"
            name="num_serie"
            placeholder="Número de Serie"
            value={currentVehicle.num_serie}
            onChange={handleInputChange}
            className="input border rounded p-2"
          />
          <input
            type="text"
            name="color"
            placeholder="Color"
            value={currentVehicle.color}
            onChange={handleInputChange}
            className="input border rounded p-2"
          />
          <input
            type="text"
            name="num_motor"
            placeholder="Número de Motor"
            value={currentVehicle.num_motor}
            onChange={handleInputChange}
            className="input border rounded p-2"
          />
          <div className="col-span-full flex justify-end">
            <button 
              onClick={addOrUpdateVehicle}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition flex items-center"
            >
              <PlusCircle className="mr-2" size={20} />
              {isEditing ? 'Actualizar Vehículo' : 'Agregar Vehículo'}
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="bg-white shadow-md rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Marca</th>
              <th className="p-3 text-left">Modelo</th>
              <th className="p-3 text-left">Año</th>
              <th className="p-3 text-left">Precio</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id_vehiculo} className="border-b hover:bg-gray-100">
                <td className="p-3">{vehicle.marca}</td>
                <td className="p-3">{vehicle.modelo}</td>
                <td className="p-3">{vehicle.anio}</td>
                <td className="p-3">${vehicle.precio.toLocaleString()}</td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => editVehicle(vehicle)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={20} />
                    </button>
                    <button 
                      onClick={() => deleteVehicle(vehicle.id_vehiculo)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventario;