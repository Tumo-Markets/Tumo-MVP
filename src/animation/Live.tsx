'use client';

import { useEffect, useRef, useState } from 'react';

interface LiveProps {
  duration?: number;
  loop?: boolean;
  pingPong?: boolean;
  from?: number;
  to?: number;
}

export default function Live({ duration = 1, loop = true, pingPong = true, from = 1, to = 0.2 }: LiveProps) {
  const [opacity, setOpacity] = useState<number>(from);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const directionRef = useRef(1); // 1 -> forward (from->to), -1 -> reverse

  useEffect(() => {
    const durMs = Math.max(1, duration) * 1000;

    function easeInOutQuad(t: number) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function step(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(1, elapsed / durMs);
      const eased = easeInOutQuad(progress);

      // compute current opacity depending on direction
      const current = directionRef.current === 1 ? from + (to - from) * eased : to + (from - to) * eased;

      setOpacity(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        // completed one cycle
        if (!loop) {
          // stay at target
          startRef.current = null;
          rafRef.current = null;
          return;
        }

        if (pingPong) {
          directionRef.current *= -1;
        }
        // restart
        startRef.current = null;
        rafRef.current = requestAnimationFrame(step);
      }
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
    };
  }, [duration, loop, pingPong, from, to]);

  return (
    <div
      className="bg-red-500 text-white px-2 py-1 rounded-md font-semibold"
      style={{ opacity, transition: 'opacity 100ms linear' }}
      aria-live="polite"
    >
      Live
    </div>
  );
}
