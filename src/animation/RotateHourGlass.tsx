'use client';

import React from 'react';
import { Hourglass } from 'lucide-react';

interface RotateHourGlassProps {
  size?: number | string;
  speed?: number; // seconds per rotation
  reverse?: boolean;
  className?: string;
}

export default function RotateHourGlass({
  size = 18,
  speed = 1.5,
  reverse = false,
  className = '',
}: RotateHourGlassProps) {
  // convert numeric size to px
  const finalSize = typeof size === 'number' ? `${size}px` : size;

  const style: React.CSSProperties = {
    width: finalSize,
    height: finalSize,
    // CSS animation shorthand: name duration timing-function iteration-count direction
    animation: `rotate ${speed}s linear infinite ${reverse ? 'reverse' : 'normal'}`,
  };

  return (
    <div className={`inline-block ${className}`} style={style}>
      <Hourglass size={finalSize} />
      <style jsx>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
