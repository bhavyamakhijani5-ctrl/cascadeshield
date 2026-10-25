import React from 'react';

export default function AuroraBackground({
  children,
  className = '',
  showRadialGradient = true,
  isLowBandwidth = false,
}) {
  if (isLowBandwidth) {
    return (
      <div className={`relative flex flex-col bg-navy-950 text-slate-100 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-navy-950 text-slate-100 ${className}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div
          className="absolute -inset-[10px] opacity-50 blur-[80px] filter"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 20% 20%, rgba(0, 212, 255, 0.25) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 30%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse at 40% 80%, rgba(255, 59, 92, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 70%, rgba(0, 212, 255, 0.2) 0%, transparent 50%)
            `,
            animation: 'aurora-shift 18s ease-in-out infinite alternate',
          }}
        />
        <style>{`
          @keyframes aurora-shift {
            0% { transform: scale(1) translate(0px, 0px) rotate(0deg); }
            50% { transform: scale(1.1) translate(-20px, 15px) rotate(2deg); }
            100% { transform: scale(1.05) translate(20px, -20px) rotate(-2deg); }
          }
        `}</style>
      </div>

      {showRadialGradient && (
        <div className="pointer-events-none absolute inset-0 bg-navy-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      )}

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
