import { FiLoader } from 'react-icons/fi';

interface LoaderProps {
  message?: string;
}

export default function Loader({ message = 'Cargando…' }: LoaderProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-8">
      <FiLoader className="h-6 w-6 animate-spin text-primary" />
      {message && <p className="text-center">{message}</p>}
    </div>
  );
}

