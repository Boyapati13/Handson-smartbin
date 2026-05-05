import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Wifi, WifiOff, Thermometer, Signal, Clock } from 'lucide-react'
import { BINS, fillColor, statusColor } from '../data/bins'
import FillBar from '../components/FillBar'
import StatusBadge from '../components/StatusBadge'

const EVENTS = [
  { t: '14:32', msg: 'Compaction cycle complete', detail: 'Cycle #148 — fill 96% → 82%' },
  { t: '13:10', msg: 'Fill threshold reached', detail: 'Level crossed 80% threshold' },
  { t: '11:45', msg: 'Solar charging active', detail: 'Panel output 14.2 W' },
  { t: '09:00', msg: 'Daily health check passed', detail: 'All sensors nominal' },
  { t: '08:15', msg: 'Door opened', detail: 'Service access by Operator 02' },
  { t: '08:22', msg: 'Door closed', detail: 'Service complete' },
]

export default function BinDetail() {
  const { id } = useParams()
  const bin = BINS.find(b => b.id === id)

  if (!bin) return (
    <main style={{ padding: '64px 24px', textAlign: 'center', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ color: '#475569', fontSize: '0.9rem', marginBottom: 16 }}>Bin <code style={{ color: '#a3e635' }}>{id}</code> not found.</div>
      <Link to="/bins" style={{ color: '#a3e635', textDecoration: 'none', fontSize: '0.85rem' }}>← Back to fleet</Link>
    </main>
  )

  const fc = fillColor(bin.fill)
  const sc = statusColor(bin.status)

  return (
    <main style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Back */}
      <Link to="/bins" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#475569', textDecoration: 'none', fontSize: '0.8rem', marginBottom: 24 }}
        onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
        onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
        <ArrowLeft size={14} /> Back to fleet
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#a3e635', marginBottom: 4 }}>{bin.id}</div>
          <h1 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '1.8rem', color: '#fff', marginBottom: 4 }}>{bin.name}</h1>
          <div style={{ fontSize: '0.8rem', color: '#475569' }}>{bin.location}</div>
        </div>
        <StatusBadge status={bin.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Left: telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Fill gauge */}
          <div style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, padding: '24px' }}>
            <div style={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 10, letterSpacing: '0.05em' }}>FILL LEVEL</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '3rem', fontWeight: 700, color: fc, lineHeight: 1 }}>{bin.fill}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.2rem', color: '#475569' }}>%</span>
              <span style={{ fontSize: '0.78rem', color: '#475569', marginLeft: 8 }}>≈ {Math.round(bin.fill * 9.6)} L equivalent</span>
            </div>
            <FillBar pct={bin.fill} height={10} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: '0.68rem', color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>0 L</span>
              <span style={{ fontSize: '0.68rem', color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>960 L</span>
            </div>
          </div>

          {/* Metrics grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'Battery', value: `${bin.battery}%`, warn: bin.battery < 20, icon: '⚡' },
              { label: 'Temperature', value: bin.temp > 0 ? `${bin.temp}°C` : '—', warn: bin.temp > 55, icon: '🌡' },
              { label: 'Signal', value: `${bin.signal}/4`, warn: bin.signal < 2, icon: '📶' },
              { label: 'Compactions', value: bin.compactions, warn: false, icon: '🔄' },
              { label: 'Last seen', value: bin.lastSeen, warn: false, icon: '🕐' },
              { label: 'GPS', value: `${bin.lat.toFixed(4)}, ${bin.lng.toFixed(4)}`, warn: false, icon: '📍' },
            ].map(m => (
              <div key={m.label} style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: '0.68rem', color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 5, letterSpacing: '0.04em' }}>{m.label.toUpperCase()}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.95rem', fontWeight: 600, color: m.warn ? '#ef4444' : '#a3e635' }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Event log */}
          <div style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #111d38' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff' }}>Event log · today</span>
            </div>
            {EVENTS.map((e, i) => (
              <div key={i} style={{ padding: '10px 20px', borderBottom: '1px solid #0a0f1e', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#334155', minWidth: 36, paddingTop: 1 }}>{e.t}</span>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{e.msg}</div>
                  <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 2 }}>{e.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: info + actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, padding: '20px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff', marginBottom: 16 }}>Unit info</div>
            {[
              ['Model', 'Ecodisposer HY-CKX1'],
              ['Material', '#304 SS, powder-coated'],
              ['Dimensions', '650 × 700 × 1400 mm'],
              ['Weight', 'Approx. 80 kg'],
              ['Compaction', '7 kN · 8:1 ratio'],
              ['Capacity', '120 L / 960 L effective'],
              ['Power', '2×12V 20Ah + PV solar'],
              ['Connectivity', '4G/LTE modem'],
              ['Installed', '14 Mar 2025'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #0d1528' }}>
                <span style={{ fontSize: '0.75rem', color: '#475569' }}>{k}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', textAlign: 'right', maxWidth: '55%' }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, padding: '20px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff', marginBottom: 14 }}>Actions</div>
            {['Request collection', 'Log maintenance', 'Download service report', 'Acknowledge alerts'].map(action => (
              <button key={action} style={{ width: '100%', background: 'transparent', border: '1px solid #162347', color: '#94a3b8', fontSize: '0.78rem', padding: '9px 14px', borderRadius: 8, cursor: 'pointer', marginBottom: 8, textAlign: 'left', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#a3e635'; e.currentTarget.style.color = '#a3e635' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#162347'; e.currentTarget.style.color = '#94a3b8' }}>
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
