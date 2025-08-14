import type { APIRoute } from 'astro';
export const prerender = false;
import { db } from '../../firebase/client';
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { 
  setHours, 
  setMinutes, 
  setSeconds, 
  addMinutes, 
  isBefore, 
  isAfter, 
  isEqual, 
  startOfDay, 
  endOfDay 
} from 'date-fns';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { date, professionalId, serviceId } = await request.json();

    if (!date || !professionalId || !serviceId) {
      return new Response('Faltan parámetros requeridos', { status: 400 });
    }
    
    const selectedDate = new Date(date);
    const dayOfWeek = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][selectedDate.getDay()];
    
    // --- 1. OBTENER DATOS NECESARIOS ---
    const profDocRef = doc(db, 'professionals', professionalId);
    const serviceDocRef = doc(db, 'services', serviceId);
    const [profDocSnap, serviceDocSnap] = await Promise.all([getDoc(profDocRef), getDoc(serviceDocRef)]);

    if (!profDocSnap.exists() || !serviceDocSnap.exists()) {
      return new Response('Profesional o servicio no encontrado', { status: 404 });
    }

    const professional = profDocSnap.data();
    const service = serviceDocSnap.data();
    const daySchedule = professional.workSchedule[dayOfWeek];

    if (!daySchedule || !daySchedule.isActive) {
      return new Response(JSON.stringify([]), { status: 200 }); // No hay horarios si el día no está activo
    }

    // --- 2. OBTENER CITAS Y BLOQUEOS EXISTENTES ---
    const startOfSelectedDay = startOfDay(selectedDate);
    const endOfSelectedDay = endOfDay(selectedDate);

    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('professionalId', '==', professionalId),
      where('start', '>=', Timestamp.fromDate(startOfSelectedDay)),
      where('start', '<=', Timestamp.fromDate(endOfSelectedDay))
    );

    const timeBlocksQuery = query(
      collection(db, 'timeBlocks'),
      where('professionalId', '==', professionalId),
      where('start', '>=', Timestamp.fromDate(startOfSelectedDay)),
      where('start', '<=', Timestamp.fromDate(endOfSelectedDay))
    );

    const [appointmentsSnapshot, timeBlocksSnapshot] = await Promise.all([
      getDocs(appointmentsQuery),
      getDocs(timeBlocksQuery)
    ]);

    const existingEvents = [
      ...appointmentsSnapshot.docs.map(d => ({ start: d.data().start.toDate(), end: d.data().end.toDate() })),
      ...timeBlocksSnapshot.docs.map(d => ({ start: d.data().start.toDate(), end: d.data().end.toDate() })),
      ...(daySchedule.breaks || []).map((b: any) => ({
        start: setMinutes(setHours(startOfSelectedDay, parseInt(b.start.split(':')[0])), parseInt(b.start.split(':')[1])),
        end: setMinutes(setHours(startOfSelectedDay, parseInt(b.end.split(':')[0])), parseInt(b.end.split(':')[1]))
      }))
    ];

    // --- 3. GENERAR Y FILTRAR HORARIOS DISPONIBLES ---
    const availableSlots: Date[] = [];
    const { start, end } = daySchedule.workHours;
    let currentTime = setMinutes(setHours(startOfSelectedDay, parseInt(start.split(':')[0])), parseInt(start.split(':')[1]));
    const endTime = setMinutes(setHours(startOfSelectedDay, parseInt(end.split(':')[0])), parseInt(end.split(':')[1]));
    const serviceDuration = service.duration;

    while (isBefore(currentTime, endTime)) {
      const slotEnd = addMinutes(currentTime, serviceDuration);
      if(isAfter(slotEnd, endTime)) break;

      const isOverlapping = existingEvents.some(event => 
        (isBefore(currentTime, event.end) && isAfter(slotEnd, event.start))
      );
      
      const isTooLate = isAfter(currentTime, new Date());

      if (!isOverlapping && isTooLate) {
        availableSlots.push(new Date(currentTime));
      }

      currentTime = addMinutes(currentTime, 15); // Intervalo de búsqueda: cada 15 minutos
    }

    return new Response(JSON.stringify(availableSlots), { status: 200 });

  } catch (error) {
    console.error("Error calculating availability:", error);
    return new Response('Error interno del servidor', { status: 500 });
  }
};