import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { BINS, FILL_TREND, COLLECTION_TREND, fillColor } from '../data/bins'

const STATUS_DIST = [
  { name: 'Online', value: BINS.filter(b => b.status === 'online').length, color: '#a3e635' },
  { name: 'Full', value: BINS.filter(b => b.status === 'full').length, color: '#f59e0b' },
  { name: 'Warning', value: BINS.filter(b => b.status === 'warning').length, color: '#f59e0b' },
  { name: 'Fault', value: BINS.filter(b => b.status === 'fault').length, color: '#ef4444' },
  { name: 'Offline', value: BINS.filter(b => b.status === 'offline').length, color: '#64748b' },
]

const TT_STYLE = { background: '#0d1528', border: '1px solid #162347', borderRadius: 8, fontSize: '0.75rem', color: '#cbd5e1' }

export default function Analytics() {
  const avgFill = Math.round(BINS.reduce((a, b) => a + b.fill, 0) / BINS.length)
  const avgBatt = Math.round(BINS.reduce((a, b) => a + b.battery, 0) / BINS.length)
  const totalCycles = BINS.reduce((a, b) => a + b.compactions, 0)

  return (
    <main style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '1.9rem', color: '#fff', marginBottom: 4 }}>Analytics</h1>
        <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Fleet-wide performance · rolling 7 days</p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Avg Fill', value: `${avgFill}%`, note: 'Fleet average' },
          { label: 'Avg Battery', value: `${avgBatt}%`, note: 'Fleet average' },
          { label: 'Total Compactions', value: totalCycles, note: 'All units · today' },
          { label: 'Route Savings', value: '~28%', note: 'vs static routing' },
          { label: 'Uptime', value: '87.5%', note: '7/8 units online' },
          { label: 'CO₂ Saved', value: '~41 kg', note: 'vs weekly fixed routes' },
        ].map(k => (
          <div key={k.label} style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: '0.65rem', color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4, letterSpacing: '0.04em' }}>{k.label.toUpperCase()}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 700, color: '#a3e635', lineHeight: 1, marginBottom: 4 }}>{k.value}</div>
            <div style={{ fontSize: '0.68rem', color: '#334155' }}>{k.note}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Fill trend */}
        <div style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Avg fill level · last 7 days</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={FILL_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#111d38" />
              <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} domain={[0,100]} />
              <Tooltip contentStyle={TT_STYLE} />
              <Line type="monotone" dataKey="avg" stroke="#a3e635" strokeWidth={2} dot={{ fill: '#a3e635', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Collection trend */}
        <div style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Collections & compactions · last 4 weeks</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={COLLECTION_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#111d38" />
              <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TT_STYLE} />
              <Bar dataKey="collections" fill="#162347" radius={[3,3,0,0]} name="Collections" />
              <Bar dataKey="compactions" fill="#a3e635" radius={[3,3,0,0]} name="Compactions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-bin fill table */}
      <div style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #111d38', fontWeight: 600, fontSize: '0.875rem', color: '#fff' }}>
          Per-unit fill levels
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...BINS].sort((a,b) => b.fill - a.fill).map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#a3e635', minWidth: 56 }}>{b.id}</span>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', minWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</span>
              <div style={{ flex: 1 }}>
                <div style={{ background: '#162347', borderRadius: 9999, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${b.fill}%`, background: fillColor(b.fill), height: '100%', borderRadius: 9999, transition: 'width 0.5s' }} />
                </div>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: fillColor(b.fill), minWidth: 36, textAlign: 'right' }}>{b.fill}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status distribution */}
      <div style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, padding: '20px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Status distribution</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {STATUS_DIST.map(s => (
            <div key={s.name} style={{ flex: '1 1 80px', background: '#111d38', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.6rem', fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#475569' }}>{s.name}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
