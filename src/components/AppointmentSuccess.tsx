import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  service: Service;
  slot: Date;
  sessionType: string;
  onRestart: () => void;
}

export default function AppointmentSuccess({ professional, service, slot, sessionType, onRestart }: Props) {
  return (
    <div className="w-full flex justify-center">
      <div className="max-w-md text-center bg-card p-8 rounded-xl border shadow-sm">
        <img src="/check-success.svg" alt="Éxito" className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-foreground">¡Cita agendada!</h2>
        <p className="mb-4 text-muted-foreground">
          Tu cita con {professional.displayName} está confirmada para {format(slot, "eeee d 'de' MMMM 'a las' HH:mm", { locale: es })}.
        </p>
        <div className="text-left space-y-1 text-foreground">
          <p><span className="font-semibold">Ubicación:</span> {sessionType}</p>
          <p><span className="font-semibold">Duración:</span> {service.duration} min</p>
          <p><span className="font-semibold">Costo:</span> {service.price > 0 ? `$${service.price.toLocaleString('es-CL')}` : 'Gratis'}</p>
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={onRestart}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
