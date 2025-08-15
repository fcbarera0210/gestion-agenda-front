import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import BookingForm from './BookingForm';
import AppointmentSuccess from './AppointmentSuccess';

// Tipos de datos
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

/**
 * Componente principal del agendador: selección de servicio, fecha y hora.
 */
export default function Scheduler({ professional, services }: Props) {
  // Estados
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [sessionType, setSessionType] = useState<'PRESENCIAL' | 'ONLINE'>('PRESENCIAL');
  const [showForm, setShowForm] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{
    service: Service;
    slot: Date;
    sessionType: string;
  } | null>(null);

  // Buscar disponibilidad cuando cambia día o servicio
  useEffect(() => {
    if (!selectedDay || !selectedService) {
      setAvailableSlots([]);
      return;
    }
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
        setAvailableSlots(slots.map((slot) => new Date(slot)));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, [selectedDay, selectedService, professional.id]);

  // Manejadores
  const handleSelectService = (service: Service | null) => {
    setSelectedService(service);
    setSelectedDay(undefined);
    setSelectedSlot(null);
    setShowForm(false);
    setBookingSuccess(false);
  };

  const handleDaySelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDay(date);
      setBookingSuccess(false);
    }
  };

  const handleSlotSelect = (slot: Date) => {
    setSelectedSlot(slot);
    setShowForm(false);
    setBookingSuccess(false);
  };

  const handleBookingSuccess = () => {
    if (selectedService && selectedSlot) {
      setBookingDetails({ service: selectedService, slot: selectedSlot, sessionType });
    }
    setBookingSuccess(true);
  };

  // Vista de éxito
  if (bookingSuccess && bookingDetails) {
    return (
      <AppointmentSuccess
        professional={professional}
        service={bookingDetails.service}
        slot={bookingDetails.slot}
        sessionType={bookingDetails.sessionType}
      />
    );
  }

  // Render principal
  return (
    <div className="w-full">
      {/* Paso 1: Selección de servicio */}
      {!selectedService ? (
        <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">1. Selecciona un servicio</h2>
              <p className="text-gray-500 mt-1">Elige uno para ver los horarios disponibles.</p>
            </div>
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center transition hover:shadow-md hover:border-primary-400"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <div className="flex items-center gap-x-4 text-sm text-gray-500 mt-1">
                    <span>{service.duration} min</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="font-medium text-gray-700">
                      {service.price > 0 ? `$${service.price.toLocaleString('es-CL')}` : 'Gratis'}
                    </span>
                  </div>
                </div>
                  <button
                    onClick={() => handleSelectService(service)}
                    className="bg-primary-700 text-white font-semibold px-5 py-2 rounded-lg hover:bg-primary-400 transition-colors"
                  >
                    Elegir
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
        // Pasos 2 y 3: Calendario y formulario
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">2. Elige un día y una hora</h2>
          </div>

          <div className="flex gap-2 mb-4">
            {['PRESENCIAL', 'ONLINE'].map((type) => (
              <button
                key={type}
                onClick={() => setSessionType(type as 'PRESENCIAL' | 'ONLINE')}
                className={`px-4 py-2 rounded-lg border font-semibold ${
                  sessionType === type
                    ? 'bg-primary-700 text-white border-primary-700'
                    : 'bg-white text-primary-700 border-primary-700 hover:bg-primary-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Resumen del servicio seleccionado */}
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border mb-6">
            <div>
              <p className="text-xs text-gray-500">Servicio seleccionado</p>
              <p className="font-semibold text-gray-800">{selectedService.name}</p>
            </div>
            <button
              onClick={() => handleSelectService(null)}
              className="text-sm text-primary-700 hover:underline font-semibold"
            >
              Cambiar
            </button>
          </div>

          {/* Calendario y horarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex justify-center">
              <DayPicker
                mode="single"
                selected={selectedDay}
                onSelect={handleDaySelect}
                locale={es}
                fromDate={new Date()}
                classNames={{
                  months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                  month: 'space-y-4',
                  caption: 'flex justify-center pt-1 relative items-center',
                  caption_label: 'text-sm font-medium',
                  nav: 'space-x-1 flex items-center',
                  nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                  table: 'w-full border-collapse space-y-1',
                  head_row: 'flex',
                  head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.8rem]',
                  row: 'flex w-full mt-2',
                  cell:
                    'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary-400 first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20',
                  day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
                  day_selected:
                    'bg-primary-700 text-white hover:bg-primary-700 hover:text-white focus:bg-primary-700 focus:text-white rounded-lg',
                  day_today: 'bg-gray-100 text-gray-900',
                  day_outside: 'text-gray-400 opacity-50',
                  day_disabled: 'text-gray-400 opacity-50',
                  day_hidden: 'invisible',
                }}
              />
            </div>
            <div className="h-full">
              {selectedDay && (
                <p className="text-center text-sm font-semibold text-gray-800 mb-2">
                  Horarios para el {format(selectedDay, "eeee, d 'de' MMMM", { locale: es })}
                </p>
              )}
              <div className="p-2 border rounded-xl h-72 overflow-y-auto bg-gray-50">
                {isLoading && (
                  <p className="text-gray-400 text-center pt-4 animate-pulse">Buscando...</p>
                )}
                {!isLoading && availableSlots.length === 0 && (
                  <p className="text-gray-400 text-center pt-4">
                    {selectedDay ? 'No hay horarios disponibles.' : 'Selecciona un día.'}
                  </p>
                )}
                <div className="grid grid-cols-3 gap-2 p-2">
                  {!isLoading &&
                    availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleSlotSelect(slot)}
                        className={`p-2 rounded-lg text-center font-semibold transition-colors border ${
                          selectedSlot?.getTime() === slot.getTime()
                            ? 'bg-primary-700 text-white border-primary-700 shadow-md'
                            : 'bg-white text-primary-700 border-primary-700 hover:bg-primary-400 hover:text-white'
                        }`}
                      >
                        {format(slot, 'HH:mm')}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {selectedSlot && !showForm && (
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-400"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Formulario de reserva */}
          {selectedSlot && showForm && (
            <BookingForm
              professionalId={professional.id}
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
