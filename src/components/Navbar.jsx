import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Layers, Navigation, BarChart2, Bell, FileText, Wrench, Monitor, LogOut } from 'lucide-react'
import { fillColor } from '../data/bins'
import { HandsOnBadge } from './HandsOnLogo'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/dashboard',   label: 'Dashboard',   Icon: LayoutDashboard },
  { to: '/device',      label: 'Live Device',  Icon: Monitor, highlight: true },
  { to: '/fleet',       label: 'Fleet',        Icon: Layers },
  { to: '/routes',      label: 'Routes',       Icon: Navigation },
  { to: '/analytics',   label: 'Analytics',    Icon: BarChart2 },
  { to: '/alerts',      label: 'Alerts',       Icon: Bell },
  { to: '/maintenance', label: 'Maintenance',  Icon: Wrench },
  { to: '/reports',     label: 'Reports',      Icon: FileText },
]

function LiveClock() {
  const [t, setT] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem', color: 'var(--sub)' }}>
      {t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  )
}

export default function Navbar() {
  const { connectedDevices = [], bins } = useApp()
  const { logout, user, isDemo }        = useAuth()
  const navigate                        = useNavigate()
  const deviceLive = connectedDevices.some(d => d.connected)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <aside style={{ width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)', boxShadow: '1px 0 0 0 var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh', position: 'sticky', top: 0 }}>

      {/* Logo + status */}
      <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ marginBottom: 12 }}>
          <HandsOnBadge iconSize={30} color="#29ABE2" subColor="var(--sub)" />
        </div>
        <div style={{ background: 'var(--ink)', borderRadius: 8, padding: '7px 11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isDemo ? '#f59e0b' : 'var(--green)', display: 'inline-block', boxShadow: isDemo ? '0 0 6px #f59e0b' : '0 0 6px #10b981', animation: 'pulse-ring 2s ease-out infinite' }} />
            <span style={{ fontSize: '0.65rem', color: isDemo ? 'var(--amber)' : 'var(--green)', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>
              {isDemo ? 'DEMO' : 'LIVE'}
            </span>
          </div>
          <LiveClock />
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ padding: '10px', flex: 1 }}>
        {links.map(({ to, label, Icon, highlight }) => (
          <NavLink key={to} to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 7, marginBottom: 2,
              textDecoration: 'none', transition: 'all 0.15s',
              fontFamily: 'Figtree, sans-serif', fontWeight: 500, fontSize: '0.82rem',
              background: isActive ? 'var(--blue-dim)' : highlight && deviceLive ? 'rgba(16,185,129,0.07)' : 'transparent',
              border: isActive ? '1px solid var(--blue-glow)' : highlight && deviceLive ? '1px solid rgba(16,185,129,0.25)' : '1px solid transparent',
              color: isActive ? 'var(--text)' : 'var(--sub)',
            })}>
            {({ isActive }) => (
              <>
                <Icon size={14} strokeWidth={isActive ? 2.2 : 1.8}
                  color={isActive ? 'var(--blue)' : highlight && deviceLive ? 'var(--green)' : 'var(--muted)'} />
                <span style={{ flex: 1 }}>{label}</span>
                {highlight && deviceLive && (
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px #10b981', animation: 'pulse-ring 2s ease-out infinite', flexShrink: 0 }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Fleet fill mini-bars */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.59rem', color: 'var(--muted)', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.07em', marginBottom: 8 }}>FLEET FILL</div>
        <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
          {bins.map(b => (
            <div key={b.id} title={`${b.id}: ${b.fill}%`} style={{ flex: 1, height: 28, borderRadius: 3, background: 'var(--ink)', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', border: '1px solid var(--border)' }}>
              <div style={{ width: '100%', height: `${b.fill}%`, background: fillColor(b.fill), borderRadius: 3, transition: 'height 0.6s' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: '0.59rem', color: 'var(--muted)', fontFamily: 'IBM Plex Mono, monospace' }}>{bins.length} UNITS</span>
          <span style={{ fontSize: '0.59rem', color: 'var(--green)', fontFamily: 'IBM Plex Mono, monospace' }}>{bins.filter(b => b.status !== 'offline').length} ONLINE</span>
        </div>

        {/* User + logout */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: 'var(--ink)', borderRadius: 7, border: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text)', fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '0.58rem', color: 'var(--muted)', fontFamily: 'IBM Plex Mono, monospace' }}>{user?.role}</div>
          </div>
          <button onClick={handleLogout} title="Sign out"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--muted)', display: 'flex', alignItems: 'center', borderRadius: 4, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--crimson)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  )
}
