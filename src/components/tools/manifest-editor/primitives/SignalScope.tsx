'use client';

import React, { useRef, useEffect } from 'react';

interface SignalScopeProps {
  value: number;
  color?: string;
  width?: number;
  height?: number;
}

/**
 * SignalScope
 * Tiny industrial oscilloscope for real-time signal visualization.
 */
export default function SignalScope({ value, color = '#00ff9d', width = 40, height = 20 }: SignalScopeProps) {
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
      
      // Draw Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw Signal
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 4;
      ctx.shadowColor = color;
      ctx.beginPath();
      
      for (let i = 0; i < points.current.length; i++) {
        const x = i;
        // Map value (-1 to 1 or 0 to 1) to canvas height
        // Assuming unipolar 0 to 1 for simplicity, or bipolar -1 to 1
        const normalized = (points.current[i] + 1) / 2; // Bipolar map
        const y = height - (normalized * height);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [value, color, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height} 
      className="bg-black/40 border border-white/5 rounded-xs"
    />
  );
}
