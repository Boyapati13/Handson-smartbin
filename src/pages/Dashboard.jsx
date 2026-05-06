import { Link } from 'react-router-dom'
import { ArrowRight, Zap } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useApp } from '../context/AppContext'
import { WEEK_DATA, fillColor } from '../data/bins'
import FillBar    from '../components/FillBar'
import StatusBadge from '../components/StatusBadge'
import ArcGauge   from '../components/ArcGauge'
import MapView    from '../components/MapView'

/* ── shared style tokens ────────────────────────────────────────────────── */
const card  = { background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, boxShadow:'var(--shadow)' }
const mono  = { fontFamily:'IBM Plex Mono, monospace' }
const label = { fontSize:'0.68rem', ...mono, color:'var(--muted)', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:6 }

/* ── custom Recharts tooltip ─────────────────────────────────────────────── */
function FillTooltip({ active, payload, label: day }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', boxShadow:'var(--shadow-md)', fontSize:'0.78rem' }}>
      <div style={{ color:'var(--sub)', marginBottom:4, ...mono, fontSize:'0.68rem' }}>{day}</div>
      <div style={{ color:'var(--blue)', fontWeight:700, ...mono }}>{payload[0].value}%</div>
    </div>
  )
}

function LiveDate() {
  const now = new Date()
  return (
    <span style={{ ...mono, fontSize:'0.7rem', color:'var(--sub)' }}>
      {now.toLocaleDateString('en-MT', { weekday:'short', day:'numeric', month:'long', year:'numeric' })}
    </span>
  )
}

const avgFill = Math.round(WEEK_DATA.reduce((s,d) => s + d.v, 0) / WEEK_DATA.length)

export default function Dashboard() {
  const { bins, alerts } = useApp()

  const critical    = bins.filter(b => b.fill >= 90 || b.status === 'fault').length
  const collections = bins.filter(b => b.fill >= 80 && b.status !== 'offline').length
  const online      = bins.filter(b => b.status !== 'offline').length
  const liveAvg     = Math.round(bins.reduce((s,b) => s + b.fill, 0) / bins.length)

  const kpis = [
    { label:'Avg Fill Level',  value:`${liveAvg}%`,  sub:'Fleet live average',             color:'var(--blue)',    glow:'rgba(41,171,226,0.12)'  },
    { label:'Need Collection', value:collections,    sub:'Above 80% threshold',             color:'var(--amber)',   glow:'rgba(245,158,11,0.12)'  },
    { label:'Critical Issues', value:critical,       sub:'Faults + overflow',               color: critical>0?'var(--crimson)':'var(--green)', glow: critical>0?'rgba(239,68,68,0.12)':'rgba(16,185,129,0.12)' },
    { label:'Fleet Uptime',    value:`${Math.round((online/bins.length)*100)}%`, sub:`${online} of ${bins.length} units live`, color:'var(--green)', glow:'rgba(16,185,129,0.12)' },
  ]

  return (
    <div style={{ padding:'28px 32px', animation:'slideUp 0.3s ease both' }}>

      {/* Page header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.65rem', fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:4, lineHeight:1.2 }}>
            Operations Centre
          </h1>
          <LiveDate />
        </div>
        <Link to="/routes" style={{
          display:'inline-flex', alignItems:'center', gap:8,
          background:'var(--blue)', color:'#fff',
          fontWeight:600, fontSize:'0.82rem', padding:'10px 20px',
          borderRadius:8, textDecoration:'none', fontFamily:'Figtree, sans-serif',
          boxShadow:'0 4px 14px rgba(41,171,226,0.35)',
          transition:'box-shadow 0.2s, transform 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow='0 6px 20px rgba(41,171,226,0.5)'; e.currentTarget.style.transform='translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow='0 4px 14px rgba(41,171,226,0.35)'; e.currentTarget.style.transform='none' }}>
          <Zap size={14} strokeWidth={2.5} />
          Dispatch Route
          <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </div>

      {/* KPI strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:12, marginBottom:24 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ ...card, padding:'20px 22px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, right:0, width:80, height:80, background:`radial-gradient(circle at top right,${k.glow} 0%,transparent 70%)` }} />
            <div style={label}>{k.label}</div>
            <div style={{ ...mono, fontSize:'2.2rem', fontWeight:700, color:k.color, lineHeight:1, marginBottom:6 }}>{k.value}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--sub)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 340px', gap:20, alignItems:'start' }}>

        {/* Left column */}
        <div style={{ display:'flex', flexDirection:'column', gap:16, minWidth:0 }}>

          {/* Live map */}
          <div style={{ ...card, overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <span style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--text)' }}>Bin Network</span>
                <span style={{ ...mono, fontSize:'0.62rem', color:'var(--sub)', marginLeft:10 }}>MALTA · LIVE</span>
              </div>
              <div style={{ display:'flex', gap:14 }}>
                {[['var(--green)','Online'],['var(--amber)','Full'],['var(--crimson)','Fault'],['var(--muted)','Offline']].map(([c,l]) => (
                  <div key={l} style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:c }} />
                    <span style={{ fontSize:'0.63rem', color:'var(--sub)', ...mono }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <MapView bins={bins} height={300} />
          </div>

          {/* Gauge grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(136px,1fr))', gap:10 }}>
            {bins.map(b => (
              <Link key={b.id} to={`/fleet/${b.id}`} style={{ textDecoration:'none', cursor:'pointer' }}>
                <div style={{ ...card, padding:'14px 12px', textAlign:'center', transition:'all 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--blue)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(41,171,226,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='var(--shadow)' }}>
                  <div style={{ ...mono, fontSize:'0.62rem', color:'var(--blue)', marginBottom:6, fontWeight:600 }}>{b.id}</div>
                  <div style={{ display:'flex', justifyContent:'center', marginBottom:6 }}>
                    <ArcGauge pct={Math.round(b.fill)} size={64} stroke={5} />
                  </div>
                  <StatusBadge status={b.status} />
                  <div style={{ fontSize:'0.63rem', color:'var(--sub)', marginTop:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.name}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Fill trend — Recharts */}
          <div style={{ ...card, padding:'20px 22px' }}>
            <div style={{ fontSize:'0.88rem', fontWeight:600, color:'var(--text)', marginBottom:2 }}>Fill Trend</div>
            <div style={{ ...mono, fontSize:'0.65rem', color:'var(--sub)', marginBottom:16 }}>AVG % · LAST 7 DAYS</div>
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={WEEK_DATA} margin={{ top:4, right:4, bottom:0, left:-20 }}>
                <defs>
                  <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#29ABE2" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#29ABE2" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="d" tick={{ fill:'var(--muted)', fontSize:10, fontFamily:'IBM Plex Mono, monospace' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fill:'var(--muted)', fontSize:10, fontFamily:'IBM Plex Mono, monospace' }} axisLine={false} tickLine={false} />
                <Tooltip content={<FillTooltip />} cursor={{ stroke:'var(--border2)', strokeWidth:1 }} />
                <Area type="monotone" dataKey="v" stroke="#29ABE2" strokeWidth={2} fill="url(#fillGrad)" dot={{ fill:'#29ABE2', r:3, strokeWidth:0 }} activeDot={{ fill:'#29ABE2', r:5, strokeWidth:0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Alerts */}
          <div style={{ ...card, overflow:'hidden' }}>
            <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--text)' }}>Active Alerts</span>
              {alerts.filter(a => a.sev === 'crit').length > 0 && (
                <span style={{ ...mono, fontSize:'0.62rem', color:'var(--crimson)', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', padding:'2px 8px', borderRadius:4, fontWeight:700 }}>
                  {alerts.filter(a => a.sev === 'crit').length} CRITICAL
                </span>
              )}
            </div>
            {alerts.slice(0,6).map((a,i) => (
              <Link key={a.id ?? i} to={`/fleet/${a.bin}`}
                style={{ display:'flex', gap:12, padding:'12px 16px', borderBottom:'1px solid var(--ink)', textDecoration:'none', transition:'background 0.12s', cursor:'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--raised)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width:3, borderRadius:4, background: a.sev==='crit' ? 'var(--crimson)' : 'var(--amber)', flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ ...mono, fontSize:'0.63rem', fontWeight:700, color: a.sev==='crit' ? 'var(--crimson)' : 'var(--amber)' }}>{a.type}</span>
                    <span style={{ ...mono, fontSize:'0.61rem', color:'var(--muted)' }}>{a.age || 'now'}</span>
                  </div>
                  <div style={{ fontSize:'0.78rem', fontWeight:500, color:'var(--text)', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.name}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--sub)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.msg}</div>
                </div>
              </Link>
            ))}
            {alerts.length > 6 && (
              <Link to="/alerts" style={{ display:'block', padding:'10px 16px', textAlign:'center', fontSize:'0.75rem', color:'var(--blue)', textDecoration:'none', borderTop:'1px solid var(--border)' }}>
                View all {alerts.length} alerts
              </Link>
            )}
          </div>

          {/* Collection queue */}
          <div style={{ ...card, overflow:'hidden' }}>
            <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--text)' }}>Collection Queue</span>
              <span style={{ ...mono, fontSize:'0.62rem', color:'var(--sub)' }}>{bins.filter(b=>b.fill>=70&&b.status!=='offline').length} BINS</span>
            </div>
            {[...bins].filter(b => b.fill >= 70 && b.status !== 'offline').sort((a,b) => b.fill - a.fill).map((b,i) => (
              <Link key={b.id} to={`/fleet/${b.id}`} style={{ textDecoration:'none' }}>
                <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--ink)', display:'flex', alignItems:'center', gap:12, transition:'background 0.12s', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--raised)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ ...mono, fontSize:'0.68rem', fontWeight:600, color:'var(--muted)', minWidth:20 }}>#{i+1}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'0.76rem', fontWeight:500, color:'var(--text)', marginBottom:4 }}>{b.name}</div>
                    <FillBar pct={Math.round(b.fill)} height={4} glow />
                  </div>
                  <span style={{ ...mono, fontSize:'0.7rem', fontWeight:700, color:fillColor(b.fill) }}>{Math.round(b.fill)}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
