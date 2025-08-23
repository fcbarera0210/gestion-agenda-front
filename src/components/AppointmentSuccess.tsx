import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, useReducedMotion } from 'framer-motion';
import { createRipple, rippleClasses } from '../utils/ripple';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface Professional {
  id: string;
  displayName: string;
  email: string;
  title: string;
  photoURL?: string;
}

interface Props {
  professional: Professional;
  service: Service;
  slot: Date;
  sessionType: 'presencial' | 'online';
  onRestart: () => void;
}

export default function AppointmentSuccess({
  professional,
  service,
  slot,
  sessionType,
  onRestart,
}: Props) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <div className="w-full md:flex md:justify-center">
      <motion.div
        className="w-full text-center bg-card p-8 md:max-w-md md:rounded-xl md:border md:shadow-sm"
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.img
          src="/check-success.svg"
          alt="Éxito"
          className="w-16 h-16 mx-auto mb-4"
          initial={shouldReduceMotion ? false : { scale: 0, rotate: -180 }}
          animate={shouldReduceMotion ? {} : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        />
        <h2 className="text-2xl font-bold mb-2 text-foreground">¡Cita agendada!</h2>
        <p className="mb-4 text-muted-foreground">
          Tu cita con {professional.displayName} está confirmada para{' '}
          {format(slot, "eeee d 'de' MMMM 'a las' HH:mm", { locale: es })}.
        </p>

        <div className="text-left space-y-1 text-foreground">
          <p>
            <span className="font-semibold">Ubicación:</span> {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)}
          </p>
          <p>
            <span className="font-semibold">Duración:</span> {service.duration} min
          </p>
          <p>
            <span className="font-semibold">Costo:</span>{' '}
            {service.price > 0 ? `$${service.price.toLocaleString('es-CL')}` : 'Gratis'}
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={(e) => { createRipple(e); onRestart(); }}
            className={`${rippleClasses} w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90`}
          >
            Volver al inicio
          </button>
        </div>
      </motion.div>
    </div>
  );
}
