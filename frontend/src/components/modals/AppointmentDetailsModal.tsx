import { useState } from 'react';
import { Button } from "../ui/button";
import { BaseModal } from "../ui/base-modal";
import { Input } from "../ui/input";
import { 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaCar, 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaRedo,
  FaUserTie
} from 'react-icons/fa';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id_cita: number;
    fecha: string;
    hora: string;
    lugar: string;
    tipo_cita: string;
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
  };
  onAttend: () => void;
  onCancel: () => void;
  onReschedule: (newEmployeeId: number) => void;
  employees: Array<{ id_empleado: number; nombre: string; }>;
}

export function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  onAttend,
  onCancel,
  onReschedule,
  employees
}: AppointmentDetailsModalProps) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(appointment.empleado.id_empleado);

  const handleCall = () => {
    window.location.href = `tel:${appointment.contacto.telefono}`;
  };

  const handleReschedule = () => {
    if (isRescheduling && selectedEmployeeId) {
      onReschedule(selectedEmployeeId);
      setIsRescheduling(false);
    } else {
      setIsRescheduling(true);
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'completada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      case 'reagendada': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-500" />
            <span>Detalles de la Cita</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.estado)}`}>
            {appointment.estado}
          </span>
        </div>
      }
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Cliente Info */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <FaUser className="text-gray-500" />
            Información del Cliente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Nombre</span>
              <p className="font-medium">{appointment.contacto.nombre}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Teléfono</span>
              <p className="font-medium">{appointment.contacto.telefono}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm text-gray-500">Correo</span>
              <p className="font-medium">{appointment.contacto.correo}</p>
            </div>
          </div>
        </div>

        {/* Appointment Info */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <FaCalendarAlt className="text-gray-500" />
            Información de la Cita
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Fecha</span>
              <p className="font-medium flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400" />
                {appointment.fecha}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Hora</span>
              <p className="font-medium flex items-center gap-2">
                <FaClock className="text-gray-400" />
                {appointment.hora}
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm text-gray-500">Lugar</span>
              <p className="font-medium flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-400" />
                {appointment.lugar}
              </p>
            </div>
            {appointment.vehiculo && (
              <div className="md:col-span-2">
                <span className="text-sm text-gray-500">Vehículo</span>
                <p className="font-medium flex items-center gap-2">
                  <FaCar className="text-gray-400" />
                  {`${appointment.vehiculo.marca} ${appointment.vehiculo.modelo} (${appointment.vehiculo.anio})`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Employee Selection for Rescheduling */}
        {isRescheduling && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <FaUserTie className="text-gray-500" />
              Seleccionar Nuevo Empleado
            </h3>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
              className="w-full border rounded-md p-2"
            >
              {employees.map(emp => (
                <option key={emp.id_empleado} value={emp.id_empleado}>
                  {emp.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onAttend}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            disabled={appointment.estado === 'completada' || appointment.estado === 'cancelada'}
          >
            <FaCheck />
            Asistió
          </Button>
          <Button
            onClick={handleCall}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <FaPhone />
            Llamar
          </Button>
          <Button
            onClick={handleReschedule}
            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700"
            disabled={
              appointment.estado === 'completada' || 
              appointment.estado === 'cancelada' || 
              appointment.reagendaciones >= 3
            }
          >
            <FaRedo />
            {isRescheduling ? 'Confirmar Reagendación' : 'Reagendar'}
          </Button>
          <Button
            onClick={onCancel}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
            disabled={appointment.estado === 'completada' || appointment.estado === 'cancelada'}
          >
            <FaTimes />
            Cancelar Cita
          </Button>
        </div>

        {appointment.reagendaciones > 0 && (
          <p className="text-sm text-gray-500">
            Esta cita ha sido reagendada {appointment.reagendaciones} {appointment.reagendaciones === 1 ? 'vez' : 'veces'}
          </p>
        )}
      </div>
    </BaseModal>
  );
}