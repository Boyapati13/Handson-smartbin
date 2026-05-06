import { Link } from 'react-router-dom'
import { BINS, ALERTS, WEEK_DATA, fillColor, statusMap } from '../data/bins'
import FillBar from '../components/FillBar'
import StatusBadge from '../components/StatusBadge'
import ArcGauge from '../components/ArcGauge'

const S = {
  card: { background: '#0b1120', border: '1px solid #131e35', borderRadius: 10 },
  mono: { fontFamily: 'IBM Plex Mono, monospace' },
  label: { fontSize: '0.62rem', fontFamily: 'IBM Plex Mono, monospace', color: '#3a4a64', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 },
}

const maxFill = Math.max(...WEEK_DATA.map(d => d.v))
const avgFill = Math.round(WEEK_DATA.reduce((s, d) => s + d.v, 0) / WEEK_DATA.length)

export default function Dashboard() {
  const critical = BINS.filter(b => b.fill >= 90 || b.status === 'fault').length
  const collections = BINS.filter(b => b.fill >= 80 && b.status !== 'offline').length
  const online = BINS.filter(b => b.status !== 'offline').length

  return (
    <div style={{ padding: '28px 32px', animation: 'slideUp 0.35s ease both' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.7rem', fontWeight: 700, color: '#f0f4ff', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Operations Centre
          </h1>
          <div style={{ ...S.mono, fontSize: '0.7rem', color: '#5a6b8a' }}>Malta Smart Bin Network · CT2386-2025 · Tue 5 May 2026</div>
        </div>
        <Link to="/routes" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#8fff00', color: '#05080f', fontWeight: 700, fontSize: '0.82rem', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontFamily: 'Figtree, sans-serif', boxShadow: '0 0 20px rgba(143,255,0,0.2)' }}>
          ⇢ Dispatch Route
        </Link>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Avg Fill Level', value: `${avgFill}%`, sub: 'Fleet average', color: '#8fff00' },
          { label: 'Need Collection', value: collections, sub: 'Above 80% threshold', color: '#ffb347' },
          { label: 'Critical Issues', value: critical, sub: 'Faults + overflow', color: critical > 0 ? '#ff3b55' : '#8fff00' },
          { label: 'Fleet Uptime', value: `${Math.round((online / BINS.length) * 100)}%`, sub: `${online} of ${BINS.length} units live`, color: '#38bdf8' },
        ].map(k => (
          <div key={k.label} style={{ ...S.card, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 70, height: 70, background: `radial-gradient(circle at top right, ${k.color}12 0%, transparent 70%)` }} />
            <div style={S.label}>{k.label}</div>
            <div style={{ ...S.mono, fontSize: '2rem', fontWeight: 600, color: k.color, lineHeight: 1, marginBottom: 4 }}>{k.value}</div>
            <div style={{ fontSize: '0.7rem', color: '#5a6b8a' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Map */}
          <div style={{ ...S.card, overflow: 'hidden' }}>
            <div style={{ padding: '13px 18px', borderBottom: '1px solid #131e35', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f0f4ff' }}>Bin Network</span>
                <span style={{ ...S.mono, fontSize: '0.62rem', color: '#5a6b8a', marginLeft: 10 }}>MALTA</span>
              </div>
              <div style={{ display: 'flex', gap: 14 }}>
                {[['#8fff00','Online'],['#ffb347','Warning'],['#ff3b55','Fault'],['#3a4a64','Offline']].map(([c,l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: c }} />
                    <span style={{ fontSize: '0.62rem', color: '#5a6b8a', ...S.mono }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative', background: '#0a1020', height: 200, overflow: 'hidden' }}>
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }}>
                {[...Array(10)].map((_, i) => (
                  <g key={i}>
                    <line x1={`${i * 11.1}%`} y1="0" x2={`${i * 11.1}%`} y2="100%" stroke="#1a2840" strokeWidth="1" />
                    <line x1="0" y1={`${i * 11.1}%`} x2="100%" y2={`${i * 11.1}%`} stroke="#1a2840" strokeWidth="1" />
                  </g>
                ))}
              </svg>
              {/* Malta coast hint */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }}>
                <path d="M150,60 Q200,40 280,55 Q350,45 420,70 Q480,90 500,130 Q490,160 440,165 Q400,180 350,170 Q300,190 250,175 Q200,185 160,160 Q120,140 130,100 Z" fill="#8fff00" />
              </svg>
              {BINS.map(b => {
                const { color } = statusMap[b.status] || { color: '#3a4a64' }
                return (
                  <Link key={b.id} to={`/fleet/${b.id}`} title={`${b.id} · ${b.name} · ${b.fill}%`}
                    style={{ position: 'absolute', left: `${b.mapX}%`, top: `${b.mapY}%`, transform: 'translate(-50%,-50%)', zIndex: 3 }}>
                    <div style={{ position: 'relative' }}>
                      {(b.status === 'online' || b.status === 'full') &&
                        <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', background: color, opacity: 0.2, animation: 'pulse-ring 2.5s ease-out infinite' }} />}
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, border: '1.5px solid rgba(255,255,255,0.15)', boxShadow: `0 0 10px ${color}80` }} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Gauge grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {BINS.map(b => (
              <Link key={b.id} to={`/fleet/${b.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ ...S.card, padding: '14px 12px', textAlign: 'center', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#1a2840'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#131e35'}>
                  <div style={{ ...S.mono, fontSize: '0.6rem', color: '#8fff00', marginBottom: 6 }}>{b.id}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                    <ArcGauge pct={b.fill} size={64} stroke={5} />
                  </div>
                  <StatusBadge status={b.status} />
                  <div style={{ fontSize: '0.62rem', color: '#5a6b8a', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Fill trend */}
          <div style={{ ...S.card, padding: '18px 20px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0f4ff', marginBottom: 4 }}>Fill Trend</div>
            <div style={{ ...S.mono, fontSize: '0.62rem', color: '#5a6b8a', marginBottom: 14 }}>AVG % · LAST 7 DAYS</div>
            <svg width="100%" height="80" viewBox="0 0 300 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8fff00" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#8fff00" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={`0,80 ${WEEK_DATA.map((d,i) => `${(i/(WEEK_DATA.length-1))*300},${80-(d.v/100)*70}`).join(' ')} 300,80`} fill="url(#tg)" />
              <polyline points={WEEK_DATA.map((d,i) => `${(i/(WEEK_DATA.length-1))*300},${80-(d.v/100)*70}`).join(' ')} fill="none" stroke="#8fff00" strokeWidth="2" strokeLinejoin="round" />
              {WEEK_DATA.map((d,i) => (
                <circle key={i} cx={(i/(WEEK_DATA.length-1))*300} cy={80-(d.v/100)*70} r="3" fill="#8fff00" style={{ filter: 'drop-shadow(0 0 3px #8fff00)' }} />
              ))}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              {WEEK_DATA.map(d => (
                <div key={d.d} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: '#3a4a64', ...S.mono }}>{d.d}</div>
                  <div style={{ fontSize: '0.6rem', color: fillColor(d.v), ...S.mono }}>{d.v}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Alerts */}
          <div style={{ ...S.card, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #131e35', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#f0f4ff' }}>Active Alerts</span>
              <span style={{ ...S.mono, fontSize: '0.62rem', color: ALERTS.filter(a => a.sev === 'crit').length > 0 ? '#ff3b55' : '#8fff00' }}>
                {ALERTS.filter(a => a.sev === 'crit').length} CRITICAL
              </span>
            </div>
            {ALERTS.map(a => (
              <Link key={a.id} to={`/fleet/${a.bin}`} style={{ display: 'flex', gap: 12, padding: '11px 16px', borderBottom: '1px solid #08111f', textDecoration: 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#0f1729'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 2, borderRadius: 4, background: a.sev === 'crit' ? '#ff3b55' : '#ffb347', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ ...S.mono, fontSize: '0.62rem', fontWeight: 600, color: a.sev === 'crit' ? '#ff3b55' : '#ffb347' }}>{a.type}</span>
                    <span style={{ ...S.mono, fontSize: '0.6rem', color: '#3a4a64' }}>{a.age}</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 500, color: '#f0f4ff', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#5a6b8a' }}>{a.msg}</div>
                  {a.hex && <div style={{ ...S.mono, fontSize: '0.58rem', color: '#3a4a64', marginTop: 4 }}>{a.hex}</div>}
                </div>
              </Link>
            ))}
          </div>

          {/* Collection queue */}
          <div style={{ ...S.card, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #131e35' }}>
              <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#f0f4ff' }}>Collection Queue</span>
            </div>
            {[...BINS].filter(b => b.fill >= 70 && b.status !== 'offline').sort((a,b) => b.fill - a.fill).map((b,i) => (
              <div key={b.id} style={{ padding: '10px 16px', borderBottom: '1px solid #08111f', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ ...S.mono, fontSize: '0.68rem', fontWeight: 600, color: '#3a4a64', minWidth: 18 }}>#{i+1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#f0f4ff', marginBottom: 4 }}>{b.name}</div>
                  <FillBar pct={b.fill} height={4} glow />
                </div>
                <span style={{ ...S.mono, fontSize: '0.7rem', fontWeight: 600, color: fillColor(b.fill) }}>{b.fill}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
