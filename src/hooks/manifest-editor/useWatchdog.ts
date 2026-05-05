'use client';

import { useEffect, useState } from 'react';

interface WatchdogMessage {
  filename: string;
  content: string;
  timestamp: string;
}

export const useWatchdog = (onUpdate: (content: string) => void) => {
  const [status, setStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (eventSource) eventSource.close();
      
      eventSource = new EventSource('http://localhost:3001/events');

      eventSource.onopen = () => {
        console.log('[WATCHDOG] Connected to local sync service');
        setStatus('connected');
      };

      eventSource.onmessage = (event) => {
        try {
          const data: WatchdogMessage = JSON.parse(event.data);
          console.log(`[WATCHDOG] Hot-reload received: ${data.filename}`);
          onUpdate(data.content);
          setLastUpdate(new Date().toLocaleTimeString());
        } catch (err) {
          console.error('[WATCHDOG] Failed to parse update:', err);
        }
      };

      eventSource.onerror = () => {
        console.error('[WATCHDOG] Connection lost. Retrying...');
        setStatus('error');
        if (eventSource) eventSource.close();
        retryTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (eventSource) eventSource.close();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [onUpdate]);

  return { status, lastUpdate };
};
