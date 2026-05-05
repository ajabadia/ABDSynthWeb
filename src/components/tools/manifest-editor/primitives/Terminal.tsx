'use client';

import React, { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';

interface TerminalProps {
  text?: string;
  variant?: 'phosphor' | 'amber' | 'cyan';
  width?: number;
  height?: number;
  className?: string;
  maxLines?: number;
  color?: string;
  fontFamily?: string;
}

/**
 * Terminal
 * OMEGA Canonical Log/Monitor Primitive (Era 7.2.3)
 */
export default function Terminal({
  text,
  variant = 'phosphor',
  width = 140,
  height = 90,
  className,
  maxLines = 50,
  color,
  fontFamily
}: TerminalProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [prevText, setPrevText] = useState<string | undefined>(text);
  const containerRef = useRef<HTMLDivElement>(null);

  if (text !== prevText) {
    setPrevText(text);
    if (text) {
      setLines(prev => {
        const next = [...prev, text];
        if (next.length > maxLines) return next.slice(next.length - maxLines);
        return next;
      });
    }
  }

  // Auto-scroll logic
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div 
      className={clsx('terminal-display', `variant-${variant}`, className)}
      style={{ 
        '--terminal-width': `${width}px`, 
        '--terminal-height': `${height}px`,
        color: color,
        fontFamily: fontFamily
      } as React.CSSProperties}
    >
      <div ref={containerRef} className="terminal-container">
        {lines.length === 0 && (
          <div className="terminal-line opacity-20 italic">No signal...</div>
        )}
        {lines.map((line, i) => (
          <div key={i} className="terminal-line">
            {`> ${line}`}
          </div>
        ))}
      </div>
    </div>
  );
}
