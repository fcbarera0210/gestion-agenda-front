interface Props {
  id: string;
  displayName: string;
  title: string;
  photoURL?: string;
}

// Card displaying a professional and linking to their scheduling page
export default function ProfessionalCard({ id, displayName, title, photoURL }: Props) {
  return (
    <a
      href={`/agendar/${id}`}
      data-astro-transition="fade"
      className="flex items-center gap-4 p-4 bg-card rounded-xl shadow-sm border transition hover:shadow-md hover:border-primary"
    >
      <img
        src={photoURL || '/doctor-placeholder.png'}
        alt={`Foto de ${displayName}`}
        className="w-16 h-16 rounded-full object-cover"
      />
      <div>
        <h2 className="text-lg font-bold text-foreground">{displayName}</h2>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </a>
  );
}
