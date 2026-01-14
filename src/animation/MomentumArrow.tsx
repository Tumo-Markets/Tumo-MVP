import React from 'react';

interface MomentumArrowProps {
  direction?: 'left' | 'right';
  color?: string;
  className?: string;
}

const ArrowIcon = ({ color = 'currentColor', className = '' }: { color?: string; className?: string }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ color }}
    aria-hidden
  >
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function MomentumArrow({ direction = 'left', color = '#0077ff', className = '' }: MomentumArrowProps) {
  return (
    <div className={`flex items-center justify-center h-6 ${className}`}>
      <style>{`
        @keyframes momentumFade1 {
          0% { transform: translateX(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateX(8px); opacity: 0; }
        }
        @keyframes momentumFade2 {
          0% { transform: translateX(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateX(12px); opacity: 0; }
        }
        @keyframes momentumFade3 {
          0% { transform: translateX(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateX(16px); opacity: 0; }
        }

        .momentum-arrow-1 { animation: momentumFade1 1.4s ease-in-out infinite; }
        .momentum-arrow-2 { animation: momentumFade2 1.4s ease-in-out infinite 0.18s; }
        .momentum-arrow-3 { animation: momentumFade3 1.4s ease-in-out infinite 0.36s; }
      `}</style>

      <div className={`flex items-center gap-1 ${direction === 'left' ? 'rotate-180' : ''}`}>
        <ArrowIcon color={color} className="momentum-arrow-1" />
        <ArrowIcon color={color} className="momentum-arrow-2" />
        <ArrowIcon color={color} className="momentum-arrow-3" />
      </div>
    </div>
  );
}
