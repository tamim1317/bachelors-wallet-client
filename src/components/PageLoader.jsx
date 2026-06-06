import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageLoader() {
  const [loading, setLoading] = useState(false);
  const [width, setWidth]     = useState(0);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    setWidth(0);

    const t1 = setTimeout(() => setWidth(70), 50);
    const t2 = setTimeout(() => setWidth(100), 400);
    const t3 = setTimeout(() => { setLoading(false); setWidth(0); }, 600);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9998] h-0.5">
      <div
        className="h-full bg-indigo-500 transition-all duration-300 ease-out"
        style={{ width: `${width}%` }}
      />
      {/* Glow effect */}
      <div
        className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-indigo-400/0 via-indigo-500/80 to-indigo-400/0 blur-sm transition-all duration-300"
        style={{ right: `${100 - width}%` }}
      />
    </div>
  );
}