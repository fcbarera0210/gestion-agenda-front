import type React from 'react';

export const rippleClasses =
  'relative overflow-hidden motion-safe:transition-transform motion-safe:hover:scale-105 motion-safe:active:scale-95';

export function createRipple(
  event: React.MouseEvent<HTMLElement> | MouseEvent
): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const button = event.currentTarget as HTMLElement & { disabled?: boolean };
  if (button.disabled) return;
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
  circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
  circle.className = 'ripple';
  const ripple = button.getElementsByClassName('ripple')[0];
  if (ripple) {
    ripple.remove();
  }
  button.appendChild(circle);
}
