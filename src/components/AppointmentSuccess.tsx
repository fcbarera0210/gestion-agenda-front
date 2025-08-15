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
}

export default function AppointmentSuccess({ professional, service, slot, sessionType }: Props) {
  return (
    <div className="text-center p-8">
      <img src="/check-success.svg" alt="Éxito" className="w-16 h-16 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2 text-success">Cita agendada</h2>
      <p className="text-gray-700 mb-4">
        Tu cita con {professional.displayName} está confirmada para {format(slot, "eeee d 'de' MMMM 'a las' HH:mm", { locale: es })}.
      </p>
      <div className="text-left space-y-1 text-gray-700">
        <p><span className="font-semibold">Ubicación:</span> {sessionType}</p>
        <p><span className="font-semibold">Duración:</span> {service.duration} min</p>
        <p><span className="font-semibold">Costo:</span> {service.price > 0 ? `$${service.price.toLocaleString('es-CL')}` : 'Gratis'}</p>
      </div>
    </div>
  );
}
