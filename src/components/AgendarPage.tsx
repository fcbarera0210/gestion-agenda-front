import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/client';
import Scheduler from './Scheduler';
import Loader from './common/Loader';
import type { Professional, Service } from '../types';

export default function AgendarPage() {
  const segments = window.location.pathname.split('/').filter(Boolean);
  const professionalId = segments.length > 1 ? segments[1] : '';
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!professionalId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const profSnap = await getDoc(doc(db, 'professionals', professionalId));
        const profData = profSnap.exists() ? (profSnap.data() as Professional) : null;
        setProfessional(profData);

        if (profData) {
          const servicesQuery = query(collection(db, 'services'), where('professionalId', '==', professionalId));
          const servicesSnap = await getDocs(servicesQuery);
          const servicesList = servicesSnap.docs.map((docSnap) => {
            const data = docSnap.data() as Service;
            return {
              id: docSnap.id,
              name: data.name,
              duration: data.duration,
              price: data.price,
            };
          });
          setServices(servicesList);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [professionalId]);

  if (loading) {
    return <Loader message="Preparando tu formulario…" />;
  }

  if (!professionalId || !professional) {
    return <p>No encontrado</p>;
  }

  return (
    <Scheduler
      professional={{
        id: professionalId,
        displayName: professional.displayName,
        email: professional.email,
        title: professional.title,
        photoURL: professional.photoURL,
        workSchedule: professional.workSchedule,
      }}
      services={services}
    />
  );
}
