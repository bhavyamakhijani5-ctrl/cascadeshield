import React from 'react';

export default function ShinyText({
  text = '',
  disabled = false,
  speed = 4,
  className = '',
}) {
  return (
    <span
      className={`relative inline-block overflow-hidden bg-clip-text text-transparent bg-[linear-gradient(110deg,#93c5fd,45%,#ffffff,55%,#93c5fd)] bg-[length:250%_100%] animate-[shine_4s_infinite_linear] ${className}`}
      style={{
        animationDuration: `${speed}s`,
      }}
    >
      {text}
      <style>{`
        @keyframes shine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </span>
  );
}
