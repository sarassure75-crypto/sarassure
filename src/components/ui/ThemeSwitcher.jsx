import React, { useEffect, useState } from 'react';

const ThemeSwitcher = () => {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') setDark(true);
    if (saved === 'light') setDark(false);
  }, []);

  return (
    <button
      aria-label={dark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      className={`ml-2 px-3 py-2 rounded transition-colors duration-300 ${
        dark ? 'bg-slate-800 text-yellow-300' : 'bg-yellow-200 text-slate-900'
      } shadow hover:scale-105`}
      onClick={() => setDark((d) => !d)}
    >
      {dark ? '🌙 Sombre' : '☀️ Clair'}
    </button>
  );
};

export default ThemeSwitcher;
