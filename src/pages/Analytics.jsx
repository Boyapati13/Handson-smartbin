import { useMemo } from 'react'
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts'
import { useApp } from '../context/AppContext'
import { WEEK_DATA, fillColor, statusMap } from '../data/bins'
import { computeRouteMetrics, formatDuration } from '../utils/routing'
import FillBar from '../components/FillBar'

const card  = { background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, boxShadow:'var(--shadow)' }
const mono  = { fontFamily:'IBM Plex Mono, monospace' }
const label = { fontSize:'0.65rem', ...mono, color:'var(--muted)', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:6 }

function ChartTooltip({ active, payload, label: day }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', boxShadow:'var(--shadow-md)', fontSize:'0.78rem' }}>
      <div style={{ color:'var(--sub)', marginBottom:4, ...mono, fontSize:'0.65rem' }}>{day}</div>
      <div style={{ color:'var(--blue)', fontWeight:700, ...mono }}>{payload[0].value}%</div>
    </div>
  )
}

function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, fill: f } = payload[0].payload
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', boxShadow:'var(--shadow-md)' }}>
      <div style={{ fontSize:'0.75rem', color:'var(--text)', fontWeight:600, marginBottom:2 }}>{name}</div>
      <div style={{ ...mono, fontSize:'0.78rem', color:fillColor(f), fontWeight:700 }}>{Math.round(f)}%</div>
    </div>
  )
}

export default function Analytics() {
  const { bins } = useApp()

  // ── Derived metrics (all computed, nothing hardcoded) ───────────────────
  const liveAvg     = Math.round(bins.reduce((s,b) => s + b.fill, 0) / bins.length)
  const needCollection = bins.filter(b => b.fill >= 80 && b.status !== 'offline').length
  const totalCycles = bins.reduce((s,b) => s + (b.cycles || 0), 0)
  const uptimePct   = Math.round((bins.filter(b => b.status !== 'offline').length / bins.length) * 100)

  // Route savings — compare optimised route vs fixed schedule for bins ≥70%
  const routeMetrics = useMemo(() => {
    const eligible = bins.filter(b => b.fill >= 70 && b.status !== 'offline')
    return computeRouteMetrics(eligible, bins)
  }, [bins])

  const maxV  = Math.max(...WEEK_DATA.map(d => d.v))
  const avgV  = Math.round(WEEK_DATA.reduce((s,d) => s + d.v, 0) / WEEK_DATA.length)

  const statusData = Object.entries(statusMap).map(([k, { color, label: lbl }]) => ({
    name: lbl, value: bins.filter(b => b.status === k).length, color,
  })).filter(d => d.value > 0)

  const barData = [...bins].sort((a,b) => b.fill - a.fill).map(b => ({
    id: b.id, name: b.name, fill: Math.round(b.fill),
  }))

  return (
    <div style={{ padding:'28px 32px', animation:'slideUp 0.3s ease both' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.65rem', fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:4 }}>Analytics</h1>
        <div style={{ ...mono, fontSize:'0.7rem', color:'var(--sub)' }}>Fleet performance · rolling 7 days</div>
      </div>

      {/* KPI row — all values computed from live data */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:20 }}>
        {[
          ['Avg Fill',      `${liveAvg}%`,
            'Live fleet average',                                    'var(--blue)'],
          ['Need Collection', needCollection,
            'Bins above 80% threshold',                              'var(--amber)'],
          ['Compactions',   totalCycles,
            'Total cycles across fleet',                             'var(--sub)'],
          ['Uptime',        `${uptimePct}%`,
            `${bins.filter(b=>b.status!=='offline').length} of ${bins.length} online`, 'var(--green)'],
          ['Route Savings', routeMetrics ? `${routeMetrics.savingsPct}%` : '—',
            'vs. fixed schedule distance',                           'var(--amber)'],
          ['CO₂ This Run',  routeMetrics ? `${routeMetrics.co2kg} kg` : '—',
            routeMetrics ? `${routeMetrics.distance.toFixed(1)} km · ${routeMetrics.stops} stops` : 'No route computed', 'var(--sky)'],
        ].map(([l,v,n,c]) => (
          <div key={l} style={{ ...card, padding:'16px 18px' }}>
            <div style={label}>{l}</div>
            <div style={{ ...mono, fontSize:'1.7rem', fontWeight:700, color:c, lineHeight:1, marginBottom:4 }}>{v}</div>
            <div style={{ fontSize:'0.68rem', color:'var(--muted)' }}>{n}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16, marginBottom:16 }}>

        {/* Area trend */}
        <div style={{ ...card, padding:'20px 22px' }}>
          <div style={{ fontSize:'0.88rem', fontWeight:600, color:'var(--text)', marginBottom:2 }}>Fill Level Trend</div>
          <div style={{ ...mono, fontSize:'0.65rem', color:'var(--sub)', marginBottom:16 }}>AVG % · LAST 7 DAYS</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={WEEK_DATA} margin={{ top:4, right:4, bottom:0, left:-20 }}>
              <defs>
                <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#29ABE2" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#29ABE2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="d" tick={{ fill:'var(--muted)', fontSize:10, fontFamily:'IBM Plex Mono, monospace' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0,100]} tick={{ fill:'var(--muted)', fontSize:10, fontFamily:'IBM Plex Mono, monospace' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke:'var(--border2)', strokeWidth:1 }} />
              <Area type="monotone" dataKey="v" stroke="#29ABE2" strokeWidth={2} fill="url(#ag2)" dot={{ fill:'#29ABE2', r:3, strokeWidth:0 }} activeDot={{ r:5, fill:'#29ABE2', strokeWidth:0 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ borderTop:'1px solid var(--border)', paddingTop:12, marginTop:8, display:'flex', gap:20 }}>
            <div><div style={label}>7-day avg</div><div style={{ ...mono, fontSize:'1.1rem', color:'var(--blue)', fontWeight:700 }}>{avgV}%</div></div>
            <div><div style={label}>Peak</div><div style={{ ...mono, fontSize:'1.1rem', color:'var(--amber)', fontWeight:700 }}>{maxV}%</div></div>
          </div>
        </div>

        {/* Bar — per unit fill */}
        <div style={{ ...card, padding:'20px 22px' }}>
          <div style={{ fontSize:'0.88rem', fontWeight:600, color:'var(--text)', marginBottom:2 }}>Per-Unit Fill</div>
          <div style={{ ...mono, fontSize:'0.65rem', color:'var(--sub)', marginBottom:16 }}>CURRENT % · ALL UNITS</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top:4, right:4, bottom:20, left:-20 }} barSize={22}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="id" tick={{ fill:'var(--muted)', fontSize:9, fontFamily:'IBM Plex Mono, monospace' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0,100]} tick={{ fill:'var(--muted)', fontSize:10, fontFamily:'IBM Plex Mono, monospace' }} axisLine={false} tickLine={false} />
              <Tooltip content={<BarTooltip />} cursor={{ fill:'rgba(41,171,226,0.04)' }} />
              <Bar dataKey="fill" radius={[4,4,0,0]}>
                {barData.map(d => <Cell key={d.id} fill={fillColor(d.fill)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status donut + fleet breakdown */}
      <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:16 }}>
        <div style={{ ...card, padding:'20px 22px' }}>
          <div style={{ fontSize:'0.88rem', fontWeight:600, color:'var(--text)', marginBottom:16 }}>Fleet Status</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {statusData.map(d => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={(val, name) => [`${val} units`, name]} contentStyle={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:4 }}>
            {statusData.map(d => (
              <div key={d.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:'0.75rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:d.color, flexShrink:0 }} />
                  <span style={{ color:'var(--sub)' }}>{d.name}</span>
                </div>
                <span style={{ ...mono, fontWeight:600, color:d.color }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding:'20px 22px' }}>
          <div style={{ fontSize:'0.88rem', fontWeight:600, color:'var(--text)', marginBottom:16 }}>Per-Unit Detail</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[...bins].sort((a,b) => b.fill - a.fill).map(b => (
              <div key={b.id} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ ...mono, fontSize:'0.63rem', color:'var(--blue)', minWidth:52, fontWeight:600 }}>{b.id}</span>
                <div style={{ flex:1 }}><FillBar pct={Math.round(b.fill)} height={7} glow /></div>
                <span style={{ ...mono, fontSize:'0.65rem', color:fillColor(b.fill), minWidth:34, textAlign:'right', fontWeight:700 }}>{Math.round(b.fill)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
