import { NavLink, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Leaf, Radio } from 'lucide-react'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/fleet', label: 'Fleet' },
  { to: '/routes', label: 'Routes' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/telemetry', label: 'Telemetry' },
]

function LiveClock() {
  const [t, setT] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id) }, [])
  return <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem', color: '#5a6b8a' }}>
    {t.toLocaleTimeString('en-MT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
  </span>
}

export default function Navbar() {
  return (
    <aside style={{ width: 220, background: '#080d18', borderRight: '1px solid #131e35', display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh', position: 'sticky', top: 0 }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #131e35' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#8fff00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Leaf size={16} color="#05080f" />
          </div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#f0f4ff', letterSpacing: '-0.01em' }}>HandsOn</div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.58rem', color: '#8fff00', letterSpacing: '0.08em' }}>SMARTBIN · OPS</div>
          </div>
        </div>
        {/* Live status */}
        <div style={{ background: '#0f1729', borderRadius: 6, padding: '7px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8fff00', display: 'inline-block', boxShadow: '0 0 6px #8fff00', animation: 'pulse-ring 2s ease-out infinite' }} />
            <span style={{ fontSize: '0.65rem', color: '#8fff00', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>LIVE</span>
          </div>
          <LiveClock />
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ padding: '10px 10px', flex: 1 }}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 7, marginBottom: 2,
              textDecoration: 'none', transition: 'all 0.15s', fontFamily: 'Figtree, sans-serif',
              fontWeight: 500, fontSize: '0.82rem',
              background: isActive ? 'rgba(143,255,0,0.08)' : 'transparent',
              border: isActive ? '1px solid rgba(143,255,0,0.18)' : '1px solid transparent',
              color: isActive ? '#f0f4ff' : '#5a6b8a',
            })}>
            {({ isActive }) => (
              <>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: isActive ? '#8fff00' : 'transparent', flexShrink: 0 }} />
                {l.label}
                {l.to === '/telemetry' && (
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                    <Radio size={10} color={isActive ? '#8fff00' : '#3a4a64'} />
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Fleet mini-bars */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid #131e35' }}>
        <div style={{ fontSize: '0.6rem', color: '#3a4a64', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.06em', marginBottom: 8 }}>FLEET FILL</div>
        <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
          {[62,96,14,31,45,0,88,55].map((f,i) => (
            <div key={i} style={{ flex: 1, height: 28, borderRadius: 3, background: '#131e35', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', height: `${f}%`, background: f>=90?'#ff3b55':f>=70?'#ffb347':'#8fff00', borderRadius: 3, transition: 'height 0.6s' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.6rem', color: '#3a4a64', fontFamily: 'IBM Plex Mono, monospace' }}>8 UNITS</span>
          <span style={{ fontSize: '0.6rem', color: '#8fff00', fontFamily: 'IBM Plex Mono, monospace' }}>7 ONLINE</span>
        </div>
      </div>
    </aside>
  )
}
