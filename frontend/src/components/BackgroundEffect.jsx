import { useEffect, useRef } from 'react';

export default function BackgroundEffect() {
  const gridRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!gridRef.current) return;
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      gridRef.current.style.setProperty('--mx', `${x}%`);
      gridRef.current.style.setProperty('--my', `${y}%`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        ref={gridRef}
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 70%)',
        }}
      />

      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 35%, rgba(96,165,250,0.03), transparent 60%)',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 30% 30% at var(--mx, 50%) var(--my, 50%), rgba(96,165,250,0.02), transparent 50%)',
          transition: 'background 0.8s ease',
        }}
      />
    </div>
  );
}
