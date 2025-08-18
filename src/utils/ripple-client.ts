export function createRipple(event: MouseEvent): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const button = event.currentTarget as HTMLElement & { disabled?: boolean };
  if (!button || (button as any).disabled) return;
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
