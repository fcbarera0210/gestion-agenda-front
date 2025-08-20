import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { db } from '../firebase/client';
import ProfessionalCard from './ProfessionalCard';

interface Professional {
  id: string;
  displayName: string;
  title: string;
  email: string;
  photoURL?: string;
}

// Component to search professionals by display name or email
export default function ProfessionalSearch() {
  const [query, setQuery] = useState('');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfessionals = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const snapshot = await getDocs(collection(db, 'professionals'));
        const items: Professional[] = snapshot.docs.map((doc) => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            displayName: data.displayName,
            title: data.title,
            email: data.email,
            photoURL: data.photoURL,
          };
        });
        setProfessionals(items);
      } catch (err) {
        console.error(err);
        setError('no se pudieron obtener profesionales');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfessionals();
  }, []);

  const results = query
    ? professionals.filter(
        (p) =>
          p.displayName.toLowerCase().includes(query.toLowerCase()) ||
          p.email.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-4 text-left">
      <input
        type="text"
        placeholder="Buscar profesional por nombre o email"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
      />
      <div className="flex flex-col gap-4">
        {isLoading && <p>cargando...</p>}
        {error && <p>{error}</p>}
        {!isLoading && !error &&
          results.map((p) => (
            <ProfessionalCard
              key={p.id}
              id={p.id}
              displayName={p.displayName}
              title={p.title}
              email={p.email}
              photoURL={p.photoURL}
            />
          ))}
      </div>
    </div>
  );
}

