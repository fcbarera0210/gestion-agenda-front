import NeutralAvatar from './NeutralAvatar.svg?react';
import randomGradient from '../../../utils/randomGradient';
import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  alt?: string;
}

export default function RandomGradientAvatar({ className = '', alt, ...props }: Props) {
  return (
    <div
      style={{ background: randomGradient(), borderRadius: '50%', color: 'transparent' }}
      className={`w-16 h-16 flex items-center justify-center ${className}`}
      role={alt ? 'img' : undefined}
      aria-label={alt}
      {...props}
    >
      <NeutralAvatar className="w-full h-full" />
    </div>
  );
}
