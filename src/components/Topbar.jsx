import { Link, useLocation } from 'react-router-dom';
import { Bell, Wifi, WifiOff, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ROUTE_LABELS = {
  '/dashboard':   ['Operations Centre'],
  '/fleet':       ['Fleet'],
  '/routes':      ['Route Planner'],
  '/analytics':   ['Analytics'],
  '/alerts':      ['Alerts'],
  '/maintenance': ['Maintenance'],
  '/reports':     ['Reports'],
  '/telemetry':   ['Telemetry Console'],
  '/public-report': ['Public Report'],
};

export default function Topbar() {
  const { connected, alerts }   = useApp();
  const { pathname }            = useLocation();

  const critCount  = alerts.filter(a => a.sev === 'crit').length;
  const labels     = ROUTE_LABELS[pathname] || [pathname.replace('/', '')];
  const isBinDetail = pathname.startsWith('/fleet/') && pathname !== '/fleet';

  return (
    <header style={{
      height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 0 var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      flexShrink: 0,
    }}>

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', opacity: 0.8, transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}>
          <img src="/handson-logo.svg" alt="HandsOn Systems" height={20} style={{ display:'block', objectFit:'contain' }} draggable={false} />
        </Link>
        {(labels[0] || isBinDetail) && (
          <>
            <ChevronRight size={12} color="var(--muted)" />
            {isBinDetail ? (
              <>
                <Link to="/fleet" style={{ fontSize: '0.8rem', color: 'var(--sub)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--sub)'}>
                  Fleet
                </Link>
                <ChevronRight size={12} color="var(--muted)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>
                  {pathname.split('/').pop()}
                </span>
              </>
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>
                {labels[0]}
              </span>
            )}
          </>
        )}
      </nav>

      {/* Right cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

        {/* Connection status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: connected ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${connected ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          borderRadius: 20, padding: '4px 10px',
          transition: 'all 0.3s',
        }}>
          {connected
            ? <Wifi size={11} color="var(--green)" strokeWidth={2.5} />
            : <WifiOff size={11} color="var(--crimson)" strokeWidth={2.5} />}
          <span style={{
            fontSize: '0.68rem', fontWeight: 700,
            fontFamily: 'IBM Plex Mono, monospace',
            color: connected ? 'var(--green)' : 'var(--crimson)',
            letterSpacing: '0.04em',
          }}>
            {connected ? 'LIVE' : 'OFFLINE'}
          </span>
          {connected && (
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', animation: 'pulse-ring 2s ease-out infinite' }} />
          )}
        </div>

        {/* Alert bell */}
        <Link to="/alerts" style={{ position: 'relative', textDecoration: 'none', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6, transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--ink)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Bell size={18} color={critCount > 0 ? 'var(--crimson)' : 'var(--sub)'} strokeWidth={1.8} />
          {critCount > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 0,
              width: 15, height: 15, borderRadius: '50%',
              background: 'var(--crimson)', color: '#fff',
              fontSize: '0.55rem', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'IBM Plex Mono, monospace',
              border: '2px solid var(--surface)',
            }}>
              {critCount}
            </span>
          )}
        </Link>

        {/* Operator avatar */}
        <div title="Operator" style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'linear-gradient(135deg, #29ABE2 0%, #1a8bbf 100%)',
          color: '#fff', fontSize: '0.68rem', fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, cursor: 'pointer',
          fontFamily: "'Syne', sans-serif",
          border: '2px solid rgba(41,171,226,0.3)',
          boxShadow: '0 2px 6px rgba(41,171,226,0.25)',
        }}>
          HS
        </div>
      </div>
    </header>
  );
}
