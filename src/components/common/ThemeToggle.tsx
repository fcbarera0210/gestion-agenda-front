import React from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const dark = document.documentElement.classList.contains('dark');
    setIsDark(dark);
  }, []);

  const toggleTheme = () => {
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    setIsDark(dark);
  };

  return (
    <button
      type="button"
      aria-label="Cambiar modo"
      title="Cambiar modo"
      className="p-2 rounded-full border bg-card hover:bg-muted"
      onClick={toggleTheme}
    >
      <span className="text-foreground">{isDark ? '🌞' : '🌙'}</span>
    </button>
  );
}
