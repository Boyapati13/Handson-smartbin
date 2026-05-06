import { Link } from 'react-router-dom'
import { Trash2, Flame, AlertTriangle, WifiOff, DoorOpen, Battery, Cpu, CheckCircle, Filter, Clock, ExternalLink } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ALERT_TYPES } from '../data/bins'

const S = {
  card:  { background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, boxShadow:'var(--shadow)' },
  mono:  { fontFamily:'IBM Plex Mono, monospace' },
  label: { fontSize:'0.62rem', fontFamily:'IBM Plex Mono, monospace', color:'var(--muted)', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:6 },
}

const TYPE_ICONS = {
  OVERFLOW:   Trash2,
  SMOKE_FIRE: Flame,
  JAM:        AlertTriangle,
  COMM_LOSS:  WifiOff,
  DOOR_OPEN:  DoorOpen,
  BATTERY:    Battery,
  FAULT_CODE: Cpu,
}

/** Convert "just now", "2m", "1h", "4h" to a human-readable label */
function formatAge(age, raisedAt) {
  if (raisedAt) {
    // If we have a proper timestamp, compute elapsed
    const raised = new Date(raisedAt.replace(' ','T'))
    if (!isNaN(raised)) {
      const sec = Math.floor((Date.now() - raised) / 1000)
      if (sec < 60)   return `${sec}s ago`
      if (sec < 3600) return `${Math.floor(sec/60)}m ago`
      return `${Math.floor(sec/3600)}h ${Math.floor((sec%3600)/60)}m ago`
    }
  }
  return age ? `${age} ago` : '—'
}

function AlertTypeChip({ type }) {
  const meta  = ALERT_TYPES[type] || { label:type, color:'var(--sub)', bg:'rgba(100,116,139,0.08)' }
  const Icon  = TYPE_ICONS[type] || AlertTriangle
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, ...S.mono, fontSize:'0.63rem', fontWeight:700, color:meta.color, background:meta.bg, border:`1px solid ${meta.color}25`, padding:'2px 8px', borderRadius:4 }}>
      <Icon size={10} strokeWidth={2.5}/>
      {meta.label.toUpperCase()}
    </span>
  )
}

export default function Alerts() {
  const { alerts: ALERTS, sendCommand } = useApp()

  const critCount   = ALERTS.filter(a=>a.sev==='crit').length
  const warnCount   = ALERTS.filter(a=>a.sev==='warn').length
  const hasFireAlert = ALERTS.some(a=>a.type==='SMOKE_FIRE')

  // Computed metrics
  const ages    = ALERTS.map(a => {
    if (!a.raisedAt) return 0
    const sec = Math.floor((Date.now() - new Date(a.raisedAt.replace(' ','T'))) / 1000)
    return isNaN(sec) ? 0 : Math.max(0, sec / 60)
  })
  const meanMin = ages.length ? +(ages.reduce((s,v)=>s+v,0)/ages.length).toFixed(1) : 0
  const maxMin  = ages.length ? Math.max(...ages) : 0

  // Alert type distribution
  const byType = ALERTS.reduce((acc, a) => { acc[a.type]=(acc[a.type]||0)+1; return acc; }, {})

  return (
    <div style={{ padding:'28px 32px', animation:'slideUp 0.3s ease both' }}>

      {/* FIRE BANNER — critical visual at top */}
      {hasFireAlert && (
        <div style={{ background:'#ef4444', borderRadius:10, padding:'14px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:12, animation:'glow-pulse 2s ease-in-out infinite' }}>
          <Flame size={22} color="#fff" strokeWidth={2.5}/>
          <div style={{ flex:1 }}>
            <div style={{ color:'#fff', fontWeight:700, fontSize:'0.95rem', marginBottom:2 }}>FIRE / SMOKE ALERT ACTIVE</div>
            <div style={{ color:'rgba(255,255,255,0.85)', fontSize:'0.78rem' }}>Automatic fire suppression system has been activated. Dispatch fire safety team immediately.</div>
          </div>
          {ALERTS.filter(a=>a.type==='SMOKE_FIRE').map(a=>(
            <Link key={a.id} to={`/fleet/${a.bin}`} style={{ background:'rgba(255,255,255,0.2)', color:'#fff', border:'1px solid rgba(255,255,255,0.4)', borderRadius:7, padding:'8px 14px', fontSize:'0.78rem', fontWeight:600, textDecoration:'none', flexShrink:0 }}>
              {a.bin} →
            </Link>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.65rem', fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:4 }}>Alerts</h1>
        <div style={{ ...S.mono, fontSize:'0.7rem', color:'var(--sub)' }}>
          {critCount > 0 ? `${critCount} critical · ${warnCount} warnings · immediate action required` : warnCount > 0 ? `${warnCount} warnings · monitor closely` : 'All clear — no active alerts'}
          <span style={{ marginLeft:16, color:'var(--muted)' }}>{new Date().toLocaleString('en-MT')}</span>
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12, marginBottom:24 }}>
        {[
          ['Active Alerts',  ALERTS.length,                      critCount>0?'var(--crimson)':'var(--green)', AlertTriangle],
          ['Critical',       critCount,                          critCount>0?'var(--crimson)':'var(--green)', Flame],
          ['Warnings',       warnCount,                          warnCount>0?'var(--amber)':'var(--green)',   AlertTriangle],
          ['Mean Age',       meanMin < 60 ? `${Math.round(meanMin)}m` : `${(meanMin/60).toFixed(1)}h`, 'var(--amber)', Clock],
          ['Oldest',         maxMin  < 60 ? `${Math.round(maxMin)}m`  : `${(maxMin/60).toFixed(1)}h`,  'var(--amber)', Clock],
        ].map(([l,v,c,Icon]) => (
          <div key={l} style={{ ...S.card, padding:'14px 16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
              <Icon size={13} color={c}/>
              <div style={S.label}>{l}</div>
            </div>
            <div style={{ ...S.mono, fontSize:'1.6rem', fontWeight:700, color:c, lineHeight:1 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Alert list */}
      {ALERTS.length === 0 ? (
        <div style={{ ...S.card, padding:'60px 40px', textAlign:'center', marginBottom:20 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <CheckCircle size={24} color="var(--green)"/>
          </div>
          <div style={{ fontFamily:'Syne, sans-serif', fontSize:'1rem', fontWeight:600, color:'var(--text)', marginBottom:8 }}>Fleet is healthy</div>
          <div style={{ fontSize:'0.82rem', color:'var(--sub)' }}>No active alerts. All bins operating within normal parameters.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
          {[...ALERTS].sort((a,b) => {
            // Sort: SMOKE_FIRE first, then crit, then warn; within same sev by most recent
            if (a.type==='SMOKE_FIRE' && b.type!=='SMOKE_FIRE') return -1
            if (b.type==='SMOKE_FIRE' && a.type!=='SMOKE_FIRE') return 1
            if (a.sev==='crit' && b.sev!=='crit') return -1
            if (b.sev==='crit' && a.sev!=='crit') return 1
            return 0
          }).map(a => {
            const meta = ALERT_TYPES[a.type] || { color:'var(--crimson)', bg:'rgba(239,68,68,0.08)' }
            const isFire = a.type === 'SMOKE_FIRE'
            return (
              <div key={a.id} style={{ ...S.card, overflow:'hidden', borderColor: isFire ? 'rgba(239,68,68,0.4)' : 'var(--border)', boxShadow: isFire ? '0 0 0 1px rgba(239,68,68,0.2), var(--shadow)' : 'var(--shadow)' }}>
                <div style={{ display:'flex' }}>
                  <div style={{ width:4, background:meta.color, flexShrink:0, borderRadius:'12px 0 0 12px' }}/>
                  <div style={{ flex:1, padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      {/* Type + bin + age */}
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                        <AlertTypeChip type={a.type}/>
                        <span style={{ ...S.mono, fontSize:'0.62rem', color:'var(--blue)', fontWeight:700, background:'var(--ink)', padding:'2px 7px', borderRadius:4 }}>{a.bin}</span>
                        <span style={{ fontSize:'0.7rem', color:'var(--sub)' }}>{a.area && `${a.area} ·`} {formatAge(a.age, a.raisedAt)}</span>
                        {a.raisedAt && <span style={{ ...S.mono, fontSize:'0.62rem', color:'var(--muted)' }}>{a.raisedAt}</span>}
                      </div>
                      {/* Name + message */}
                      <div style={{ fontSize:'0.92rem', fontWeight:600, color:'var(--text)', marginBottom:4 }}>{a.name}</div>
                      <div style={{ fontSize:'0.8rem', color:'var(--sub)', lineHeight:1.5 }}>{a.msg}</div>
                      {/* Protocol description */}
                      {ALERT_TYPES[a.type] && (
                        <div style={{ ...S.mono, fontSize:'0.64rem', color:'var(--muted)', marginTop:6 }}>
                          {ALERT_TYPES[a.type].description}
                          {ALERT_TYPES[a.type].frame && <span style={{ marginLeft:10, color:'var(--blue)' }}>Frame: {ALERT_TYPES[a.type].frame}</span>}
                        </div>
                      )}
                    </div>
                    {/* Actions */}
                    <div style={{ display:'flex', gap:8, flexShrink:0, flexWrap:'wrap' }}>
                      <button onClick={() => sendCommand('acknowledge', a.bin)} style={{ background:'transparent', border:'1px solid var(--border2)', color:'var(--sub)', fontSize:'0.74rem', fontFamily:'Figtree, sans-serif', padding:'8px 14px', borderRadius:7, cursor:'pointer', transition:'all 0.15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--blue)';e.currentTarget.style.color='var(--blue)'}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--sub)'}}>
                        Acknowledge
                      </button>
                      {(a.type==='SMOKE_FIRE'||a.type==='FAULT_CODE'||a.type==='JAM') && (
                        <button onClick={() => sendCommand('reset', a.bin)} style={{ background:'transparent', border:'1px solid rgba(239,68,68,0.3)', color:'var(--crimson)', fontSize:'0.74rem', fontFamily:'Figtree, sans-serif', padding:'8px 14px', borderRadius:7, cursor:'pointer', transition:'all 0.15s' }}
                          onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.06)'}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          Reset Unit
                        </button>
                      )}
                      <Link to={`/fleet/${a.bin}`} style={{ background: meta.color, color:'#fff', fontSize:'0.74rem', fontWeight:600, fontFamily:'Figtree, sans-serif', padding:'8px 14px', borderRadius:7, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4, cursor:'pointer' }}>
                        View Unit
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Alert type reference */}
      <div style={{ ...S.card, padding:'20px 22px' }}>
        <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--text)', marginBottom:14 }}>Alert Type Reference — HY-CKX1</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:10 }}>
          {Object.entries(ALERT_TYPES).map(([type, meta]) => {
            const Icon  = TYPE_ICONS[type] || AlertTriangle
            const count = byType[type] || 0
            return (
              <div key={type} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 14px', borderRadius:8, background: count>0 ? meta.bg : 'var(--ink)', border:`1px solid ${count>0 ? meta.color+'30' : 'var(--border)'}`, transition:'all 0.2s' }}>
                <div style={{ width:32, height:32, borderRadius:7, background: count>0?meta.bg:'var(--card)', border:`1px solid ${count>0?meta.color+'30':'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={15} color={count>0?meta.color:'var(--muted)'}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                    <span style={{ ...S.mono, fontSize:'0.65rem', fontWeight:700, color:count>0?meta.color:'var(--muted)' }}>{type}</span>
                    {count > 0 && <span style={{ ...S.mono, fontSize:'0.72rem', fontWeight:700, color:meta.color }}>{count} ACTIVE</span>}
                  </div>
                  <div style={{ fontSize:'0.72rem', color:'var(--sub)', lineHeight:1.4 }}>{meta.description}</div>
                  {meta.frame && <div style={{ ...S.mono, fontSize:'0.6rem', color:'var(--muted)', marginTop:3 }}>Frame: {meta.frame}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
