import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { fillColor } from '../data/bins'
import FillBar from '../components/FillBar'
import StatusBadge from '../components/StatusBadge'
import ArcGauge from '../components/ArcGauge'
import MapView from '../components/MapView'

const S = {
  card:  { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow)' },
  mono:  { fontFamily: 'IBM Plex Mono, monospace' },
  label: { fontSize: '0.62rem', fontFamily: 'IBM Plex Mono, monospace', color: 'var(--muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 },
}

const EVENTS = [
  { t:'14:32', type:'COMPACT', msg:'Compaction cycle complete',      detail:'Compression successful · fill reduced' },
  { t:'13:10', type:'FILL',    msg:'Fill threshold crossed',         detail:'Level exceeded 80% threshold' },
  { t:'11:45', type:'POWER',   msg:'Solar charging active',          detail:'Panel output 14.2 W detected' },
  { t:'09:00', type:'SYS',     msg:'Daily health check passed',      detail:'All 6 sensors nominal' },
  { t:'08:22', type:'DOOR',    msg:'Service door closed',            detail:'Access duration 7 min · Operator 02' },
  { t:'08:15', type:'DOOR',    msg:'Service door opened',            detail:'Key access · maintenance visit' },
]
const ETYPE_COL = { COMPACT:'var(--blue)', FILL:'var(--amber)', POWER:'var(--sky)', SYS:'var(--green)', DOOR:'var(--sub)' }

export default function BinDetail() {
  const { id } = useParams()
  const { bins, sendCommand } = useApp()
  const bin = bins.find(b => b.id === id)

  if (!bin) return (
    <div style={{ padding: '60px 32px', textAlign: 'center' }}>
      <div style={{ color: 'var(--sub)', marginBottom: 16 }}>Bin <code style={{ color: 'var(--blue)' }}>{id}</code> not found.</div>
      <Link to="/fleet" style={{ color: 'var(--blue)', textDecoration: 'none', fontSize: '0.85rem' }}>← Back to fleet</Link>
    </div>
  )

  const fc = fillColor(bin.fill)

  return (
    <div style={{ padding: '28px 32px', animation: 'slideUp 0.35s ease both' }}>

      <Link to="/fleet"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--sub)', textDecoration: 'none', fontSize: '0.78rem', marginBottom: 20, fontFamily: 'Figtree, sans-serif', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--blue)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--sub)'}>
        <ArrowLeft size={14} />
        Back to fleet
      </Link>

      {/* Hero card */}
      <div style={{ ...S.card, padding: '24px 28px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 320, background: `radial-gradient(ellipse at right,${fc === 'var(--blue)' || fc === '#29ABE2' ? 'rgba(41,171,226,0.07)' : `${fc}08`} 0%,transparent 70%)` }} />
        <div style={{ position: 'absolute', top: 20, right: 28 }}>
          <ArcGauge pct={bin.fill} size={110} stroke={9} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <StatusBadge status={bin.status} />
          <span style={{ ...S.mono, fontSize: '0.62rem', color: 'var(--sub)' }}>{bin.seen} ago</span>
        </div>
        <div style={{ ...S.mono, fontSize: '0.7rem', color: 'var(--blue)', marginBottom: 5 }}>{bin.id}</div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4 }}>{bin.name}</h1>
        <div style={{ fontSize: '0.8rem', color: 'var(--sub)', marginBottom: 20 }}>{bin.area}, Malta</div>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {[
            ['Fill Level',       `${bin.fill}%`,                                   fc],
            ['Battery',          `${bin.battery}%`,                                bin.battery < 20 ? 'var(--crimson)' : 'var(--green)'],
            ['Temperature',      bin.temp > 0 ? `${bin.temp}°C` : '—',            'var(--sky)'],
            ['Signal',           `${bin.signal}/4`,                                bin.signal < 2 ? 'var(--amber)' : 'var(--sub)'],
            ['Compactions Today', bin.cycles,                                      'var(--sub)'],
          ].map(([l,v,c]) => (
            <div key={l}>
              <div style={S.label}>{l}</div>
              <div style={{ ...S.mono, fontSize: '1.1rem', fontWeight: 600, color: c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Fill detail */}
        <div style={{ ...S.card, padding: '20px 22px' }}>
          <div style={S.label}>Effective Fill</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
            <span style={{ ...S.mono, fontSize: '2.6rem', fontWeight: 600, color: fc, lineHeight: 1 }}>
              {bin.fill}<span style={{ fontSize: '1.2rem', color: 'var(--sub)' }}>%</span>
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--sub)' }}>≈ {Math.round(bin.fill * 9.6)} L of 960 L</span>
          </div>
          <FillBar pct={bin.fill} height={10} glow showLabel={false} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ ...S.mono, fontSize: '0.6rem', color: 'var(--muted)' }}>0 L EMPTY</span>
            <span style={{ ...S.mono, fontSize: '0.6rem', color: 'var(--muted)' }}>960 L FULL</span>
          </div>
        </div>

        {/* Quick stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { l:'Battery',            v:`${bin.battery}%`,              warn: bin.battery < 20 },
            { l:'Temperature',        v: bin.temp > 0 ? `${bin.temp}°C` : '—', warn: false },
            { l:'Signal',             v:`${bin.signal}/4 bars`,         warn: bin.signal < 2 },
            { l:'Compactions Today',  v: bin.cycles,                    warn: false },
          ].map(m => (
            <div key={m.l} style={{ ...S.card, padding: '14px 15px' }}>
              <div style={S.label}>{m.l}</div>
              <div style={{ ...S.mono, fontSize: '1rem', fontWeight: 600, color: m.warn ? 'var(--crimson)' : 'var(--blue)' }}>{m.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Event log */}
        <div style={{ ...S.card, overflow: 'hidden' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>Event Log</span>
            <span style={{ ...S.mono, fontSize: '0.6rem', color: 'var(--sub)', marginLeft: 10 }}>TODAY</span>
          </div>
          {EVENTS.map((e,i) => (
            <div key={i} style={{ padding: '9px 18px', borderBottom: '1px solid var(--surface)', display: 'flex', gap: 14 }}>
              <span style={{ ...S.mono, fontSize: '0.63rem', color: 'var(--muted)', minWidth: 36, paddingTop: 2 }}>{e.t}</span>
              <span style={{ ...S.mono, fontSize: '0.6rem', fontWeight: 600, color: ETYPE_COL[e.type] || 'var(--sub)', minWidth: 52, paddingTop: 2 }}>{e.type}</span>
              <div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text)', marginBottom: 2 }}>{e.msg}</div>
                <div style={{ fontSize: '0.66rem', color: 'var(--sub)' }}>{e.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Location mini-map */}
        <div style={{ ...S.card, overflow: 'hidden' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>Location</span>
            <span style={{ ...S.mono, fontSize: '0.6rem', color: 'var(--sub)' }}>{bin.area}, Malta</span>
          </div>
          <MapView bins={[bin]} height={220} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Operational details — no datasheet specs */}
        <div style={{ ...S.card, padding: '18px' }}>
          <div style={S.label}>Unit Details</div>
          {[
            ['Model',       'HY-CKX1 — Solar Smart Compactor'],
            ['Installed',   '14 Mar 2025'],
            ['Last Service','28 Apr 2026'],
            ['Connectivity','4G/LTE modem'],
            ['Power',       '2×12V 20Ah + PV solar'],
            ['Capacity',    '960 L · 7 kN compaction'],
          ].map(([k,v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--surface)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>{k}</span>
              <span style={{ ...S.mono, fontSize: '0.72rem', color: 'var(--text)', textAlign: 'right', maxWidth: '55%' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ ...S.card, padding: '18px' }}>
          <div style={S.label}>Quick Actions</div>
          {[
            ['Request collection',    'var(--blue)',  '#ffffff',        () => sendCommand('compact',     bin.id)],
            ['Log maintenance',       'transparent',  'var(--text)',    () => {}],
            ['Raise fault ticket',    'transparent',  'var(--crimson)', () => {}],
            ['Acknowledge alerts',    'transparent',  'var(--text)',    () => sendCommand('acknowledge', bin.id)],
            ['Download service report','transparent', 'var(--text)',    () => {}],
          ].map(([label, bg, col, action]) => (
            <button key={label} onClick={action} style={{
              width: '100%', background: bg,
              border: `1px solid ${bg === 'transparent' ? 'var(--border2)' : bg}`,
              color: col, fontSize: '0.78rem',
              fontWeight: bg === 'transparent' ? 500 : 700,
              fontFamily: 'Figtree, sans-serif', padding: '10px 14px',
              borderRadius: 7, cursor: 'pointer', marginBottom: 7,
              textAlign: 'left', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; if (bg === 'transparent') e.currentTarget.style.color = 'var(--blue)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = bg === 'transparent' ? 'var(--border2)' : bg; e.currentTarget.style.color = col }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
