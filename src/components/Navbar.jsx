import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Layers, Navigation, BarChart2, Bell, Radio, FileText, Wrench } from 'lucide-react'
import { BINS, fillColor } from '../data/bins'
import { HandsOnIcon } from './HandsOnLogo'

const links = [
  { to: '/dashboard',   label: 'Dashboard',   Icon: LayoutDashboard },
  { to: '/fleet',       label: 'Fleet',        Icon: Layers },
  { to: '/routes',      label: 'Routes',       Icon: Navigation },
  { to: '/analytics',   label: 'Analytics',    Icon: BarChart2 },
  { to: '/alerts',      label: 'Alerts',       Icon: Bell },
  { to: '/maintenance', label: 'Maintenance',  Icon: Wrench },
  { to: '/reports',     label: 'Reports',      Icon: FileText },
  { to: '/telemetry',   label: 'Telemetry',    Icon: Radio },
]

function LiveClock() {
  const [t, setT] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem', color: 'var(--sub)' }}>
      {t.toLocaleTimeString('en-MT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  )
}

export default function Navbar() {
  const online = BINS.filter(b => b.status !== 'offline').length

  return (
    <aside style={{
      width: 220, background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      boxShadow: '1px 0 0 0 var(--border)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      height: '100vh', position: 'sticky', top: 0,
    }}>

      {/* Logo */}
      <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ marginBottom: 12 }}>
          {/* Official HandsOn Systems logo SVG */}
          <img
            src="/handson-logo.svg"
            alt="HandsOn Systems"
            style={{ height: 28, display: 'block', objectFit: 'contain' }}
            draggable={false}
          />
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.55rem', color: 'var(--sub)', letterSpacing: '0.1em', marginTop: 4 }}>SMARTBIN · OPS</div>
        </div>

        {/* Live status pill */}
        <div style={{
          background: 'var(--ink)', borderRadius: 8, padding: '7px 11px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: 'var(--green)',
              display: 'inline-block', boxShadow: '0 0 6px #10b981',
              animation: 'pulse-ring 2s ease-out infinite',
            }} />
            <span style={{ fontSize: '0.65rem', color: 'var(--green)', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>LIVE</span>
          </div>
          <LiveClock />
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ padding: '10px', flex: 1 }} role="navigation" aria-label="Main navigation">
        {links.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} aria-label={label}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 7, marginBottom: 2,
              textDecoration: 'none', transition: 'all 0.15s',
              fontFamily: 'Figtree, sans-serif', fontWeight: 500, fontSize: '0.82rem',
              background: isActive ? 'var(--blue-dim)' : 'transparent',
              border: isActive ? '1px solid var(--blue-glow)' : '1px solid transparent',
              color: isActive ? 'var(--text)' : 'var(--sub)',
            })}>
            {({ isActive }) => (
              <>
                <Icon size={14} strokeWidth={isActive ? 2.2 : 1.8}
                  color={isActive ? 'var(--blue)' : 'var(--muted)'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Fleet fill mini-bars — live BINS data */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.59rem', color: 'var(--muted)', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.07em', marginBottom: 8 }}>
          FLEET FILL
        </div>
        <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
          {BINS.map(b => (
            <div key={b.id} title={`${b.id}: ${b.fill}%`} style={{
              flex: 1, height: 28, borderRadius: 3,
              background: 'var(--ink)', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                width: '100%', height: `${b.fill}%`,
                background: fillColor(b.fill),
                borderRadius: 3, transition: 'height 0.6s',
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.59rem', color: 'var(--muted)', fontFamily: 'IBM Plex Mono, monospace' }}>{BINS.length} UNITS</span>
          <span style={{ fontSize: '0.59rem', color: 'var(--green)', fontFamily: 'IBM Plex Mono, monospace' }}>{online} ONLINE</span>
        </div>
      </div>
    </aside>
  )
}
