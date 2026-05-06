import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { BINS as STATIC_BINS, ALERTS as STATIC_ALERTS } from '../data/bins';
import { useWebSocket } from '../hooks/useWebSocket';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8765';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [bins,       setBins]       = useState(STATIC_BINS);
  const [alerts,     setAlerts]     = useState(STATIC_ALERTS);
  const [frames,     setFrames]     = useState([]);
  const [toasts,     setToasts]     = useState([]);
  const [connected,  setConnected]  = useState(false);
  const [fireAlerts, setFireAlerts] = useState([]);   // active SMOKE_FIRE events
  const frameCounter = useRef(0);

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const addToast = useCallback((msg, sev = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, sev }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── WebSocket message handler ──────────────────────────────────────────────
  const onMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'init':
        setBins(msg.data.bins);
        if (msg.data.alerts?.length) setAlerts(msg.data.alerts);
        break;

      case 'bin_update':
        setBins(prev => prev.map(b => b.id === msg.data.id ? { ...b, ...msg.data } : b));
        break;

      case 'alert':
        setAlerts(prev => [msg.data, ...prev].slice(0, 50));
        addToast(msg.data.msg, msg.data.sev === 'crit' ? 'error' : 'warning', 8000);
        break;

      case 'fire_alert':
        setFireAlerts(prev => [msg.data, ...prev].slice(0, 10));
        addToast(`🔥 FIRE ALERT: ${msg.data.binName} — suppression activated`, 'error', 15000);
        break;

      case 'alerts_update':
        setAlerts(msg.data);
        break;

      case 'frame':
        setFrames(prev => [...prev.slice(-199), { ...msg.data, id: frameCounter.current++ }]);
        break;

      case 'toast':
        addToast(msg.data.msg, msg.data.sev);
        break;

      default:
        break;
    }
  }, [addToast]);

  const { send } = useWebSocket(WS_URL, {
    onMessage,
    onConnect:    useCallback(() => {
      setConnected(true);
      addToast('Connected to SmartBin network', 'success', 3000);
    }, [addToast]),
    onDisconnect: useCallback(() => {
      setConnected(false);
    }, []),
  });

  // ── Command dispatcher ─────────────────────────────────────────────────────
  const sendCommand = useCallback((cmd, binId) => {
    send({ type: 'cmd', cmd, binId });
  }, [send]);

  const value = {
    bins,
    alerts,
    frames,
    toasts,
    connected,
    fireAlerts,
    addToast,
    dismissToast,
    sendCommand,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
