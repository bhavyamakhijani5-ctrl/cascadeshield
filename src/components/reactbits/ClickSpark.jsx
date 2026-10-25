import React, { useRef, useEffect } from 'react';

export default function ClickSpark({
  sparkColor = '#00d4ff',
  sparkSize = 10,
  sparkCount = 8,
  duration = 400,
  children,
}) {
  const containerRef = useRef(null);

  const handleClick = (e) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement('div');
      spark.className = 'pointer-events-none absolute rounded-full';
      spark.style.width = `${sparkSize}px`;
      spark.style.height = `${sparkSize}px`;
      spark.style.backgroundColor = sparkColor;
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.transform = 'translate(-50%, -50%)';
      spark.style.boxShadow = `0 0 8px ${sparkColor}`;

      const angle = (i / sparkCount) * 2 * Math.PI;
      const distance = 25 + Math.random() * 35;
      const destX = Math.cos(angle) * distance;
      const destY = Math.sin(angle) * distance;

      container.appendChild(spark);

      spark.animate(
        [
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(0)`, opacity: 0 },
        ],
        {
          duration,
          easing: 'cubic-bezier(0, 0.7, 0.1, 1)',
        }
      ).onfinish = () => {
        spark.remove();
      };
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="relative w-full h-full"
    >
      {children}
    </div>
  );
}
