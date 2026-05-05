import { NavLink, Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/bins', label: 'Bins' },
  { to: '/routes', label: 'Routes' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/specifications', label: 'Specs' },
]

export default function Navbar() {
  return (
    <header style={{ background: 'rgba(10,15,30,0.9)', borderBottom: '1px solid rgba(22,35,71,0.8)', backdropFilter: 'blur(12px)' }}
      className="sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span style={{ background: '#a3e635', borderRadius: '6px' }} className="p-1">
            <Leaf size={16} style={{ color: '#0a0f1e' }} />
          </span>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: '#fff', fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
            HandsOn <span style={{ color: '#a3e635' }}>SmartBin</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              style={({ isActive }) => ({
                color: isActive ? '#a3e635' : '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'color 0.2s',
              })}
              onMouseEnter={e => { if (e.currentTarget.style.color !== '#a3e635') e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { if (e.currentTarget.style.color !== '#a3e635') e.currentTarget.style.color = '#94a3b8' }}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/dashboard" style={{
          background: '#a3e635', color: '#0a0f1e', fontSize: '0.78rem', fontWeight: 700,
          padding: '6px 16px', borderRadius: '8px', textDecoration: 'none',
          transition: 'background 0.2s',
        }}>
          Console
        </Link>
      </div>
    </header>
  )
}
