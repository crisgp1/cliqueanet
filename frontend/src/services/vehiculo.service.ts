const API_URL = 'http://localhost:3001/api/v1';

export interface Vehicle {
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

export const vehiculoService = {
  // Obtener todos los vehículos
  getAll: async (): Promise<Vehicle[]> => {
    const response = await fetch(`${API_URL}/vehiculos`);
    if (!response.ok) {
      throw new Error('Error al obtener vehículos');
    }
    return response.json();
  },

  // Obtener un vehículo por ID
  getById: async (id: number): Promise<Vehicle> => {
    const response = await fetch(`${API_URL}/vehiculos/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener vehículo');
    }
    return response.json();
  },

  // Crear un nuevo vehículo
  create: async (vehicle: Omit<Vehicle, 'id_vehiculo'>): Promise<Vehicle> => {
    const response = await fetch(`${API_URL}/vehiculos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vehicle),
    });
    if (!response.ok) {
      throw new Error('Error al crear vehículo');
    }
    return response.json();
  },

  // Actualizar un vehículo
  update: async (id: number, vehicle: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await fetch(`${API_URL}/vehiculos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vehicle),
    });
    if (!response.ok) {
      throw new Error('Error al actualizar vehículo');
    }
    return response.json();
  },

  // Eliminar un vehículo
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/vehiculos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar vehículo');
    }
  },
};