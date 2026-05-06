import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SEV_CONFIG = {
  success: { Icon: CheckCircle, color: 'var(--green)',   bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'  },
  warning: { Icon: AlertTriangle, color: 'var(--amber)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)'  },
  error:   { Icon: XCircle,      color: 'var(--crimson)',bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)'   },
  info:    { Icon: Info,         color: 'var(--blue)',   bg: 'rgba(41,171,226,0.08)', border: 'rgba(41,171,226,0.2)'  },
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      display: 'flex', flexDirection: 'column', gap: 8,
      zIndex: 9999, maxWidth: 380, width: '100%',
    }}
      role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map(t => {
        const { Icon, color, bg, border } = SEV_CONFIG[t.sev] || SEV_CONFIG.info;
        return (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: 'var(--surface)',
            border: `1px solid ${border}`,
            borderLeft: `3px solid ${color}`,
            borderRadius: 10,
            padding: '12px 14px',
            boxShadow: 'var(--shadow-md)',
            animation: 'slideUp 0.25s ease both',
          }}>
            <Icon size={16} color={color} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.45 }}>
              {t.msg}
            </span>
            <button onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, borderRadius: 4, color: 'var(--muted)', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
