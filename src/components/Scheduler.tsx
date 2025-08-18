import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, isSameDay, startOfDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import BookingForm from './BookingForm';
import AppointmentSuccess from './AppointmentSuccess';
import Stepper from './Stepper';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { createRipple, rippleClasses } from '../utils/ripple';

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
  workSchedule?: Record<string, { isActive: boolean }>;
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
  const [weekDirection, setWeekDirection] = useState(0);
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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const today = startOfDay(new Date());

  const steps = ['Servicio', 'Horario', 'Datos'];
  const currentStep = !selectedService ? 1 : showForm ? 3 : 2;
  const shouldReduceMotion = useReducedMotion();
  const weekVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -50 : 50, opacity: 0 }),
  };

  const fetchAvailability = async () => {
    if (!selectedDay || !selectedService) return;
    setFetchError(null);
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
      setFetchError('No se pudo obtener la disponibilidad. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar disponibilidad cuando cambia día o servicio
  useEffect(() => {
    if (!selectedDay || !selectedService) {
      setAvailableSlots([]);
      return;
    }
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
    setWeekDirection(weeks);
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

  const handleRestart = () => {
    setSelectedService(null);
    setSelectedDay(undefined);
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
    setSelectedSlot(null);
    setAvailableSlots([]);
    setIsLoading(false);
    setBookingSuccess(false);
    setSessionType('PRESENCIAL');
    setShowForm(false);
    setBookingDetails(null);
  };

  // Vista de éxito
  if (bookingSuccess && bookingDetails) {
    return (
      <AppointmentSuccess
        professional={professional}
        service={bookingDetails.service}
        slot={bookingDetails.slot}
        sessionType={bookingDetails.sessionType}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="w-full">
      <Stepper steps={steps} currentStep={currentStep} />
      <AnimatePresence mode="wait">
        {!selectedService ? (
          <motion.div
            key="select-service"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Selecciona un servicio</h2>
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
                    onClick={(e) => {
                      createRipple(e);
                      handleSelectService(service);
                    }}
                    className={`${rippleClasses} bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer`}
                  >
                    Elegir
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-start pt-6">
              <a
                href="/profesionales"
                onClick={createRipple}
                className={`${rippleClasses} flex items-center justify-center w-full md:w-auto px-8 py-3 font-semibold rounded-lg border text-foreground hover:bg-muted transition-colors`}
              >
                Volver al inicio
              </a>
            </div>
          </motion.div>
        ) : showForm && selectedSlot ? (
          <motion.div
            key="booking-form"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <BookingForm
              professionalId={professional.id}
              selectedService={selectedService}
              selectedSlot={selectedSlot}
              onBookingSuccess={handleBookingSuccess}
              onBack={() => setShowForm(false)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="select-slot"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Elige un día y una hora</h2>
              <p className="text-muted-foreground mt-1">
                Elige uno de los servicios a continuación para ver los horarios disponibles.
              </p>
            </div>

            {/* Resumen del servicio seleccionado */}
            <div className="flex justify-between items-center bg-muted p-3 rounded-xl border mb-6">
              <div>
                <p className="text-xs text-muted-foreground">Servicio seleccionado</p>
                <p className="font-semibold text-foreground">{selectedService?.name}</p>
              </div>
              <button
                onClick={(e) => {
                  createRipple(e);
                  handleSelectService(null);
                }}
                className={`${rippleClasses} text-primary hover:underline cursor-pointer`}
              >
                Cambiar
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Selecciona un día</h3>
                <div className="flex items-center justify-between mb-3 w-full">
                  <button
                    onClick={(e) => {
                      createRipple(e);
                      changeWeek(-1);
                    }}
                    className={`${rippleClasses} p-1 text-primary rounded hover:bg-muted cursor-pointer`}
                    aria-label="Semana anterior"
                  >
                    ‹
                  </button>
                  <span className="text-sm font-medium capitalize">
                    {format(currentWeek, 'MMMM yyyy', { locale: es })}
                  </span>
                  <button
                    onClick={(e) => {
                      createRipple(e);
                      changeWeek(1);
                    }}
                    className={`${rippleClasses} p-1 text-primary rounded hover:bg-muted cursor-pointer`}
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
                <div className="relative overflow-hidden">
                  <AnimatePresence initial={false} custom={weekDirection}>
                    <motion.div
                      key={format(currentWeek, 'yyyy-MM-dd')}
                      custom={weekDirection}
                      variants={shouldReduceMotion ? undefined : weekVariants}
                      initial={shouldReduceMotion ? false : 'enter'}
                      animate={shouldReduceMotion ? {} : 'center'}
                      exit={shouldReduceMotion ? {} : 'exit'}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-7 gap-1 w-full"
                    >
                      {Array.from({ length: 7 }).map((_, i) => {
                        const day = addDays(currentWeek, i);
                        const dayName = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][day.getDay()];
                        const isActive = professional.workSchedule?.[dayName]?.isActive;
                        const disabled = day < today || !isActive;
                        const selected = selectedDay && isSameDay(day, selectedDay);
                        return (
                          <motion.button
                            key={i}
                            disabled={disabled}
                              onClick={(e) => {
                                createRipple(e);
                                handleDaySelect(day);
                              }}
                            className={`${rippleClasses} h-9 w-full rounded-lg text-sm flex items-center justify-center border transition-colors cursor-pointer ${
                                selected
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-background text-foreground border-muted hover:bg-primary hover:text-primary-foreground'
                              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            animate={
                              shouldReduceMotion
                                ? { scale: 1 }
                                : selected
                                ? { scale: [1, 1.05, 1] }
                                : { scale: 1 }
                            }
                            transition={{ duration: 0.2 }}
                          >
                            {format(day, 'd')}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Tipo de sesión</h3>
                <div className="flex gap-2 w-full" role="radiogroup" aria-label="Tipo de sesión">
                  {['PRESENCIAL', 'ONLINE'].map((type) => (
                    <label
                      key={type}
                      onClick={createRipple}
                      className={`${rippleClasses} flex-1 px-4 py-2 text-center rounded-lg border font-semibold cursor-pointer ${
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
                  {fetchError && (
                    <div className="text-center pt-4">
                      <p className="text-destructive mb-2">{fetchError}</p>
                      <button
                        onClick={(e) => {
                          createRipple(e);
                          fetchAvailability();
                        }}
                        className={`${rippleClasses} text-primary font-semibold hover:underline cursor-pointer`}
                      >
                        Reintentar
                      </button>
                    </div>
                  )}
                  {!isLoading && !fetchError && availableSlots.length === 0 && (
                    <p className="text-muted-foreground text-center pt-4">
                      {selectedDay ? 'No hay horarios disponibles.' : 'Selecciona un día.'}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2 p-2">
                    {!isLoading && !fetchError &&
                      availableSlots.map((slot, index) => {
                        const isSelected = selectedSlot?.getTime() === slot.getTime();
                        return (
                          <motion.button
                            key={index}
                            onClick={(e) => {
                              createRipple(e);
                              handleSlotSelect(slot);
                            }}
                            className={`${rippleClasses} w-full p-2 rounded-lg text-center font-semibold whitespace-nowrap transition-colors border cursor-pointer ${
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                : 'bg-background text-primary border-primary hover:bg-primary hover:text-primary-foreground'
                            }`}
                            animate={
                              shouldReduceMotion
                                ? { scale: 1 }
                                : isSelected
                                ? { scale: [1, 1.05, 1] }
                                : { scale: 1 }
                            }
                            transition={{ duration: 0.2 }}
                          >
                            {format(slot, 'hh:mm a', { locale: enUS }).toUpperCase()}
                          </motion.button>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

              {selectedSlot && (
                <button
                  onClick={(e) => {
                    createRipple(e);
                    setShowForm(true);
                  }}
                  className={`${rippleClasses} w-full mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 cursor-pointer`}
                >
                  Continuar
                </button>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

