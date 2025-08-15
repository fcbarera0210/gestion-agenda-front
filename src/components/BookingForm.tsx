import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/client';

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
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update local form state when an input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Send booking details to the backend function
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.clientName || !formData.clientEmail) {
      setError('El nombre y el correo son obligatorios.');
      return;
    }

    if (!professionalId || !selectedService || !selectedSlot) {
      setError('Error: faltan datos de la sesión. Por favor, recarga la página e inténtalo de nuevo.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const createBooking = httpsCallable(functions, 'createBooking');

      console.log({
        professionalId: professionalId,
        serviceId: selectedService.id,
        selectedSlot: selectedSlot.toISOString(),
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        serviceName: selectedService.name,
        serviceDuration: selectedService.duration,
        notes: formData.notes
      });
      
      await createBooking({
        professionalId: professionalId,
        serviceId: selectedService.id,
        selectedSlot: selectedSlot.toISOString(),
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        serviceName: selectedService.name,
        serviceDuration: selectedService.duration,
        notes: formData.notes
      });
      
      onBookingSuccess();

    } catch (err) {
      console.error("Error al llamar a la función de reserva:", err);
      setError('No se pudo agendar la cita. Inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t">
      <h2 className="text-2xl font-bold text-gray-700 mb-2">3. Confirma tus datos</h2>
      <div className="p-6 border rounded-xl bg-white mt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clientName" className="text-sm font-medium text-gray-700">Nombre y Apellido</label>
            <input type="text" name="clientName" id="clientName" value={formData.clientName} onChange={handleChange} className="w-full px-4 py-3 mt-1 text-gray-700 bg-gray-100 rounded-lg" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="clientEmail" className="text-sm font-medium text-gray-700">Correo Electrónico</label>
              <input type="email" name="clientEmail" id="clientEmail" value={formData.clientEmail} onChange={handleChange} className="w-full px-4 py-3 mt-1 text-gray-700 bg-gray-100 rounded-lg" required />
            </div>
            <div>
              <label htmlFor="clientPhone" className="text-sm font-medium text-gray-700">Teléfono (Opcional)</label>
              <input type="tel" name="clientPhone" id="clientPhone" value={formData.clientPhone} onChange={handleChange} className="w-full px-4 py-3 mt-1 text-gray-700 bg-gray-100 rounded-lg" />
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="text-sm font-medium text-gray-700">Notas</label>
            <textarea name="notes" id="notes" rows={3} value={formData.notes} onChange={handleChange} className="w-full px-4 py-3 mt-1 text-gray-700 bg-gray-100 rounded-lg"></textarea>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isLoading} className="flex items-center justify-center w-48 px-6 py-3 font-semibold text-white rounded-lg shadow-md bg-primary-700 hover:bg-primary-400 disabled:bg-primary-400/50">
              {isLoading ? 'Agendando...' : 'Realizar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
