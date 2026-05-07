import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { BINS as STATIC_BINS, DEMO_BINS, DEMO_ALERTS } from '../data/bins';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from './AuthContext';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8765';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { isDemo } = useAuth();
  const [bins,             setBins]             = useState(() => isDemo ? DEMO_BINS.map(b => ({...b})) : STATIC_BINS.map(b => ({...b})));
  const [alerts,           setAlerts]           = useState(() => isDemo ? [...DEMO_ALERTS] : []);
  const [frames,           setFrames]           = useState([]);
  const [toasts,           setToasts]           = useState([]);
  const [connected,        setConnected]        = useState(false);
  const [fireAlerts,       setFireAlerts]       = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const frameCounter = useRef(0);

  const addToast = useCallback((msg, sev = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, sev }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const onMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'init':
        // In demo mode, keep demo bins/alerts — only pull connected device list from server
        if (!isDemo) {
          setBins(msg.data.bins);
          if (msg.data.alerts?.length) setAlerts(msg.data.alerts);
        }
        if (msg.data.connectedDevices) setConnectedDevices(msg.data.connectedDevices);
        break;

      case 'device_connected':
        setConnectedDevices(prev => {
          const exists = prev.find(d => d.cardNumber === msg.data.cardNumber);
          return exists
            ? prev.map(d => d.cardNumber === msg.data.cardNumber ? { ...d, ...msg.data, connected: true } : d)
            : [...prev, { ...msg.data, connected: true }];
        });
        if (!isDemo) addToast(`Device connected: ${msg.data.cardNumber}`, 'success', 4000);
        break;

      case 'device_disconnected':
        setConnectedDevices(prev =>
          prev.map(d => d.cardNumber === msg.data.cardNumber ? { ...d, connected: false } : d)
        );
        break;

      case 'bin_update':
        // In demo mode, don't let real server overwrite demo bin states
        if (!isDemo) {
          setBins(prev => prev.map(b => b.id === msg.data.id ? { ...b, ...msg.data } : b));
        }
        break;

      case 'alert':
        setAlerts(prev => [msg.data, ...prev].slice(0, 50));
        addToast(msg.data.msg, msg.data.sev === 'crit' ? 'error' : 'warning', 8000);
        break;

      case 'fire_alert':
        setFireAlerts(prev => [msg.data, ...prev].slice(0, 10));
        addToast(`FIRE ALERT: ${msg.data.binName} — suppression activated`, 'error', 15000);
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
  }, [isDemo, addToast]);

  const { send } = useWebSocket(WS_URL, {
    onMessage,
    onConnect:    useCallback(() => { setConnected(true);  }, []),
    onDisconnect: useCallback(() => { setConnected(false); }, []),
  });

  const sendCommand = useCallback((cmd, binId) => {
    send({ type: 'cmd', cmd, binId });
  }, [send]);

  // Demo-mode local command handler — simulates responses without real device
  const handleDemoCommand = useCallback((cmd, binId) => {
    if (!isDemo) return false;
    setBins(prev => prev.map(b => {
      if (b.id !== binId) return b;
      if (cmd === 'compact') {
        const newFill = Math.max(0, b.fill - 25 - Math.random() * 10);
        addToast(`${b.name} — compaction complete, fill ${Math.round(newFill)}%`, 'info', 4000);
        return { ...b, fill: +newFill.toFixed(1), cycles: b.cycles + 1, status: newFill >= 90 ? 'full' : 'online' };
      }
      if (cmd === 'acknowledge') return b;
      if (cmd === 'reset')       return { ...b, status: 'online', smoke: 0, doorOpen: false };
      if (cmd === 'door_unlock') { addToast(`${b.name} — door unlocked`, 'info', 3000); return b; }
      return b;
    }));
    if (cmd === 'acknowledge') {
      setAlerts(prev => prev.filter(a => a.bin !== binId));
      addToast('Alerts cleared', 'success', 3000);
    }
    return true;
  }, [isDemo, addToast]);

  const dispatchCommand = useCallback((cmd, binId) => {
    if (!handleDemoCommand(cmd, binId)) {
      send({ type: 'cmd', cmd, binId });
    }
  }, [handleDemoCommand, send]);

  const value = {
    bins, alerts, frames, toasts, connected, fireAlerts, connectedDevices,
    isDemo,
    addToast, dismissToast,
    sendCommand: dispatchCommand,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
