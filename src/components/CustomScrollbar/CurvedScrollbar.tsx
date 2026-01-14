/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, ReactNode } from 'react';
import './CurvedScrollbar.css';

interface CurvedScrollbarProps {
  children: ReactNode;
  className?: string;
  borderRadius?: number;
  thumbColor?: string;
  thumbColorActive?: string;
  thumbWidth?: number;
  thumbWidthActive?: number;
  trackColor?: string;
  trackColorActive?: string;
  trackWidth?: number;
  trackWidthActive?: number;
}

const OFFSET = 7;
const EXTRA_INSET = 2;
const MIN_START_RATIO = 0.8;
const MIN_THUMB = 20;
const SEGMENTS = 50;

export default function CurvedScrollbar({
  children,
  className = '',
  borderRadius = 20,
  thumbColor = '#2b2b2b',
  thumbColorActive = '#2b2b2b',
  thumbWidth = 4,
  thumbWidthActive = 6,
  trackColor = 'transparent',
  trackColorActive = 'rgba(128, 128, 128, 0.2)',
  trackWidth = 4,
  trackWidthActive = 6,
}: CurvedScrollbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const trackPathRef = useRef<SVGPathElement>(null);
  const thumbPathRef = useRef<SVGPathElement>(null);
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const pathLengthRef = useRef(0);
  const thumbLengthRef = useRef(50);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    const trackPath = trackPathRef.current;
    const thumbPath = thumbPathRef.current;

    if (!container || !content || !trackPath || !thumbPath) return;

    function updatePath() {
      if (!container || !content || !trackPath) return;

      const w = container.clientWidth;
      const h = container.clientHeight;
      const r = borderRadius;
      const effectiveRadius = Math.max(r - OFFSET, 0);
      const trackX = w - OFFSET;
      const topY = OFFSET;
      const bottomY = h - OFFSET;
      const cornerX = trackX - effectiveRadius;

      const minStartX = w * MIN_START_RATIO;
      let startX = trackX - effectiveRadius * EXTRA_INSET;
      if (startX < minStartX) startX = minStartX;
      if (startX > cornerX) startX = cornerX;

      const d = `
        M ${startX} ${topY}
        L ${cornerX} ${topY}
        A ${effectiveRadius} ${effectiveRadius} 0 0 1 ${trackX} ${topY + effectiveRadius}
        L ${trackX} ${bottomY - effectiveRadius}
        A ${effectiveRadius} ${effectiveRadius} 0 0 1 ${cornerX} ${bottomY}
        L ${startX} ${bottomY}
      `;

      trackPath.setAttribute('d', d);
      pathLengthRef.current = trackPath.getTotalLength();
      const ratio = content.clientHeight / content.scrollHeight;
      thumbLengthRef.current = Math.max(MIN_THUMB, pathLengthRef.current * ratio);
      updateThumb();
    }

    function updateThumb() {
      if (!content || !trackPath || !thumbPath) return;

      const scrollableHeight = content.scrollHeight - content.clientHeight || 1;
      const scrollRatio = content.scrollTop / scrollableHeight;
      const startOffset = (pathLengthRef.current - thumbLengthRef.current) * scrollRatio;
      const endOffset = startOffset + thumbLengthRef.current;

      const points: string[] = [];
      for (let i = 0; i <= SEGMENTS; i++) {
        const t = startOffset + ((endOffset - startOffset) / SEGMENTS) * i;
        const p = trackPath.getPointAtLength(t);
        points.push(`${p.x} ${p.y}`);
      }

      const segmentD = `M ${points[0]} ${points
        .slice(1)
        .map(pt => `L ${pt}`)
        .join(' ')}`;
      thumbPath.setAttribute('d', segmentD);
    }

    function handlePointerDown(e: PointerEvent) {
      e.preventDefault();
      draggingRef.current = true;
      pointerIdRef.current = e.pointerId;
      if (thumbPath) {
        thumbPath.setPointerCapture(e.pointerId);
      }
    }

    function handlePointerMove(e: PointerEvent) {
      if (!draggingRef.current || e.pointerId !== pointerIdRef.current || !container || !content) return;

      const rect = container.getBoundingClientRect();
      let ratio = (e.clientY - rect.top) / rect.height;
      ratio = Math.max(0, Math.min(1, ratio));
      content.scrollTop = ratio * (content.scrollHeight - content.clientHeight);
      updateThumb();
    }

    function handlePointerUp(e: PointerEvent) {
      if (!draggingRef.current || e.pointerId !== pointerIdRef.current) return;
      draggingRef.current = false;
      try {
        if (thumbPath) {
          thumbPath.releasePointerCapture(pointerIdRef.current);
        }
      } catch {}
      pointerIdRef.current = null;
    }

    thumbPath.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    content.addEventListener('scroll', updateThumb);
    window.addEventListener('resize', updatePath);

    updatePath();

    return () => {
      thumbPath.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      content.removeEventListener('scroll', updateThumb);
      window.removeEventListener('resize', updatePath);
    };
  }, [borderRadius]);

  return (
    <div
      ref={containerRef}
      className={`curved-scrollbar-container ${className}`}
      style={(() => {
        const cssVars: React.CSSProperties = {
          borderRadius: `${borderRadius}px`,
        } as React.CSSProperties;
        (cssVars as any)['--thumb-color'] = thumbColor;
        (cssVars as any)['--thumb-color-active'] = thumbColorActive;
        (cssVars as any)['--thumb-width'] = thumbWidth;
        (cssVars as any)['--thumb-width-active'] = thumbWidthActive;
        (cssVars as any)['--track-color'] = trackColor;
        (cssVars as any)['--track-color-active'] = trackColorActive;
        (cssVars as any)['--track-width'] = trackWidth;
        (cssVars as any)['--track-width-active'] = trackWidthActive;
        return cssVars;
      })()}
    >
      <div
        ref={contentRef}
        className="curved-scroll-content"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          height: '100%',
          overflowY: 'scroll',
        }}
      >
        {children}
      </div>
      <svg ref={svgRef} className="scrollbar-svg" aria-hidden="true">
        <path ref={trackPathRef} className="scrollbar-track" />
        <path ref={thumbPathRef} className="scrollbar-thumb" />
      </svg>
    </div>
  );
}
