import { useState, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, Cell, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import {
  FileText, Download, Printer, AlertTriangle, CheckCircle,
  TrendingUp, Battery, Wifi, Thermometer, Layers, RotateCcw,
  AlertOctagon, Filter, ChevronDown, ChevronUp, Calendar,
  Clock, Flame, DoorOpen, Cpu, WifiOff, Trash2,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useApi } from '../hooks/useApi'
import { fillColor, statusMap, ALERT_TYPES } from '../data/bins'
import FillBar    from '../components/FillBar'
import StatusBadge from '../components/StatusBadge'

// ── Design tokens ─────────────────────────────────────────────────────────────
const card  = { background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, boxShadow:'var(--shadow)' }
const mono  = { fontFamily:'IBM Plex Mono, monospace' }
const lbl   = { fontSize:'0.62rem', ...mono, color:'var(--muted)', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:6 }

const TABS = [
  { id:'fleet',     label:'Fleet Overview',   Icon: Layers        },
  { id:'per-bin',   label:'Per-Bin Report',   Icon: FileText      },
  { id:'alerts',    label:'Alert Analytics',  Icon: AlertOctagon  },
  { id:'maintenance', label:'Maintenance',    Icon: RotateCcw     },
  { id:'export',    label:'Export',           Icon: Download      },
]

const ALERT_ICONS = {
  OVERFLOW:   Trash2,
  SMOKE_FIRE: Flame,
  JAM:        AlertTriangle,
  COMM_LOSS:  WifiOff,
  DOOR_OPEN:  DoorOpen,
  BATTERY:    Battery,
  FAULT_CODE: Cpu,
}

const QUICK_RANGES = [
  { label:'Today',       days: 0  },
  { label:'Last 7 days', days: 7  },
  { label:'Last 30 days',days: 30 },
  { label:'Last 90 days',days: 90 },
  { label:'All time',    days: -1 },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function isoDate(d) { return d.toISOString().slice(0,10) }

function inRange(ts, from, to) {
  if (!from && !to) return true
  const d = new Date(typeof ts === 'string' ? ts.replace(' ','T') : ts)
  if (isNaN(d)) return true
  if (from && d < new Date(from)) return false
  if (to   && d > new Date(to + 'T23:59:59')) return false
  return true
}

function downloadCSV(rows, filename) {
  if (!rows?.length) return
  const headers = Object.keys(rows[0])
  const lines = [headers.join(','), ...rows.map(r => headers.map(h => `"${String(r[h]??'').replace(/"/g,'""')}"`).join(','))]
  const blob = new Blob([lines.join('\n')], { type:'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ── Date range picker ─────────────────────────────────────────────────────────
function DateRangePicker({ from, to, onFrom, onTo, compact = false }) {
  const [quick, setQuick] = useState('')

  function applyQuick(days) {
    setQuick(String(days))
    if (days === -1) { onFrom(''); onTo(''); return }
    if (days === 0)  { const t = isoDate(new Date()); onFrom(t); onTo(t); return }
    const end   = new Date()
    const start = new Date(Date.now() - days * 86400000)
    onFrom(isoDate(start)); onTo(isoDate(end))
  }

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
      <Calendar size={14} color="var(--sub)" />
      {QUICK_RANGES.map(r => (
        <button key={r.days} onClick={() => applyQuick(r.days)} style={{
          ...mono, fontSize:'0.68rem', fontWeight:600,
          padding:'5px 10px', borderRadius:6, border:'1px solid',
          cursor:'pointer', transition:'all 0.15s',
          background: quick === String(r.days) ? 'var(--blue)' : 'transparent',
          color:       quick === String(r.days) ? '#fff'       : 'var(--sub)',
          borderColor: quick === String(r.days) ? 'var(--blue)' : 'var(--border2)',
        }}>
          {r.label}
        </button>
      ))}
      <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:4 }}>
        <input type="date" value={from} onChange={e=>{setQuick('custom');onFrom(e.target.value)}}
          style={{ ...mono, fontSize:'0.72rem', padding:'5px 8px', background:'var(--raised)', border:'1px solid var(--border2)', borderRadius:6, color:'var(--text)', cursor:'pointer' }}/>
        <span style={{ color:'var(--muted)', fontSize:'0.72rem' }}>to</span>
        <input type="date" value={to} onChange={e=>{setQuick('custom');onTo(e.target.value)}}
          style={{ ...mono, fontSize:'0.72rem', padding:'5px 8px', background:'var(--raised)', border:'1px solid var(--border2)', borderRadius:6, color:'var(--text)', cursor:'pointer' }}/>
        {(from||to) && (
          <button onClick={()=>{setQuick('');onFrom('');onTo('')}} style={{ ...mono, fontSize:'0.68rem', color:'var(--crimson)', background:'none', border:'none', cursor:'pointer' }}>Clear</button>
        )}
      </div>
    </div>
  )
}

// ── KPI stat box ──────────────────────────────────────────────────────────────
function StatBox({ label, value, sub, color='var(--blue)', icon:Icon }) {
  return (
    <div style={{ ...card, padding:'16px 18px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
        {Icon && <div style={{ width:26, height:26, borderRadius:6, background:'var(--ink)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={12} color={color}/>
        </div>}
        <div style={lbl}>{label}</div>
      </div>
      <div style={{ ...mono, fontSize:'1.7rem', fontWeight:700, color, lineHeight:1, marginBottom:4 }}>{value}</div>
      {sub && <div style={{ fontSize:'0.68rem', color:'var(--muted)' }}>{sub}</div>}
    </div>
  )
}

// ── Recharts tooltips ─────────────────────────────────────────────────────────
function ChartTip({ active, payload, label: day }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ ...card, padding:'10px 14px', fontSize:'0.75rem' }}>
      <div style={{ ...mono, color:'var(--sub)', fontSize:'0.62rem', marginBottom:6 }}>{day}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color:p.color, ...mono, fontWeight:700 }}>
          {p.name}: {p.value}{p.unit||''}
        </div>
      ))}
    </div>
  )
}

// ── Fleet Overview Tab ────────────────────────────────────────────────────────
function FleetTab({ bins, alerts }) {
  const [dateFrom, setFrom] = useState('')
  const [dateTo,   setTo]   = useState('')
  const [sort, setSort] = useState('fill')
  const [asc,  setAsc]  = useState(false)

  const sorted = useMemo(() => {
    return [...bins].sort((a,b) => asc ? (a[sort]??0)-(b[sort]??0) : (b[sort]??0)-(a[sort]??0))
  }, [bins, sort, asc])

  const onlinePct  = Math.round((bins.filter(b=>b.status!=='offline').length/bins.length)*100)
  const avgFill    = Math.round(bins.reduce((s,b)=>s+b.fill,0)/bins.length)
  const totalCycles = bins.reduce((s,b)=>s+b.cycles,0)
  const critCount  = alerts.filter(a=>a.sev==='crit').length

  function SortBtn({ field, label }) {
    const active = sort===field
    return (
      <button onClick={()=>{ if(active)setAsc(!asc); else {setSort(field);setAsc(false)} }}
        style={{ ...mono, fontSize:'0.62rem', fontWeight:600, color:active?'var(--blue)':'var(--muted)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:2, padding:0 }}>
        {label}{active?(asc?<ChevronUp size={10}/>:<ChevronDown size={10}/>):null}
      </button>
    )
  }

  return (
    <div>
      <div style={{ ...card, padding:'14px 18px', marginBottom:20 }}>
        <DateRangePicker from={dateFrom} to={dateTo} onFrom={setFrom} onTo={setTo}/>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:20 }}>
        <StatBox label="Fleet Uptime"      value={`${onlinePct}%`}   sub={`${bins.filter(b=>b.status!=='offline').length}/${bins.length} online`}   color="var(--green)"   icon={Wifi}/>
        <StatBox label="Avg Fill"          value={`${avgFill}%`}     sub="Live fleet average"                           color="var(--blue)"    icon={TrendingUp}/>
        <StatBox label="Critical Alerts"   value={critCount}          sub={`${alerts.length} total active`}             color={critCount>0?'var(--crimson)':'var(--green)'} icon={AlertTriangle}/>
        <StatBox label="Total Compactions" value={totalCycles}        sub="All bins combined"                           color="var(--sub)"     icon={RotateCcw}/>
        <StatBox label="Full / Warning"    value={bins.filter(b=>b.status==='full'||b.status==='warning').length} sub="Needs attention"   color="var(--amber)"   icon={AlertOctagon}/>
        <StatBox label="Offline"           value={bins.filter(b=>b.status==='offline').length}  sub="No heartbeat"   color="var(--muted)"   icon={WifiOff}/>
      </div>

      {/* Fill chart */}
      <div style={{ ...card, padding:'20px 22px', marginBottom:16 }}>
        <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--text)', marginBottom:4 }}>Fleet Fill Levels</div>
        <div style={{ ...mono, fontSize:'0.65rem', color:'var(--sub)', marginBottom:16 }}>CURRENT % · ALL BINS · SORTED BY FILL</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[...bins].sort((a,b)=>b.fill-a.fill).map(b=>({ id:b.id, fill:Math.round(b.fill), battery:Math.round(b.battery) }))} barSize={20} margin={{top:4,right:4,bottom:20,left:-20}}>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="id" tick={{fill:'var(--muted)',fontSize:9,...mono}} axisLine={false} tickLine={false}/>
            <YAxis domain={[0,100]} tick={{fill:'var(--muted)',fontSize:10,...mono}} axisLine={false} tickLine={false}/>
            <Tooltip content={<ChartTip/>} cursor={{fill:'rgba(41,171,226,0.04)'}}/>
            <ReferenceLine y={80} stroke="var(--amber)" strokeDasharray="4 2" label={{ value:'80%', fill:'var(--amber)', fontSize:10, fontFamily:'IBM Plex Mono,monospace' }}/>
            <ReferenceLine y={95} stroke="var(--crimson)" strokeDasharray="4 2" label={{ value:'95%', fill:'var(--crimson)', fontSize:10, fontFamily:'IBM Plex Mono,monospace' }}/>
            <Bar dataKey="fill" name="Fill %" radius={[4,4,0,0]}>
              {[...bins].sort((a,b)=>b.fill-a.fill).map(b=><Cell key={b.id} fill={fillColor(b.fill)}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sortable table */}
      <div style={{ ...card, overflow:'hidden' }}>
        <div style={{ padding:'13px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--text)' }}>All Units</span>
          <span style={{ ...mono, fontSize:'0.62rem', color:'var(--sub)' }}>CLICK COLUMN TO SORT · {bins.length} BINS</span>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.78rem' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--ink)' }}>
                {[['Unit','id'],['Name',null],['Area',null],['Status',null],['Fill %','fill'],['Battery','battery'],['Temp °C','temp'],['Signal','signal'],['Cycles','cycles']].map(([h,f])=>(
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', color:'var(--sub)', fontWeight:500, ...mono, fontSize:'0.62rem', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>
                    {f ? <SortBtn field={f} label={h}/> : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(b=>(
                <tr key={b.id} style={{ borderBottom:'1px solid var(--ink)' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--raised)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'10px 14px', ...mono, color:'var(--blue)', fontWeight:700, fontSize:'0.72rem' }}>{b.id}</td>
                  <td style={{ padding:'10px 14px', color:'var(--text)', fontWeight:500 }}>{b.name}</td>
                  <td style={{ padding:'10px 14px', color:'var(--sub)', ...mono, fontSize:'0.72rem' }}>{b.area}</td>
                  <td style={{ padding:'10px 14px' }}><StatusBadge status={b.status}/></td>
                  <td style={{ padding:'10px 14px', minWidth:120 }}><FillBar pct={Math.round(b.fill)} showLabel height={5}/></td>
                  <td style={{ padding:'10px 14px', ...mono, fontSize:'0.72rem', color:b.battery<20?'var(--crimson)':'var(--sub)' }}>{Math.round(b.battery)}%</td>
                  <td style={{ padding:'10px 14px', ...mono, fontSize:'0.72rem', color:'var(--sub)' }}>{b.temp>0?`${b.temp}°C`:'—'}</td>
                  <td style={{ padding:'10px 14px', ...mono, fontSize:'0.72rem', color:b.signal<2?'var(--amber)':'var(--sub)' }}>{b.signal}/4</td>
                  <td style={{ padding:'10px 14px', ...mono, fontSize:'0.72rem', color:'var(--sub)' }}>{b.cycles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Per-Bin Report Tab ────────────────────────────────────────────────────────
function PerBinTab({ bins }) {
  const [selectedId, setSelected] = useState(bins[0]?.id||'')
  const [dateFrom, setFrom] = useState('')
  const [dateTo,   setTo]   = useState('')
  const { data:report, loading, refetch } = useApi(`/reports/bins/${selectedId}`, { skip:!selectedId })

  const bin     = bins.find(b=>b.id===selectedId)
  const history = useMemo(() => {
    const h = report?.fillHistory || []
    return h.filter(p => inRange(p.ts, dateFrom, dateTo))
  }, [report, dateFrom, dateTo])

  const filteredAlerts = useMemo(() => {
    const a = report?.recentAlerts || []
    return a.filter(x => inRange(x.raisedAt, dateFrom, dateTo))
  }, [report, dateFrom, dateTo])

  const EVENT_COLOR = { STATUS_CHANGE:'var(--blue)', ALERT_RAISED:'var(--crimson)', COMPACTION:'var(--green)', MAINTENANCE:'var(--sky)', DOOR_OPEN:'var(--amber)', DOOR_CLOSE:'var(--sub)', FIRE_DETECTED:'var(--crimson)' }

  return (
    <div>
      {/* Bin selector + date range */}
      <div style={{ ...card, padding:'16px 20px', marginBottom:20 }}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center', marginBottom:14 }}>
          <div style={lbl}>Select Unit</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {bins.map(b=>(
              <button key={b.id} onClick={()=>setSelected(b.id)} style={{ ...mono, fontSize:'0.72rem', fontWeight:600, padding:'6px 12px', borderRadius:7, cursor:'pointer', transition:'all 0.15s', background:selectedId===b.id?'var(--blue)':'var(--raised)', color:selectedId===b.id?'#fff':'var(--sub)', border:`1px solid ${selectedId===b.id?'var(--blue)':'var(--border)'}` }}>
                {b.id}
              </button>
            ))}
          </div>
        </div>
        <DateRangePicker from={dateFrom} to={dateTo} onFrom={setFrom} onTo={setTo}/>
      </div>

      {loading && <div style={{ textAlign:'center', padding:40, color:'var(--sub)', ...mono }}>Loading…</div>}

      {!loading && report && bin && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Bin header */}
          <div style={{ ...card, padding:'22px 24px', background:'linear-gradient(135deg,#fff 0%,#f0f9ff 100%)', borderColor:'rgba(41,171,226,0.2)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
              <div>
                <div style={{ ...mono, fontSize:'0.68rem', color:'var(--blue)', fontWeight:700, marginBottom:6 }}>{bin.id} · {bin.area}</div>
                <div style={{ fontFamily:'Syne, sans-serif', fontSize:'1.4rem', fontWeight:700, color:'var(--text)', marginBottom:8 }}>{bin.name}</div>
                <StatusBadge status={bin.status}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
                {[
                  ['Fill',       `${Math.round(bin.fill)}%`,                       fillColor(bin.fill)],
                  ['Battery',    `${Math.round(bin.battery)}%`,                    bin.battery<20?'var(--crimson)':'var(--green)'],
                  ['Uptime',     `${report.uptimePct??'—'}%`,                      'var(--green)'],
                  ['Compactions',report.cycles,                                     'var(--blue)'],
                  ['Alerts',     filteredAlerts.length,                            filteredAlerts.length>0?'var(--amber)':'var(--green)'],
                  ['Temperature',bin.temp>0?`${bin.temp}°C`:'—',                  'var(--sky)'],
                ].map(([l,v,c])=>(
                  <div key={l}><div style={lbl}>{l}</div><div style={{ ...mono, fontSize:'1.1rem', fontWeight:700, color:c }}>{v}</div></div>
                ))}
              </div>
            </div>
          </div>

          {/* Fill & Battery chart */}
          <div style={{ ...card, padding:'20px 22px' }}>
            <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--text)', marginBottom:2 }}>Fill & Battery History</div>
            <div style={{ ...mono, fontSize:'0.65rem', color:'var(--sub)', marginBottom:16 }}>
              {dateFrom || dateTo ? `${dateFrom||'start'} → ${dateTo||'now'}` : 'ALL TIME'} · {history.length} READINGS
            </div>
            {history.length > 1 ? (
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={history} margin={{top:4,right:4,bottom:0,left:-20}}>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="ts" tick={{fill:'var(--muted)',fontSize:9,...mono}} axisLine={false} tickLine={false} tickFormatter={v=>v?.slice(11,16)||''} interval="preserveStartEnd"/>
                  <YAxis domain={[0,100]} tick={{fill:'var(--muted)',fontSize:10,...mono}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<ChartTip/>} cursor={{stroke:'var(--border2)',strokeWidth:1}}/>
                  <ReferenceLine y={95} stroke="var(--crimson)" strokeDasharray="4 2"/>
                  <ReferenceLine y={80} stroke="var(--amber)"   strokeDasharray="4 2"/>
                  <Area type="monotone" dataKey="fill"    name="Fill %"    stroke="#29ABE2" strokeWidth={2} fill="rgba(41,171,226,0.12)" unit="%" dot={false}/>
                  <Line type="monotone" dataKey="battery" name="Battery %" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" unit="%"/>
                  <Legend iconType="line" iconSize={12} wrapperStyle={{...mono,fontSize:'0.65rem'}}/>
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height:120, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--sub)', ...mono, fontSize:'0.75rem' }}>
                Collecting data — check back in a few seconds
              </div>
            )}
          </div>

          {/* Alert history + event log */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ ...card, padding:'18px 20px' }}>
              <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--text)', marginBottom:4 }}>Alert History</div>
              <div style={{ ...mono, fontSize:'0.65rem', color:'var(--sub)', marginBottom:12 }}>{filteredAlerts.length} IN SELECTED PERIOD</div>
              {filteredAlerts.length === 0 ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'20px 0', gap:8 }}>
                  <CheckCircle size={22} color="var(--green)"/>
                  <span style={{ color:'var(--sub)', fontSize:'0.78rem' }}>No alerts in this period</span>
                </div>
              ) : filteredAlerts.map((a,i) => {
                const meta = ALERT_TYPES[a.type] || { color:'var(--crimson)' }
                const Icon = ALERT_ICONS[a.type] || AlertTriangle
                return (
                  <div key={i} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:'1px solid var(--ink)' }}>
                    <Icon size={13} color={meta.color} style={{ flexShrink:0, marginTop:2 }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ ...mono, fontSize:'0.63rem', fontWeight:700, color:meta.color }}>{a.type}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--sub)' }}>{a.msg}</div>
                      <div style={{ ...mono, fontSize:'0.6rem', color:'var(--muted)', marginTop:2 }}>{a.raisedAt||a.age}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ ...card, padding:'18px 20px', overflow:'hidden' }}>
              <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--text)', marginBottom:14 }}>Event Log</div>
              {!report.recentEvents?.length ? (
                <div style={{ color:'var(--sub)', fontSize:'0.78rem', textAlign:'center', padding:'20px 0' }}>No events yet</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:240, overflowY:'auto' }}>
                  {report.recentEvents.filter(e=>inRange(e.ts,dateFrom,dateTo)).map((e,i) => {
                    const color = EVENT_COLOR[e.type]||'var(--sub)'
                    return (
                      <div key={i} style={{ display:'flex', gap:8, padding:'6px 0', borderBottom:'1px solid var(--ink)' }}>
                        <div style={{ ...mono, fontSize:'0.6rem', color, fontWeight:700, minWidth:100, paddingTop:1 }}>{e.type}</div>
                        <div style={{ flex:1, fontSize:'0.7rem', color:'var(--sub)' }}>
                          {e.type==='STATUS_CHANGE'  && `${e.from} → ${e.to} · fill ${e.fill}%`}
                          {e.type==='COMPACTION'     && `${e.fillBefore}% → ${e.fillAfter}% · cycle #${e.cycles}`}
                          {e.type==='ALERT_RAISED'   && `${e.alertType} · ${e.sev}`}
                          {e.type==='MAINTENANCE'    && `${e.workDone?.slice(0,40)}…`}
                          {e.type==='DOOR_OPEN'      && 'Service door opened'}
                          {e.type==='DOOR_CLOSE'     && 'Service door closed'}
                          {e.type==='FIRE_DETECTED'  && `Smoke detected · extinguisher activated`}
                        </div>
                        <span style={{ ...mono, fontSize:'0.58rem', color:'var(--muted)', flexShrink:0 }}>{e.ts?.slice(11)||'—'}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Alert Analytics Tab ────────────────────────────────────────────────────────
function AlertsTab({ bins, alerts }) {
  const [dateFrom, setFrom] = useState('')
  const [dateTo,   setTo]   = useState('')
  const [filterBin,   setFilterBin]   = useState('all')
  const [filterType,  setFilterType]  = useState('all')
  const [filterSev,   setFilterSev]   = useState('all')
  const { data:report, refetch } = useApi('/reports/alerts')

  const history = useMemo(() => {
    const h = report?.history || []
    return h.filter(a =>
      inRange(a.raisedAt, dateFrom, dateTo) &&
      (filterBin  === 'all' || a.bin  === filterBin)  &&
      (filterType === 'all' || a.type === filterType) &&
      (filterSev  === 'all' || a.sev  === filterSev)
    )
  }, [report, dateFrom, dateTo, filterBin, filterType, filterSev])

  const types = [...new Set((report?.history||[]).map(a=>a.type))]

  const byBinData = bins.map(b=>({
    id:b.id, name:b.name,
    crit:history.filter(a=>a.bin===b.id&&a.sev==='crit').length,
    warn:history.filter(a=>a.bin===b.id&&a.sev==='warn').length,
    total:history.filter(a=>a.bin===b.id).length,
  })).filter(d=>d.total>0).sort((a,b)=>b.total-a.total)

  const byTypeData = Object.entries(ALERT_TYPES).map(([type])=>({
    type,
    count: history.filter(a=>a.type===type).length,
    color: ALERT_TYPES[type].color,
  })).filter(d=>d.count>0)

  return (
    <div>
      {/* Date range */}
      <div style={{ ...card, padding:'14px 18px', marginBottom:20 }}>
        <DateRangePicker from={dateFrom} to={dateTo} onFrom={setFrom} onTo={setTo}/>
      </div>

      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12, marginBottom:20 }}>
        <StatBox label="Total Raised"   value={history.length}                     sub="In selected period"     color="var(--text)"    icon={AlertOctagon}/>
        <StatBox label="Critical"       value={history.filter(a=>a.sev==='crit').length}  sub="High severity"   color="var(--crimson)" icon={AlertTriangle}/>
        <StatBox label="Warnings"       value={history.filter(a=>a.sev==='warn').length}  sub="Low severity"    color="var(--amber)"   icon={AlertTriangle}/>
        <StatBox label="Resolved"       value={history.filter(a=>a.resolved).length}      sub="Acknowledged"    color="var(--green)"   icon={CheckCircle}/>
        <StatBox label="Unresolved"     value={history.filter(a=>!a.resolved).length}     sub="Still active"    color={history.filter(a=>!a.resolved).length>0?'var(--crimson)':'var(--green)'} icon={AlertOctagon}/>
        <StatBox label="Most Alerts"    value={byBinData[0]?.id||'—'}               sub={byBinData[0]?`${byBinData[0].total} raised`:'None'}  color="var(--amber)" icon={Layers}/>
      </div>

      {/* Charts row */}
      {byBinData.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
          <div style={{ ...card, padding:'20px 22px' }}>
            <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--text)', marginBottom:4 }}>Alerts by Unit</div>
            <div style={{ ...mono, fontSize:'0.65rem', color:'var(--sub)', marginBottom:16 }}>CRIT + WARN STACKED</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byBinData} barSize={20} margin={{top:4,right:4,bottom:20,left:-20}}>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="id" tick={{fill:'var(--muted)',fontSize:9,...mono}} axisLine={false} tickLine={false}/>
                <YAxis allowDecimals={false} tick={{fill:'var(--muted)',fontSize:10,...mono}} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTip/>} cursor={{fill:'rgba(41,171,226,0.04)'}}/>
                <Bar dataKey="crit" stackId="a" fill="#ef4444" name="Critical" radius={[0,0,0,0]}/>
                <Bar dataKey="warn" stackId="a" fill="#f59e0b" name="Warning"  radius={[4,4,0,0]}/>
                <Legend iconType="square" iconSize={10} wrapperStyle={{...mono,fontSize:'0.65rem'}}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...card, padding:'20px 22px' }}>
            <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--text)', marginBottom:4 }}>By Alert Type</div>
            <div style={{ ...mono, fontSize:'0.65rem', color:'var(--sub)', marginBottom:16 }}>ALL TYPES IN PERIOD</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {byTypeData.map(d=>(
                <div key={d.type} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ ...mono, fontSize:'0.65rem', color:d.color, minWidth:90, fontWeight:700 }}>{d.type}</span>
                  <div style={{ flex:1, background:'var(--ink)', borderRadius:4, height:8, overflow:'hidden' }}>
                    <div style={{ width:`${(d.count/Math.max(...byTypeData.map(x=>x.count)))*100}%`, height:'100%', background:d.color, borderRadius:4 }}/>
                  </div>
                  <span style={{ ...mono, fontSize:'0.72rem', fontWeight:700, color:d.color, minWidth:24 }}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters + history table */}
      <div style={{ ...card, overflow:'hidden' }}>
        <div style={{ padding:'13px 18px', borderBottom:'1px solid var(--border)', display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <Filter size={13} color="var(--sub)"/>
          <span style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--text)' }}>Alert History</span>
          <div style={{ display:'flex', gap:8, marginLeft:'auto', flexWrap:'wrap' }}>
            {[
              [bins, filterBin, setFilterBin, 'id', 'All units'],
              [types.map(t=>({id:t})), filterType, setFilterType, 'id', 'All types'],
            ].map(([items, val, setter, key, placeholder], idx) => (
              <select key={idx} value={val} onChange={e=>setter(e.target.value)} style={{ ...mono, fontSize:'0.7rem', background:'var(--raised)', border:'1px solid var(--border2)', borderRadius:6, padding:'5px 8px', color:'var(--text)', cursor:'pointer' }}>
                <option value="all">{placeholder}</option>
                {items.map(it=><option key={it[key]} value={it[key]}>{it[key]}</option>)}
              </select>
            ))}
            <select value={filterSev} onChange={e=>setFilterSev(e.target.value)} style={{ ...mono, fontSize:'0.7rem', background:'var(--raised)', border:'1px solid var(--border2)', borderRadius:6, padding:'5px 8px', color:'var(--text)', cursor:'pointer' }}>
              <option value="all">All severity</option>
              <option value="crit">Critical</option>
              <option value="warn">Warning</option>
            </select>
          </div>
          <span style={{ ...mono, fontSize:'0.62rem', color:'var(--sub)' }}>{history.length} RECORDS</span>
        </div>

        {history.length === 0 ? (
          <div style={{ padding:'40px', textAlign:'center', color:'var(--sub)', fontSize:'0.82rem' }}>
            {(report?.history||[]).length===0 ? 'No alert history yet.' : 'No alerts match the current filters.'}
          </div>
        ) : (
          <div style={{ overflowX:'auto', maxHeight:420, overflowY:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.78rem' }}>
              <thead style={{ position:'sticky', top:0, background:'var(--ink)', zIndex:1 }}>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Type','Sev','Unit','Message','Raised At','Status'].map(h=>(
                    <th key={h} style={{ padding:'9px 14px', textAlign:'left', color:'var(--muted)', ...mono, fontSize:'0.62rem', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((a,i)=>{
                  const meta = ALERT_TYPES[a.type]||{}
                  const hex  = a.sev==='crit'?'#ef4444':'#f59e0b'
                  return (
                    <tr key={a.id??i} style={{ borderBottom:'1px solid var(--ink)' }}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--raised)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'9px 14px' }}>
                        <span style={{ ...mono, fontSize:'0.63rem', fontWeight:700, color:meta.color||'var(--crimson)', background:`${hex}10`, border:`1px solid ${hex}25`, padding:'2px 7px', borderRadius:4 }}>{a.type}</span>
                      </td>
                      <td style={{ padding:'9px 14px', ...mono, fontSize:'0.68rem', color:a.sev==='crit'?'var(--crimson)':'var(--amber)', fontWeight:700 }}>{a.sev?.toUpperCase()}</td>
                      <td style={{ padding:'9px 14px', ...mono, fontSize:'0.68rem', color:'var(--blue)', fontWeight:700 }}>{a.bin}</td>
                      <td style={{ padding:'9px 14px', color:'var(--text)', maxWidth:260, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.msg}</td>
                      <td style={{ padding:'9px 14px', ...mono, fontSize:'0.65rem', color:'var(--sub)', whiteSpace:'nowrap' }}>{a.raisedAt||a.age||'—'}</td>
                      <td style={{ padding:'9px 14px' }}>
                        {a.resolved
                          ? <span style={{ ...mono, fontSize:'0.63rem', color:'var(--green)', fontWeight:600 }}>RESOLVED</span>
                          : <span style={{ ...mono, fontSize:'0.63rem', color:a.sev==='crit'?'var(--crimson)':'var(--amber)', fontWeight:600 }}>ACTIVE</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Maintenance Tab ────────────────────────────────────────────────────────────
function MaintenanceTab({ bins }) {
  const [dateFrom, setFrom] = useState('')
  const [dateTo,   setTo]   = useState('')
  const [filterBin, setFilterBin] = useState('all')
  const { data:logs, loading } = useApi('/maintenance')

  const filtered = useMemo(() => {
    const all = logs || []
    return all.filter(l =>
      inRange(l.visitDate, dateFrom, dateTo) &&
      (filterBin === 'all' || l.binId === filterBin)
    )
  }, [logs, dateFrom, dateTo, filterBin])

  const binCounts = (logs||[]).reduce((acc,l)=>{ acc[l.binId]=(acc[l.binId]||0)+1; return acc; },{})
  const mostServiced = Object.entries(binCounts).sort((a,b)=>b[1]-a[1])[0]

  return (
    <div>
      <div style={{ ...card, padding:'14px 18px', marginBottom:20 }}>
        <DateRangePicker from={dateFrom} to={dateTo} onFrom={setFrom} onTo={setTo}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:20 }}>
        <StatBox label="Total Visits"    value={filtered.length}               sub="In selected period"     color="var(--blue)"  icon={RotateCcw}/>
        <StatBox label="Most Serviced"   value={mostServiced?.[0]||'—'}        sub={mostServiced?`${mostServiced[1]} visits`:'No data'} color="var(--amber)" icon={Layers}/>
        <StatBox label="Routine"         value={filtered.filter(l=>l.type==='routine').length}    sub="Scheduled maintenance" color="var(--green)" icon={CheckCircle}/>
        <StatBox label="Emergency"       value={filtered.filter(l=>l.type==='emergency').length}  sub="Call-outs"             color="var(--crimson)" icon={AlertTriangle}/>
      </div>

      {/* Filter */}
      <div style={{ display:'flex', gap:10, marginBottom:14, alignItems:'center', flexWrap:'wrap' }}>
        <Filter size={13} color="var(--sub)"/>
        <select value={filterBin} onChange={e=>setFilterBin(e.target.value)} style={{ ...mono, fontSize:'0.72rem', background:'var(--card)', border:'1px solid var(--border2)', borderRadius:7, padding:'7px 10px', color:'var(--text)', cursor:'pointer' }}>
          <option value="all">All units</option>
          {bins.map(b=><option key={b.id} value={b.id}>{b.id} — {b.name}</option>)}
        </select>
        <span style={{ ...mono, fontSize:'0.62rem', color:'var(--muted)', marginLeft:'auto' }}>{filtered.length} RECORDS</span>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--sub)', ...mono }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, padding:'60px 40px', textAlign:'center' }}>
          <div style={{ fontFamily:'Syne, sans-serif', fontSize:'1rem', fontWeight:600, color:'var(--text)', marginBottom:8 }}>No maintenance logs in this period</div>
          <div style={{ fontSize:'0.82rem', color:'var(--sub)' }}>Adjust the date range or add a visit from the Maintenance page.</div>
        </div>
      ) : (
        <div style={{ ...card, overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.78rem' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--ink)' }}>
                  {['Date','Unit','Type','Technician','Work Done','Parts','Next Visit'].map(h=>(
                    <th key={h} style={{ padding:'9px 14px', textAlign:'left', color:'var(--muted)', ...mono, fontSize:'0.62rem', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l,i)=>(
                  <tr key={l.id??i} style={{ borderBottom:'1px solid var(--ink)' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--raised)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'9px 14px', ...mono, fontSize:'0.68rem', color:'var(--sub)', whiteSpace:'nowrap' }}>{l.visitDate}</td>
                    <td style={{ padding:'9px 14px', ...mono, fontSize:'0.7rem', color:'var(--blue)', fontWeight:700 }}>{l.binId}</td>
                    <td style={{ padding:'9px 14px', ...mono, fontSize:'0.65rem', color:'var(--text)', fontWeight:600, whiteSpace:'nowrap', textTransform:'capitalize' }}>{l.type}</td>
                    <td style={{ padding:'9px 14px', color:'var(--sub)', whiteSpace:'nowrap' }}>{l.technician||'—'}</td>
                    <td style={{ padding:'9px 14px', color:'var(--text)', maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.workDone}</td>
                    <td style={{ padding:'9px 14px', color:'var(--sub)', maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.partsReplaced||'—'}</td>
                    <td style={{ padding:'9px 14px', ...mono, fontSize:'0.65rem', color: l.nextScheduled ? 'var(--blue)' : 'var(--muted)', whiteSpace:'nowrap' }}>{l.nextScheduled||'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Export Tab ─────────────────────────────────────────────────────────────────
function ExportTab({ bins, alerts }) {
  const [dateFrom, setFrom] = useState('')
  const [dateTo,   setTo]   = useState('')
  const { data:exportData, loading, refetch } = useApi('/reports/export')
  const { data:alertReport } = useApi('/reports/alerts')
  const { data:maintenanceLogs } = useApi('/maintenance')
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

  // Filter rows to selected date range
  const filteredRows = useMemo(() => {
    if (!exportData?.rows) return []
    return exportData.rows // bins have no date, return all
  }, [exportData])

  const filteredAlertRows = useMemo(() => {
    const h = alertReport?.history || []
    return h.filter(a => inRange(a.raisedAt, dateFrom, dateTo)).map(a => ({
      'Bin ID':      a.bin,
      'Bin Name':    a.name||'—',
      'Type':        a.type,
      'Severity':    a.sev,
      'Message':     a.msg,
      'Raised At':   a.raisedAt||a.age||'—',
      'Status':      a.resolved ? 'Resolved' : 'Active',
    }))
  }, [alertReport, dateFrom, dateTo])

  const filteredMaintRows = useMemo(() => {
    const logs = maintenanceLogs || []
    return logs.filter(l => inRange(l.visitDate, dateFrom, dateTo)).map(l => ({
      'Date':         l.visitDate,
      'Bin ID':       l.binId,
      'Bin Name':     l.binName||'—',
      'Type':         l.type,
      'Technician':   l.technician||'Unassigned',
      'Work Done':    l.workDone,
      'Parts':        l.partsReplaced||'None',
      'Next Visit':   l.nextScheduled||'—',
      'Logged At':    l.createdAt,
    }))
  }, [maintenanceLogs, dateFrom, dateTo])

  const suffix = dateFrom || dateTo
    ? `-${dateFrom||'start'}-to-${dateTo||'now'}`
    : `-${new Date().toISOString().slice(0,10)}`

  function ExportCard({ title, desc, count, onClick, color, Icon, label }) {
    return (
      <div style={{ ...card, padding:'20px 22px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:16 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:'var(--ink)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Icon size={18} color={color}/>
          </div>
          <div>
            <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--text)', marginBottom:3 }}>{title}</div>
            <div style={{ fontSize:'0.73rem', color:'var(--sub)' }}>{desc}</div>
            {count !== undefined && <div style={{ ...mono, fontSize:'0.65rem', color:color, marginTop:4 }}>{count} rows in selected period</div>}
          </div>
        </div>
        <button onClick={onClick} style={{ display:'inline-flex', alignItems:'center', gap:7, background:color, color:'#fff', fontFamily:'Figtree, sans-serif', fontWeight:600, fontSize:'0.78rem', padding:'8px 16px', borderRadius:7, border:'none', cursor:'pointer', boxShadow:`0 3px 10px ${color==='var(--blue)'?'rgba(41,171,226,0.25)':'rgba(0,0,0,0.1)'}`, transition:'all 0.15s' }}>
          <Download size={13}/>{label}
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Date filter */}
      <div style={{ ...card, padding:'16px 20px', marginBottom:20, background:'linear-gradient(135deg,#fff 0%,#f0f9ff 100%)', borderColor:'rgba(41,171,226,0.2)' }}>
        <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--text)', marginBottom:12 }}>Select date range for export</div>
        <DateRangePicker from={dateFrom} to={dateTo} onFrom={setFrom} onTo={setTo}/>
        <div style={{ ...mono, fontSize:'0.65rem', color:'var(--muted)', marginTop:10 }}>
          Generated {new Date().toLocaleString('en-MT')} · Data owner: Contracting Authority
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16, marginBottom:20 }}>
        <ExportCard
          title="Fleet Status CSV"
          desc="All 8 bins — fill, battery, status, uptime, cycles, alert counts"
          count={filteredRows.length}
          onClick={() => downloadCSV(filteredRows, `handson-fleet${suffix}.csv`)}
          color="var(--blue)" Icon={Layers}  label="Download Fleet CSV"
        />
        <ExportCard
          title="Alert History CSV"
          desc="All alerts in selected period — type, severity, bin, message, timestamps"
          count={filteredAlertRows.length}
          onClick={() => downloadCSV(filteredAlertRows, `handson-alerts${suffix}.csv`)}
          color={filteredAlertRows.length>0?'var(--crimson)':'var(--muted)'} Icon={AlertOctagon} label="Download Alerts CSV"
        />
        <ExportCard
          title="Maintenance Logs CSV"
          desc="All maintenance visits in selected period — technician, work done, parts"
          count={filteredMaintRows.length}
          onClick={() => downloadCSV(filteredMaintRows, `handson-maintenance${suffix}.csv`)}
          color="var(--green)" Icon={RotateCcw} label="Download Maintenance CSV"
        />
        <ExportCard
          title="Full JSON Export"
          desc="Complete dataset — bins, alerts, history, maintenance (open-standard, data ownership guaranteed)"
          onClick={() => window.open(`${API}/reports/export/json`, '_blank')}
          color="var(--sky)" Icon={Download} label="Download JSON"
        />
        <ExportCard
          title="Print / PDF"
          desc="Full report formatted for A4 — use browser Save as PDF"
          onClick={() => window.print()}
          color="var(--sub)" Icon={Printer} label="Open Print Dialog"
        />
      </div>

      {/* Preview */}
      {exportData?.rows && (
        <div style={{ ...card, overflow:'hidden' }}>
          <div style={{ padding:'12px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--text)' }}>Fleet Export Preview</span>
            <button onClick={refetch} style={{ ...mono, fontSize:'0.68rem', color:'var(--blue)', background:'none', border:'none', cursor:'pointer' }}>Refresh</button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.72rem' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--ink)' }}>
                  {Object.keys(exportData.rows[0]||{}).map(h=>(
                    <th key={h} style={{ padding:'8px 12px', textAlign:'left', ...mono, fontSize:'0.6rem', color:'var(--muted)', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exportData.rows.map((row,i)=>(
                  <tr key={i} style={{ borderBottom:'1px solid var(--ink)' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--raised)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    {Object.values(row).map((v,j)=>(
                      <td key={j} style={{ padding:'8px 12px', color:'var(--text)', ...mono, fontSize:'0.68rem', whiteSpace:'nowrap' }}>{String(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Reports Page ──────────────────────────────────────────────────────────
export default function Reports() {
  const { bins, alerts } = useApp()
  const [activeTab, setActiveTab] = useState('fleet')

  return (
    <div style={{ padding:'28px 32px', animation:'slideUp 0.3s ease both' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.65rem', fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:4 }}>
            Reports
          </h1>
          <div style={{ fontFamily:'IBM Plex Mono, monospace', fontSize:'0.7rem', color:'var(--sub)' }}>
            Fleet · per-bin · alerts · maintenance · export — all filterable by date
          </div>
        </div>
        <div style={{ fontFamily:'IBM Plex Mono, monospace', fontSize:'0.68rem', color:'var(--muted)', paddingTop:4 }}>
          {new Date().toLocaleString('en-MT')}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:24, background:'var(--card)', borderRadius:10, padding:4, border:'1px solid var(--border)', width:'fit-content', boxShadow:'var(--shadow)' }}>
        {TABS.map(({id,label,Icon})=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{
            display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:7,
            fontFamily:'Figtree, sans-serif', fontWeight:500, fontSize:'0.8rem',
            border:'none', cursor:'pointer', transition:'all 0.15s',
            background: activeTab===id ? 'var(--blue)'      : 'transparent',
            color:       activeTab===id ? '#fff'             : 'var(--sub)',
            boxShadow:   activeTab===id ? '0 2px 8px rgba(41,171,226,0.25)' : 'none',
          }}>
            <Icon size={13} strokeWidth={activeTab===id?2.5:1.8}/>
            {label}
          </button>
        ))}
      </div>

      {activeTab==='fleet'       && <FleetTab       bins={bins} alerts={alerts}/>}
      {activeTab==='per-bin'     && <PerBinTab       bins={bins}/>}
      {activeTab==='alerts'      && <AlertsTab       bins={bins} alerts={alerts}/>}
      {activeTab==='maintenance' && <MaintenanceTab  bins={bins}/>}
      {activeTab==='export'      && <ExportTab       bins={bins} alerts={alerts}/>}
    </div>
  )
}
