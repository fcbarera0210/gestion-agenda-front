import React from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/client';
import { useForm } from 'react-hook-form';
import { FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';

interface Service {
  id: string;
  name: string;
  duration: number;
}

interface Props {
  professionalId: string | undefined;
  selectedService: Service;
  selectedSlot: Date;
  onBookingSuccess: () => void;
}

// Form that submits client information to create a booking
export default function BookingForm({ professionalId, selectedService, selectedSlot, onBookingSuccess }: Props) {
  const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({
    mode: 'onChange',
    defaultValues: {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      notes: '',
    }
  });

  const onSubmit = async (data: any) => {
    if (!professionalId || !selectedService || !selectedSlot) {
      return;
    }
    try {
      const createBooking = httpsCallable(functions, 'createBooking');
      await createBooking({
        professionalId: professionalId,
        serviceId: selectedService.id,
        selectedSlot: selectedSlot.toISOString(),
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        serviceName: selectedService.name,
        serviceDuration: selectedService.duration,
        notes: data.notes
      });
      onBookingSuccess();
    } catch (err) {
      console.error('Error al llamar a la función de reserva:', err);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t">
      <h2 className="text-2xl font-bold text-foreground mb-2">3. Confirma tus datos</h2>
      <div className="p-6 border rounded-xl bg-card mt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <label htmlFor="clientName" className="text-sm font-medium text-foreground">Nombre y Apellido</label>
            <input
              type="text"
              id="clientName"
              autoComplete="name"
              placeholder="Ingresa tu nombre"
              className="w-full pl-10 px-4 py-3 mt-1 bg-muted rounded-lg text-foreground"
              aria-required="true"
              aria-invalid={errors.clientName ? 'true' : 'false'}
              aria-describedby={errors.clientName ? 'clientName-error' : undefined}
              {...register('clientName', {
                required: 'El nombre es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' }
              })}
            />
            {errors.clientName && (
              <p id="clientName-error" className="text-sm text-destructive mt-1">{errors.clientName.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <label htmlFor="clientEmail" className="text-sm font-medium text-foreground">Correo Electrónico</label>
              <input
                type="email"
                id="clientEmail"
                autoComplete="email"
                placeholder="nombre@ejemplo.com"
                className="w-full pl-10 px-4 py-3 mt-1 bg-muted rounded-lg text-foreground"
                aria-required="true"
                aria-invalid={errors.clientEmail ? 'true' : 'false'}
                aria-describedby={errors.clientEmail ? 'clientEmail-error' : undefined}
                {...register('clientEmail', {
                  required: 'El correo es obligatorio',
                  pattern: { value: /.+@.+\..+/, message: 'Correo inválido' }
                })}
              />
              {errors.clientEmail && (
                <p id="clientEmail-error" className="text-sm text-destructive mt-1">{errors.clientEmail.message as string}</p>
              )}
            </div>

            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <label htmlFor="clientPhone" className="text-sm font-medium text-foreground">Teléfono (Opcional)</label>
              <input
                type="tel"
                id="clientPhone"
                autoComplete="tel"
                placeholder="Ej: 555123456"
                className="w-full pl-10 px-4 py-3 mt-1 bg-muted rounded-lg text-foreground"
                aria-required="false"
                aria-invalid={errors.clientPhone ? 'true' : 'false'}
                aria-describedby={errors.clientPhone ? 'clientPhone-error' : undefined}
                {...register('clientPhone', {
                  pattern: { value: /^[0-9]+$/, message: 'Solo números' }
                })}
              />
              {errors.clientPhone && (
                <p id="clientPhone-error" className="text-sm text-destructive mt-1">{errors.clientPhone.message as string}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="text-sm font-medium text-foreground">Notas</label>
            <textarea
              id="notes"
              rows={3}
              autoComplete="off"
              placeholder="Información adicional"
              className="w-full px-4 py-3 mt-1 bg-muted rounded-lg text-foreground"
              {...register('notes')}
            ></textarea>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex items-center justify-center w-48 px-6 py-3 font-semibold rounded-lg shadow-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/50"
            >
              {isSubmitting ? 'Agendando...' : 'Realizar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

