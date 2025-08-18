import React from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/client';
import { useForm } from 'react-hook-form';
import { FaUser, FaEnvelope, FaPhone, FaSpinner } from 'react-icons/fa';
import { createRipple, rippleClasses } from '../utils/ripple';

interface Service {
  id: string;
  name: string;
  duration: number;
}

interface BookingFormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
}

interface Props {
  professionalId: string | undefined;
  selectedService: Service;
  selectedSlot: Date;
  onBookingSuccess: () => void;
  onBack: () => void;
}

// Form that submits client information to create a booking
export default function BookingForm({ professionalId, selectedService, selectedSlot, onBookingSuccess, onBack }: Props) {
  const { register, handleSubmit, formState: { errors, isValid, isSubmitting }, setValue, getValues } = useForm<BookingFormData>({
    mode: 'onChange',
    defaultValues: {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      notes: '',
    }
  });

  const emailField = register('clientEmail', {
    required: 'El correo es obligatorio',
    pattern: { value: /.+@.+\..+/, message: 'Correo inválido' }
  });
  const [isSearching, setIsSearching] = React.useState(false);

  const onSubmit = async (data: BookingFormData): Promise<void> => {
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

  const handleEmailBlur = async (): Promise<void> => {
    const email = getValues('clientEmail').trim().toLowerCase();
    if (!email || !professionalId) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const getClientByEmail = httpsCallable(functions, 'getClientByEmail');
      const { data } = await getClientByEmail({ professionalId, email });
      console.log('Cliente encontrado:', data);
      const client = data as { name?: string; phone?: string } | null;
      if (client && (client.name || client.phone)) {
        setValue('clientName', client.name || '', { shouldDirty: true, shouldValidate: true });
        setValue('clientPhone', client.phone || '', { shouldDirty: true, shouldValidate: true });
      } else {
        setValue('clientName', '', { shouldDirty: true, shouldValidate: true });
        setValue('clientPhone', '', { shouldDirty: true, shouldValidate: true });
      }
    } catch (err) {
      console.error('Error al buscar cliente:', err);
      setValue('clientName', '', { shouldDirty: true, shouldValidate: true });
      setValue('clientPhone', '', { shouldDirty: true, shouldValidate: true });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="mt-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Confirma tus datos</h2>
        <p className="text-muted-foreground mt-1">
          Revisa y completa tu información para confirmar la reserva.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="clientEmail" className="text-sm font-medium text-foreground">Correo Electrónico</label>
          <p className="text-xs text-muted-foreground mt-1">Si ya has agendado previamente, al ingresar tu correo se completarán automáticamente tus datos.</p>
          <div className="relative mt-1">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="email"
              id="clientEmail"
              autoComplete="email"
              placeholder="nombre@ejemplo.com"
              className="w-full pl-10 px-4 py-3 bg-muted rounded-lg text-foreground focus:bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
              aria-required="true"
              aria-invalid={errors.clientEmail ? 'true' : 'false'}
              aria-describedby={errors.clientEmail ? 'clientEmail-error' : undefined}
              {...emailField}
              onBlur={(e) => { emailField.onBlur(e); handleEmailBlur(); }}
            />
            {isSearching && (
              <FaSpinner className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground pointer-events-none" />
            )}
          </div>
          {errors.clientEmail && (
            <p id="clientEmail-error" className="text-sm text-destructive mt-1">{errors.clientEmail.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="clientName" className="text-sm font-medium text-foreground">Nombre y Apellido</label>
          <div className="relative mt-1">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              id="clientName"
              autoComplete="name"
              placeholder="Ingresa tu nombre"
              className="w-full pl-10 px-4 py-3 bg-muted rounded-lg text-foreground focus:bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
              aria-required="true"
              aria-invalid={errors.clientName ? 'true' : 'false'}
              aria-describedby={errors.clientName ? 'clientName-error' : undefined}
              {...register('clientName', {
                required: 'El nombre es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' }
              })}
            />
          </div>
          {errors.clientName && (
            <p id="clientName-error" className="text-sm text-destructive mt-1">{errors.clientName.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="clientPhone" className="text-sm font-medium text-foreground">Teléfono (Opcional)</label>
          <p className="text-xs text-muted-foreground mt-1">Debe comenzar con 9 y tener 9 dígitos.</p>
          <div className="relative mt-1">
            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="tel"
              id="clientPhone"
              autoComplete="tel"
              placeholder="9 87654321"
              maxLength={9}
              className="w-full pl-10 px-4 py-3 bg-muted rounded-lg text-foreground focus:bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
              aria-required="false"
              aria-invalid={errors.clientPhone ? 'true' : 'false'}
              aria-describedby={errors.clientPhone ? 'clientPhone-error' : undefined}
              {...register('clientPhone', {
                pattern: { value: /^9[0-9]{8}$/, message: 'Debe comenzar con 9 y tener 9 dígitos' }
              })}
            />
          </div>
          {errors.clientPhone && (
            <p id="clientPhone-error" className="text-sm text-destructive mt-1">{errors.clientPhone.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="text-sm font-medium text-foreground">Notas</label>
          <textarea
            id="notes"
            rows={3}
            autoComplete="off"
            placeholder="Información adicional"
            className="w-full px-4 py-3 mt-1 bg-muted rounded-lg text-foreground focus:bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
            {...register('notes')}
          ></textarea>
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-6">
          <button
            type="button"
            onClick={(e) => { createRipple(e); onBack(); }}
            className={`${rippleClasses} flex items-center justify-center w-full md:w-auto px-8 py-3 font-semibold rounded-lg border text-foreground cursor-pointer hover:bg-muted transition-colors`}
          >
            Volver
          </button>
          <button
            type="submit"
            onClick={createRipple}
            disabled={!isValid || isSubmitting}
            className={`${rippleClasses} flex items-center justify-center w-full md:w-auto px-8 py-3 font-semibold rounded-lg shadow-md bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            {isSubmitting ? 'Agendando...' : 'Realizar Reserva'}
          </button>
        </div>
      </form>
    </div>
  );
}

