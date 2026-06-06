import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('bw-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('bw-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggle = () => {
    setTransitioning(true);
    setTimeout(() => {
      setDark(d => !d);
      setTimeout(() => setTransitioning(false), 400);
    }, 50);
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle, transitioning }}>
      {transitioning && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className={`absolute inset-0 transition-opacity duration-300 ${
            dark ? 'bg-white opacity-20' : 'bg-gray-950 opacity-20'
          }`} />
        </div>
      )}
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);