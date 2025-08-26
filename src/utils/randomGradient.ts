export default function randomGradient(): string {
  const angle = Math.floor(Math.random() * 360);
  const h1 = Math.floor(Math.random() * 360);
  const h2 = Math.floor(Math.random() * 360);
  const s1 = 50 + Math.floor(Math.random() * 50);
  const s2 = 50 + Math.floor(Math.random() * 50);
  const l1 = 40 + Math.floor(Math.random() * 20);
  const l2 = 40 + Math.floor(Math.random() * 20);
  return `linear-gradient(${angle}deg, hsl(${h1} ${s1}% ${l1}%), hsl(${h2} ${s2}% ${l2}%))`;
}
