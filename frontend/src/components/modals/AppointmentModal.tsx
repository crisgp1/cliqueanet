import { useState } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { BaseModal } from "../ui/base-modal";
import { 
  FaUser, 
  FaCar, 
  FaCalendar, 
  FaClock, 
  FaMapMarkerAlt, 
  FaClipboardList 
} from 'react-icons/fa';

interface Appointment {
  id_cita?: number;
  id_empleado_creador: number;
  id_contacto: number;
  id_vehiculo?: number;
  tipo_cita: string;
  fecha: string;
  hora: string;
  lugar: string;
  reagendaciones: number;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Omit<Appointment, 'id_cita'>) => void;
  appointment?: Appointment;
  currentEmployeeId: number;
}

export function AppointmentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  appointment,
  currentEmployeeId
}: AppointmentModalProps) {
  const [formData, setFormData] = useState({
    id_empleado_creador: appointment?.id_empleado_creador || currentEmployeeId,
    id_contacto: appointment?.id_contacto || '',
    id_vehiculo: appointment?.id_vehiculo || '',
    tipo_cita: appointment?.tipo_cita || '',
    fecha: appointment?.fecha || '',
    hora: appointment?.hora || '',
    lugar: appointment?.lugar || '',
    reagendaciones: appointment?.reagendaciones || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const appointmentData = {
      id_empleado_creador: Number(formData.id_empleado_creador),
      id_contacto: Number(formData.id_contacto),
      id_vehiculo: formData.id_vehiculo ? Number(formData.id_vehiculo) : undefined,
      tipo_cita: formData.tipo_cita,
      fecha: formData.fecha,
      hora: formData.hora,
      lugar: formData.lugar,
      reagendaciones: Number(formData.reagendaciones)
    };

    onSave(appointmentData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isValidDate = (date: string) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  const isValidTime = (time: string) => {
    if (!time) return false;
    const [hours, minutes] = time.split(':').map(Number);
    return hours >= 9 && (hours < 18 || (hours === 18 && minutes === 0));
  };

  const canReschedule = formData.reagendaciones < 3;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <FaCalendar className="text-gray-500" />
          {appointment ? 'Editar Cita' : 'Nueva Cita'}
        </div>
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FaUser className="text-gray-500" />
              Contacto
            </label>
            <Input
              name="id_contacto"
              type="number"
              value={formData.id_contacto}
              onChange={handleChange}
              required
              placeholder="ID del contacto"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FaCar className="text-gray-500" />
              Vehículo (Opcional)
            </label>
            <Input
              name="id_vehiculo"
              type="number"
              value={formData.id_vehiculo}
              onChange={handleChange}
              placeholder="ID del vehículo"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FaClipboardList className="text-gray-500" />
              Tipo de Cita
            </label>
            <select
              name="tipo_cita"
              value={formData.tipo_cita}
              onChange={handleChange}
              required
              className="w-full border rounded-md p-2"
            >
              <option value="" disabled>Seleccionar tipo</option>
              <option value="venta">Venta</option>
              <option value="revision">Revisión</option>
              <option value="entrega">Entrega</option>
              <option value="seguimiento">Seguimiento</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FaCalendar className="text-gray-500" />
              Fecha
            </label>
            <Input
              name="fecha"
              type="date"
              value={formData.fecha}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
            {formData.fecha && !isValidDate(formData.fecha) && (
              <p className="text-sm text-red-500">
                La fecha debe ser igual o posterior a hoy
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FaClock className="text-gray-500" />
              Hora
            </label>
            <Input
              name="hora"
              type="time"
              value={formData.hora}
              onChange={handleChange}
              required
              min="09:00"
              max="18:00"
              step="900"
            />
            {formData.hora && !isValidTime(formData.hora) && (
              <p className="text-sm text-red-500">
                El horario debe estar entre 9:00 y 18:00
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-500" />
              Lugar
            </label>
            <Input
              name="lugar"
              value={formData.lugar}
              onChange={handleChange}
              required
              placeholder="Dirección o lugar de la cita"
            />
          </div>

          {appointment && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FaClipboardList className="text-gray-500" />
                Reagendaciones
              </label>
              <Input
                name="reagendaciones"
                type="number"
                value={formData.reagendaciones}
                disabled
                className="bg-gray-50"
              />
              {!canReschedule && (
                <p className="text-sm text-red-500">
                  No se pueden hacer más reagendaciones
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={
              !isValidDate(formData.fecha) || 
              !isValidTime(formData.hora) ||
              (appointment && !canReschedule)
            }
          >
            {appointment ? 'Guardar Cambios' : 'Crear Cita'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}