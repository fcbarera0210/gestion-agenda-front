import NeutralAvatar from './NeutralAvatar.svg?react';
import randomGradient from '../../../utils/randomGradient';
import { useEffect, useState, type HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  alt?: string;
}

export default function RandomGradientAvatar({ className = '', alt, ...props }: Props) {
  const [gradient, setGradient] = useState('');

  useEffect(() => {
    setGradient(randomGradient());
  }, []);

  return (
    <div
      style={{ background: gradient, borderRadius: '50%', color: 'transparent' }}
      className={`w-16 h-16 flex items-center justify-center ${className}`}
      role={alt ? 'img' : undefined}
      aria-label={alt}
      {...props}
    >
      <NeutralAvatar className="w-12 h-12" />
    </div>
  );
}
