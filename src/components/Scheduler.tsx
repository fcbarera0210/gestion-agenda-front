import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import BookingForm from './BookingForm'; // 👈 1. Importamos el nuevo formulario

// ... (Las interfaces Service y Props no cambian) ...
interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface Props {
  professionalId: string | undefined;
  services: Service[];
}

export default function Scheduler({ professionalId, services }: Props) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false); // 👈 2. Nuevo estado para el mensaje de éxito

  // ... (El useEffect para fetchAvailability no cambia) ...
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
            professionalId: professionalId,
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
  }, [selectedDay, selectedService]);

  const handleSelectService = (service: Service | null) => {
    setSelectedService(service);
    setSelectedDay(undefined);
    setSelectedSlot(null);
    setBookingSuccess(false); // 👈 3. Reseteamos el estado de éxito al cambiar de servicio
  };
  
  const handleDaySelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDay(date);
      setBookingSuccess(false); // Reseteamos por si el usuario cambia de día
    }
  };

  const handleSlotSelect = (slot: Date) => {
    setSelectedSlot(slot);
    setBookingSuccess(false); // Reseteamos por si el usuario cambia de horario
  };

  // 👈 4. Función que se llamará desde BookingForm cuando la reserva sea exitosa
  const handleBookingSuccess = () => {
    setBookingSuccess(true);
  };

  // Si la reserva fue exitosa, mostramos un mensaje y terminamos.
  if (bookingSuccess) {
    return (
      <div className="mt-12 text-center p-8 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-2xl font-bold text-green-700">¡Cita Agendada!</h2>
        <p className="mt-2 text-gray-600">
          Tu solicitud ha sido enviada correctamente. Recibirás un correo electrónico con la confirmación.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      {/* SECCIÓN 1: SELECCIÓN DE SERVICIO (Sin cambios) */}
      {!selectedService ? (
        <>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">1. Selecciona un servicio</h2>
          <p className="text-gray-500 mb-6">Elige uno de los servicios a continuación para ver los horarios disponibles.</p>
          <div className="space-y-4">
            {services.map(service => (
              <div key={service.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                  <p className="text-sm text-gray-500">{service.duration} minutos · ${service.price.toLocaleString('es-CL')}</p>
                </div>
                <button 
                  onClick={() => handleSelectService(service)}
                  className="bg-purple-100 text-purple-700 font-semibold px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  Elegir
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>
          {/* SECCIÓN 2: CALENDARIO Y HORARIOS (Sin cambios) */}
          <h2 className="text-2xl font-bold text-gray-700 mb-2">2. Elige un día y una hora</h2>
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-md">
            <p className="text-gray-700">Servicio seleccionado: <span className="font-semibold">{selectedService.name}</span></p>
            <button onClick={() => handleSelectService(null)} className="text-sm text-purple-600 hover:underline font-semibold">Cambiar servicio</button>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-center">
              <DayPicker
                mode="single" selected={selectedDay} onSelect={handleDaySelect}
                locale={es} fromDate={new Date()}
                styles={{ head_cell: { width: '40px' }, caption_label: { fontSize: '1.1rem', fontWeight: 'bold' } }}
              />
            </div>
            <div className="h-full">
              {selectedDay && (<p className="text-center font-semibold text-gray-800">Horarios para el {format(selectedDay, "eeee, d 'de' MMMM", { locale: es })}</p>)}
              <div className="mt-4 p-2 border rounded-lg h-80 overflow-y-auto">
                {isLoading && <p className="text-gray-400 text-center pt-4">Buscando horarios...</p>}
                {!isLoading && availableSlots.length === 0 && (<p className="text-gray-400 text-center pt-4">{selectedDay ? "No hay horarios disponibles para este día." : "Selecciona un día para ver los horarios."}</p>)}
                <div className="grid grid-cols-3 gap-2 p-2">
                  {!isLoading && availableSlots.map((slot, index) => (
                    <button key={index} onClick={() => handleSlotSelect(slot)}
                      className={`p-2 rounded-md text-center font-semibold transition-colors ${selectedSlot?.getTime() === slot.getTime() ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                    >
                      {format(slot, 'HH:mm')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 👇 5. AQUÍ ESTÁ EL CAMBIO: Reemplazamos el placeholder por el componente BookingForm */}
          {selectedSlot && (
            <BookingForm
              professionalId={professionalId!}
              selectedService={selectedService}
              selectedSlot={selectedSlot}
              onBookingSuccess={handleBookingSuccess}
            />
          )}
        </div>
      )}
    </div>
  );
}