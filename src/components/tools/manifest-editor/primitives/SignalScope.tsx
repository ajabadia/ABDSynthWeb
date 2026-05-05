'use client';

import React, { useRef, useEffect } from 'react';
import { clsx } from 'clsx';

interface ScopeProps {
  value: number;
  variant?: 'phosphor' | 'amber' | 'cyan' | 'oled';
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

/**
 * Scope
 * OMEGA Canonical Oscilloscope Primitive (Era 7.2.3)
 */
export default function Scope({ 
  value, 
  variant = 'phosphor', 
  width = 120, 
  height = 60,
  className,
  color: customColor
}: ScopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;

    const render = () => {
      // Add current value to points
      points.current.push(value);
      if (points.current.length > width) {
        points.current.shift();
      }

      ctx.clearRect(0, 0, width, height);
      
      // The grid is handled by CSS (.scope-grid), 
      // but we could also draw it here if preferred.

      // Signal Color based on variant
      const colorMap = {
        phosphor: '#00ff88',
        amber: '#ffaa00',
        cyan: '#00f0ff',
        oled: '#fff'
      };
      
      const color = customColor || colorMap[variant] || colorMap.phosphor;

      // Draw Signal
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      
      for (let i = 0; i < points.current.length; i++) {
        const x = i;
        const normalized = (points.current[i] + 1) / 2; // Bipolar map (-1 to 1)
        const y = height - (normalized * height);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [value, variant, width, height, customColor]);

  return (
    <div 
      className={clsx('scope-display', `variant-${variant}`, className)}
      style={{ 
        '--scope-width': `${width}px`, 
        '--scope-height': `${height}px` 
      } as React.CSSProperties}
    >
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        className="scope-canvas"
      />
      <div className="scope-grid" />
    </div>
  );
}
