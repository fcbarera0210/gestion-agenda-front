import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, isSameDay, startOfDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
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
  const weekdays = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'];
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [currentWeek, setCurrentWeek] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
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
  const today = startOfDay(new Date());

  const steps = ['Servicio', 'Horario', 'Datos'];
  const currentStep = !selectedService ? 1 : showForm ? 3 : 2;

  const Stepper = () => (
    <div className="flex items-center mb-6" aria-label="Progreso">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              index + 1 <= currentStep
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {index + 1}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 ${index + 1 < currentStep ? 'bg-primary' : 'bg-muted'}`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

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
      setSelectedSlot(null);
      setAvailableSlots([]);
      setBookingSuccess(false);
    }
  };

  const changeWeek = (weeks: number) => {
    const newWeek = addWeeks(currentWeek, weeks);
    setCurrentWeek(newWeek);
    setSelectedDay(undefined);
    setSelectedSlot(null);
    setAvailableSlots([]);
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

  // Paso 1: Selección de servicio
  if (!selectedService) {
    return (
      <div className="w-full">
        <Stepper />
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">1. Selecciona un servicio</h2>
          <p className="text-muted-foreground mt-1">Elige uno para ver los horarios disponibles.</p>
        </div>
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-card p-4 rounded-xl shadow-sm border flex justify-between items-center transition hover:shadow-md hover:border-primary"
            >
              <div>
                <h3 className="font-semibold text-foreground">{service.name}</h3>
                <div className="flex items-center gap-x-4 text-sm text-muted-foreground mt-1">
                  <span>{service.duration} min</span>
                  <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                  <span className="font-medium text-foreground">
                    {service.price > 0 ? `$${service.price.toLocaleString('es-CL')}` : 'Gratis'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleSelectService(service)}
                className="bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Elegir
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Paso 3: Formulario de reserva en pantalla independiente
  if (showForm && selectedSlot) {
    return (
      <div className="w-full">
        <Stepper />
        <div className="mb-4">
          <button
            onClick={() => setShowForm(false)}
            className="text-primary hover:underline text-sm font-semibold"
          >
            ← Volver
          </button>
        </div>
        <BookingForm
          professionalId={professional.id}
          selectedService={selectedService}
          selectedSlot={selectedSlot}
          onBookingSuccess={handleBookingSuccess}
        />
      </div>
    );
  }

    // Paso 2: Calendario y selección de hora
    return (
      <div className="w-full">
        <Stepper />
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">2. Elige un día y una hora</h2>
          <p className="text-muted-foreground mt-1">
            Elige uno de los servicios a continuación para ver los horarios disponibles.
          </p>
        </div>

        {/* Resumen del servicio seleccionado */}
        <div className="flex justify-between items-center bg-muted p-3 rounded-xl border mb-6">
          <div>
            <p className="text-xs text-muted-foreground">Servicio seleccionado</p>
            <p className="font-semibold text-foreground">{selectedService.name}</p>
          </div>
          <button
            onClick={() => handleSelectService(null)}
            className="text-sm text-primary hover:underline font-semibold"
          >
            Cambiar
          </button>
        </div>

        {/* Calendario, tipo de sesión y horarios */}
        <div className="space-y-6 mb-6">
          <div className="bg-card p-3 rounded-xl shadow-sm border">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-2">
                <button
                  onClick={() => changeWeek(-1)}
                  className="p-1 text-primary rounded hover:bg-muted"
                  aria-label="Semana anterior"
                >
                  ‹
                </button>
                <span className="text-sm font-medium capitalize">
                  {format(currentWeek, 'MMMM yyyy', { locale: es })}
                </span>
                <button
                  onClick={() => changeWeek(1)}
                  className="p-1 text-primary rounded hover:bg-muted"
                  aria-label="Semana siguiente"
                >
                  ›
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2 w-full">
                {weekdays.map((d) => (
                  <span key={d} className="capitalize">
                    {d}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 w-full">
                {Array.from({ length: 7 }).map((_, i) => {
                  const day = addDays(currentWeek, i);
                  const disabled = day < today;
                  const selected = selectedDay && isSameDay(day, selectedDay);
                  return (
                    <button
                      key={i}
                      disabled={disabled}
                      onClick={() => handleDaySelect(day)}
                      className={`h-9 w-full rounded-lg text-sm flex items-center justify-center border transition-colors ${
                        selected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-muted hover:bg-primary hover:text-primary-foreground'
                      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Tipo de sesión</h3>
            <div className="flex gap-2 w-full" role="radiogroup" aria-label="Tipo de sesión">
              {['PRESENCIAL', 'ONLINE'].map((type) => (
                <label
                  key={type}
                  className={`flex-1 px-4 py-2 text-center rounded-lg border font-semibold cursor-pointer ${
                    sessionType === type
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-primary border-primary hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  <input
                    type="radio"
                    name="sessionType"
                    value={type}
                    className="sr-only"
                    checked={sessionType === type}
                    onChange={() => setSessionType(type as 'PRESENCIAL' | 'ONLINE')}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Horas disponibles</h3>
            <div className="p-2 border rounded-xl max-h-80 overflow-y-auto bg-muted scrollbar-thin">
              {isLoading && (
                <p className="text-muted-foreground text-center pt-4 animate-pulse">Buscando...</p>
              )}
              {!isLoading && availableSlots.length === 0 && (
                <p className="text-muted-foreground text-center pt-4">
                  {selectedDay ? 'No hay horarios disponibles.' : 'Selecciona un día.'}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 p-2">
                {!isLoading &&
                  availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleSlotSelect(slot)}
                      className={`w-full p-2 rounded-lg text-center font-semibold whitespace-nowrap transition-colors border ${
                        selectedSlot?.getTime() === slot.getTime()
                          ? 'bg-primary text-primary-foreground border-primary shadow-md'
                          : 'bg-background text-primary border-primary hover:bg-primary hover:text-primary-foreground'
                      }`}
                    >
                      {format(slot, 'hh:mm a', { locale: enUS }).toUpperCase()}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {selectedSlot && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Continuar
          </button>
        )}
      </div>
    );
  }
