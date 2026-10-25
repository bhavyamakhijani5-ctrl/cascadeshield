import React, { useState, useEffect } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

export default function DecryptedText({
  text = '',
  speed = 40,
  maxIterations = 10,
  sequential = true,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  className = '',
  parentClassName = '',
  encryptedClassName = 'text-cyan-400 opacity-70 font-mono',
  animateOn = 'hover', // 'hover' | 'view'
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let interval;
    let iteration = 0;

    const startAnimation = () => {
      clearInterval(interval);
      iteration = 0;

      interval = setInterval(() => {
        setDisplayText(() => {
          return text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < iteration) {
                return text[index];
              }
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join('');
        });

        iteration += 1 / 2;

        if (iteration >= text.length) {
          clearInterval(interval);
          setDisplayText(text);
        }
      }, speed);
    };

    if (animateOn === 'view') {
      startAnimation();
    } else if (animateOn === 'hover' && isHovered) {
      startAnimation();
    }

    return () => clearInterval(interval);
  }, [text, isHovered, animateOn, speed]);

  return (
    <span
      className={`inline-block ${parentClassName}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={className}>{displayText}</span>
    </span>
  );
}
