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
      aria-label="Cambiar tema"
      className="p-0 bg-transparent border-0"
      onClick={toggleTheme}
    >
      <span>{isDark ? '🌞' : '🌙'}</span>
    </button>
  );
}
