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
  const handleAddToCalendar = () => {
    const end = new Date(slot.getTime() + service.duration * 60000);
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${format(slot, "yyyyMMdd'T'HHmmss")}`,
      `DTEND:${format(end, "yyyyMMdd'T'HHmmss")}`,
      `SUMMARY:${service.name}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cita.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const text = `Cita con ${professional.displayName} el ${format(slot, "eeee d 'de' MMMM 'a las' HH:mm", { locale: es })} (${sessionType})`;
    try {
      await navigator.clipboard.writeText(text);
      alert('Cita copiada al portapapeles');
    } catch (err) {
      alert('No se pudo copiar la cita');
    }
  };

  return (
    <div className="text-center p-8">
      <img src="/check-success.svg" alt="Éxito" className="w-16 h-16 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2 text-primary">Cita agendada</h2>
      <p className="mb-4 text-foreground">
        Tu cita con {professional.displayName} está confirmada para {format(slot, "eeee d 'de' MMMM 'a las' HH:mm", { locale: es })}.
      </p>
      <div className="text-left space-y-1 text-foreground">
        <p><span className="font-semibold">Ubicación:</span> {sessionType}</p>
        <p><span className="font-semibold">Duración:</span> {service.duration} min</p>
        <p><span className="font-semibold">Costo:</span> {service.price > 0 ? `$${service.price.toLocaleString('es-CL')}` : 'Gratis'}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
        <button
          onClick={handleAddToCalendar}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Agregar al calendario
        </button>
        <button
          onClick={handleShare}
          className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Compartir cita
        </button>
      </div>
    </div>
  );
}
