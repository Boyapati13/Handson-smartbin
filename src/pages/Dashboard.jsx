import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, WifiOff, Zap, Battery, RefreshCw, Route } from 'lucide-react'
import { BINS, ALERTS, ACTIVITY, statusColor, fillColor } from '../data/bins'
import FillBar from '../components/FillBar'
import StatusBadge from '../components/StatusBadge'

const STAT_CARDS = [
  { label: 'Total Bins', value: 8, sub: 'Deployed across Malta' },
  { label: 'Online', value: '7/8', sub: '87.5% availability' },
  { label: 'Active Alerts', value: 4, sub: '1 critical · 3 warnings' },
  { label: 'Avg Battery', value: '63%', sub: '1 unit below 15%' },
]

const ALERT_ICONS = {
  full: Zap,
  battery: Battery,
  offline: WifiOff,
  fault: AlertTriangle,
}

export default function Dashboard() {
  const [refresh, setRefresh] = useState(false)

  return (
    <main style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '1.9rem', color: '#fff', marginBottom: 4 }}>
            Operations Dashboard
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Live fleet status · Malta · CT2386-2025</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setRefresh(r => !r)} style={{ border: '1px solid #162347', color: '#94a3b8', fontSize: '0.8rem', padding: '8px 16px', borderRadius: 8, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/routes" style={{ background: '#a3e635', color: '#0a0f1e', fontWeight: 700, fontSize: '0.8rem', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Route size={14} /> Plan route
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, padding: '20px 20px' }}>
            <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: 6, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>{s.label}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.8rem', fontWeight: 700, color: '#a3e635', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: '0.74rem', color: '#475569' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Fleet map / bin list */}
        <div>
          <div style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #111d38', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff' }}>Fleet map · Malta</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#475569' }}>{BINS.length} units</span>
            </div>

            {/* Map placeholder */}
            <div style={{ position: 'relative', background: '#080d1a', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 40%,rgba(22,35,71,0.8) 0%,transparent 60%),radial-gradient(circle at 70% 60%,rgba(13,21,40,0.9) 0%,transparent 50%)' }} />
              {/* Malta outline approximation with dots */}
              {BINS.map((b, i) => {
                const normLng = ((b.lng - 14.32) / (14.58 - 14.32)) * 100
                const normLat = ((35.965 - b.lat) / (35.965 - 35.835)) * 100
                const c = statusColor(b.status).dot
                return (
                  <Link key={b.id} to={`/bins/${b.id}`}
                    title={`${b.name} — ${b.fill}%`}
                    style={{ position: 'absolute', left: `${normLng}%`, top: `${normLat}%`, transform: 'translate(-50%,-50%)', cursor: 'pointer', zIndex: 2 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}`, border: '1.5px solid rgba(255,255,255,0.2)' }} />
                  </Link>
                )
              })}
              {/* legend */}
              <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[['#a3e635','Operational'],['#f59e0b','Warning / Full'],['#ef4444','Fault'],['#64748b','Offline']].map(([c,l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bin table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #111d38' }}>
                    {['Unit', 'Location', 'Status', 'Fill', 'Battery', ''].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#475569', fontWeight: 600, fontSize: '0.68rem', letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BINS.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #0a0f1e', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#111d38'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', color: '#a3e635', fontWeight: 600 }}>{b.id}</td>
                      <td style={{ padding: '10px 16px', color: '#cbd5e1', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</td>
                      <td style={{ padding: '10px 16px' }}><StatusBadge status={b.status} /></td>
                      <td style={{ padding: '10px 16px', minWidth: 100 }}>
                        <FillBar pct={b.fill} height={5} showLabel />
                      </td>
                      <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: b.battery < 20 ? '#ef4444' : '#94a3b8' }}>
                        {b.battery}%
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <Link to={`/bins/${b.id}`} style={{ fontSize: '0.72rem', color: '#475569', textDecoration: 'none', border: '1px solid #162347', borderRadius: 6, padding: '3px 10px', display: 'inline-block' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#a3e635'; e.currentTarget.style.color = '#a3e635' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#162347'; e.currentTarget.style.color = '#475569' }}>
                          Detail →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: alerts + activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Alerts */}
          <div style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #111d38' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff' }}>Live alerts</span>
            </div>
            <div>
              {ALERTS.map(a => {
                const Icon = ALERT_ICONS[a.type] || AlertTriangle
                const color = a.severity === 'critical' ? '#ef4444' : '#f59e0b'
                return (
                  <Link key={a.id} to={`/bins/${a.binId}`} style={{ display: 'flex', gap: 12, padding: '12px 18px', borderBottom: '1px solid #0a0f1e', textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#111d38'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Icon size={14} style={{ color, flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 2 }}>{a.binName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#475569' }}>{a.msg}</div>
                      <div style={{ fontSize: '0.66rem', color: '#334155', marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>{a.time}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Activity */}
          <div style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #111d38' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff' }}>Recent activity</span>
            </div>
            <div>
              {ACTIVITY.map(a => (
                <div key={a.id} style={{ padding: '12px 18px', borderBottom: '1px solid #0a0f1e', display: 'flex', gap: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#162347', border: '1px solid #1e3163', flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: 2 }}>{a.msg}</div>
                    <div style={{ fontSize: '0.7rem', color: '#475569' }}>{a.sub}</div>
                    <div style={{ fontSize: '0.66rem', color: '#334155', marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
