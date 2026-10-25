import React, { useEffect, useState } from 'react';

export default function CustomCursor({ isLowBandwidth = false }) {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check if device is touch-based
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true);
      return;
    }

    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Check if target is clickable
      const target = e.target;
      if (target) {
        const isClickable =
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.closest('button') ||
          target.closest('a') ||
          window.getComputedStyle(target).cursor === 'pointer';
        setIsPointer(isClickable);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  if (isTouch || isLowBandwidth) return null;

  return (
    <>
      {/* Central dot */}
      <div
        className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-75"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isPointer ? '12px' : '6px',
          height: isPointer ? '12px' : '6px',
          backgroundColor: isPointer ? '#00d4ff' : '#00d4ff',
          boxShadow: '0 0 10px #00d4ff',
        }}
      />
      {/* Surrounding crosshair ring */}
      <div
        className="pointer-events-none fixed z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/40 transition-all duration-200"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isPointer ? '36px' : '24px',
          height: isPointer ? '36px' : '24px',
          transform: `translate(-50%, -50%) scale(${isPointer ? 1.2 : 1})`,
        }}
      />
    </>
  );
}
