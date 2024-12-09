import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { AppointmentModal } from '../../../components/modals/AppointmentModal';
import { AppointmentDetailsModal } from '../../../components/modals/AppointmentDetailsModal';
import { 
  FaCalendarPlus, 
  FaSearch, 
  FaClock, 
  FaUser, 
  FaCar, 
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEye
} from 'react-icons/fa';

interface Appointment {
  id_cita: number;
  id_empleado_creador: number;
  id_contacto: number;
  id_vehiculo?: number;
  tipo_cita: string;
  fecha: string;
  hora: string;
  lugar: string;
  estado: string;
  reagendaciones: number;
  contacto: {
    nombre: string;
    telefono: string;
    correo: string;
  };
  vehiculo?: {
    marca: string;
    modelo: string;
    anio: number;
  };
  empleado: {
    id_empleado: number;
    nombre: string;
  };
}

interface Filters {
  search: string;
  type: string;
  status: string;
}

// Mock employees data
const mockEmployees = [
  { id_empleado: 1, nombre: 'Juan Pérez' },
  { id_empleado: 2, nombre: 'María García' },
  { id_empleado: 3, nombre: 'Carlos López' },
];

export default function AppointmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    type: 'all',
    status: 'all',
  });

  // Mock data - replace with API call
  const appointments: Appointment[] = [
    {
      id_cita: 1,
      id_empleado_creador: 1,
      id_contacto: 1,
      tipo_cita: 'venta',
      fecha: '2024-01-20',
      hora: '10:00',
      lugar: 'Oficina principal',
      estado: 'pendiente',
      reagendaciones: 0,
      contacto: {
        nombre: 'Juan Pérez',
        telefono: '555-1234',
        correo: 'juan@example.com'
      },
      id_vehiculo: 1,
      vehiculo: {
        marca: 'Toyota',
        modelo: 'Corolla',
        anio: 2022,
      },
      empleado: {
        id_empleado: 1,
        nombre: 'Carlos Vendedor'
      }
    },
  ];

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredAppointments = appointments.filter(appointment => {
    const searchMatch = 
      appointment.contacto.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
      appointment.lugar.toLowerCase().includes(filters.search.toLowerCase());
    
    const typeMatch = filters.type === 'all' || appointment.tipo_cita === filters.type;
    const statusMatch = filters.status === 'all' || appointment.estado === filters.status;

    return searchMatch && typeMatch && statusMatch;
  });

  const getAppointmentsForDate = (dateStr: string) => {
    return appointments.filter(appointment => appointment.fecha === dateStr);
  };

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleAttend = () => {
    if (selectedAppointment) {
      // Update appointment status to 'completada'
      console.log('Marcando cita como completada:', selectedAppointment.id_cita);
      setSelectedAppointment(null);
    }
  };

  const handleCancel = () => {
    if (selectedAppointment) {
      // Update appointment status to 'cancelada'
      console.log('Cancelando cita:', selectedAppointment.id_cita);
      setSelectedAppointment(null);
    }
  };

  const handleReschedule = (newEmployeeId: number) => {
    if (selectedAppointment) {
      // Update appointment with new employee and increment reagendaciones
      console.log('Reagendando cita:', {
        citaId: selectedAppointment.id_cita,
        nuevoEmpleadoId: newEmployeeId,
        reagendaciones: selectedAppointment.reagendaciones + 1
      });
      setSelectedAppointment(null);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Citas</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <FaCalendarPlus />
          Nueva Cita
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-gray-500" />
              </div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {selectedDateAppointments.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold">Citas para {new Date(selectedDate).toLocaleDateString()}</h3>
                <div className="space-y-2">
                  {selectedDateAppointments.map(appointment => (
                    <div 
                      key={appointment.id_cita} 
                      className="p-2 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100"
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <div className="flex items-center gap-2">
                        <FaClock className="text-gray-500" />
                        <span>{appointment.hora}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-500" />
                        <span>{appointment.contacto.nombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-gray-500" />
                        <span>{appointment.lugar}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <FaSearch className="text-gray-500" />
                <Input
                  placeholder="Buscar..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="all">Todos los tipos</option>
                <option value="venta">Venta</option>
                <option value="revision">Revisión</option>
                <option value="entrega">Entrega</option>
                <option value="seguimiento">Seguimiento</option>
              </select>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="completada">Completadas</option>
                <option value="cancelada">Canceladas</option>
                <option value="reagendada">Reagendadas</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Lugar</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => {
                  const getStatusStyle = (status: string) => {
                    switch (status) {
                      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
                      case 'completada': return 'bg-green-100 text-green-800';
                      case 'cancelada': return 'bg-red-100 text-red-800';
                      case 'reagendada': return 'bg-blue-100 text-blue-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };

                  return (
                    <TableRow key={appointment.id_cita}>
                      <TableCell>{appointment.fecha}</TableCell>
                      <TableCell>{appointment.hora}</TableCell>
                      <TableCell>
                        <div>
                          <div>{appointment.contacto.nombre}</div>
                          <div className="text-sm text-gray-500">{appointment.contacto.telefono}</div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{appointment.tipo_cita}</TableCell>
                      <TableCell>{appointment.lugar}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(appointment.estado)}`}>
                          {appointment.estado}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAppointmentClick(appointment)}
                          className="flex items-center gap-2"
                        >
                          <FaEye className="text-gray-500" />
                          Ver detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => {
          console.log('Saving appointment:', data);
          setIsModalOpen(false);
        }}
        currentEmployeeId={1} // Replace with actual logged-in employee ID
      />

      {selectedAppointment && (
        <AppointmentDetailsModal
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          appointment={selectedAppointment}
          onAttend={handleAttend}
          onCancel={handleCancel}
          onReschedule={handleReschedule}
          employees={mockEmployees}
        />
      )}
    </div>
  );
}