import { useEffect, useRef, useCallback } from 'react';

const RECONNECT_DELAY = 3000;
const MAX_RECONNECT   = 10;

/**
 * Persistent WebSocket hook with automatic exponential back-off reconnect.
 * onMessage, onConnect, onDisconnect are stable refs — safe to define inline.
 */
export function useWebSocket(url, { onMessage, onConnect, onDisconnect } = {}) {
  const ws            = useRef(null);
  const attempts      = useRef(0);
  const timerRef      = useRef(null);
  const onMessageRef  = useRef(onMessage);
  const onConnectRef  = useRef(onConnect);
  const onDisconnRef  = useRef(onDisconnect);

  // Keep callbacks fresh without re-triggering the effect
  useEffect(() => { onMessageRef.current  = onMessage;  }, [onMessage]);
  useEffect(() => { onConnectRef.current  = onConnect;  }, [onConnect]);
  useEffect(() => { onDisconnRef.current  = onDisconnect; }, [onDisconnect]);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(url);

    socket.onopen = () => {
      attempts.current = 0;
      onConnectRef.current?.();
    };

    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onMessageRef.current?.(data);
      } catch {}
    };

    socket.onclose = () => {
      onDisconnRef.current?.();
      if (attempts.current < MAX_RECONNECT) {
        const delay = Math.min(RECONNECT_DELAY * Math.pow(1.5, attempts.current), 30000);
        attempts.current++;
        timerRef.current = setTimeout(connect, delay);
      }
    };

    socket.onerror = () => socket.close();

    ws.current = socket;
  }, [url]);

  const send = useCallback((msg) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(timerRef.current);
      ws.current?.close();
    };
  }, [connect]);

  return { send };
}
