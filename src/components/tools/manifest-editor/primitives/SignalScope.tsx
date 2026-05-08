'use client';

import React, { useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { OMEGA_Manifest, ManifestEntity } from '@/types/manifest';
import { useDesignTokens } from '@/hooks/manifest-editor/useDesignTokens';

interface ScopeProps {
  value: number;
  variant?: 'phosphor' | 'amber' | 'cyan' | 'oled';
  width?: number;
  height?: number;
  className?: string;
  color?: string;
  manifest: OMEGA_Manifest;
  item?: ManifestEntity;
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
  color: customColor,
  manifest,
  item
}: ScopeProps) {
  const { colors, physics, allVars } = useDesignTokens(manifest, item);
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
      
      const signalColor = customColor || colors.accent;

      // Draw Signal
      ctx.strokeStyle = signalColor;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 4;
      ctx.shadowColor = signalColor;
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
  }, [value, width, height, customColor, colors.accent]);

  return (
    <div 
      className={clsx('scope-display', `variant-${variant}`, className)}
      style={{ 
        ...allVars,
        '--scope-width': `${width}px`, 
        '--scope-height': `${height}px`,
        filter: physics.filter
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any}
    >
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        className="scope-canvas"
        style={{ backgroundColor: `${colors.surface}cc` }}
      />
      <div 
        className="scope-grid" 
        style={{ 
          backgroundImage: `linear-gradient(${colors.weak}10 1px, transparent 1px), linear-gradient(90deg, ${colors.weak}10 1px, transparent 1px)`,
          borderColor: `${colors.weak}30`
        }} 
      />
    </div>
  );
}
