import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import BookingForm from './BookingForm';

// Types for services and professionals handled by the scheduler
interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface Professional {
  id: string;
  displayName: string;
  title: string;
  photoURL?: string;
}

interface Props {
  professional: Professional;
  services: Service[];
}

// Component that guides the user through selecting a service, date and time
export default function Scheduler({ professional, services }: Props) {
  // Track selections and booking status
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fetch availability when user selects a new day or service
  useEffect(() => {
    if (!selectedDay || !selectedService) {
      setAvailableSlots([]);
      return;
    };
    const fetchAvailability = async () => {
      setIsLoading(true);
      setAvailableSlots([]);
      setSelectedSlot(null);
      try {
        const response = await fetch('/api/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: selectedDay.toISOString(),
            professionalId: professional.id,
            serviceId: selectedService.id,
          }),
        });
        if (!response.ok) throw new Error('Error al buscar disponibilidad');
        const slots: string[] = await response.json();
        setAvailableSlots(slots.map(slot => new Date(slot)));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, [selectedDay, selectedService, professional.id]);

  // Handlers for user interactions
  const handleSelectService = (service: Service | null) => {
    setSelectedService(service);
    setSelectedDay(undefined);
    setSelectedSlot(null);
    setBookingSuccess(false);
  };
  const handleDaySelect = (date: Date | undefined) => { if (date) { setSelectedDay(date); setBookingSuccess(false); } };
  const handleSlotSelect = (slot: Date) => { setSelectedSlot(slot); setBookingSuccess(false); };
  const handleBookingSuccess = () => { setBookingSuccess(true); };

  // Show confirmation when booking is completed
  if (bookingSuccess) {
    return (
      <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-2xl font-bold text-green-700">¡Cita Agendada!</h2>
        <p className="mt-2 text-gray-600">Tu solicitud ha sido enviada. Recibirás una confirmación por correo.</p>
      </div>
    );
  }

  // Render scheduler interface
  return (
    <div className="w-full">
      <header className="bg-primary-700 p-5 flex items-center gap-4 rounded-xl -mx-10 -mt-10 mb-8 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-8 -right-2 w-24 h-24 bg-white/5 rounded-full"></div>

        <img
          src={professional.photoURL || '/doctor-placeholder.svg'}
          alt={`Foto de ${professional.displayName}`}
          className="w-16 h-16 rounded-full border-2 border-white object-cover shadow-lg"
        />
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{professional.displayName}</h1>
          <p className="text-sm text-primary-200">{professional.title}</p>
        </div>
      </header>

      {!selectedService ? (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">1. Selecciona un servicio</h2>
            <p className="text-sm text-gray-500 mt-1">Elige uno para ver los horarios disponibles.</p>
          </div>

          <div className="space-y-3">
            {services.map(service => (
              <div key={service.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Servicio</p>
                  <h3 className="font-bold text-gray-800">{service.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{service.duration} minutos</p>
                  <p className="text-sm font-semibold text-primary-700 mt-1">
                    {service.price > 0 ? `$${service.price.toLocaleString('es-CL')}` : 'Sin costo'}
                  </p>
                </div>
                <button
                  onClick={() => handleSelectService(service)}
                  className="bg-primary-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                >
                  Elegir
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>
          <p>Calendario y formulario irán aquí...</p>
        </div>
      )}
    </div>
  );
}
