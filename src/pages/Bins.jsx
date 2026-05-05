import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { BINS } from '../data/bins'
import FillBar from '../components/FillBar'
import StatusBadge from '../components/StatusBadge'

const STATUSES = ['all', 'online', 'full', 'warning', 'fault', 'offline']

export default function Bins() {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = BINS.filter(b => {
    const matchQ = b.name.toLowerCase().includes(q.toLowerCase()) || b.id.toLowerCase().includes(q.toLowerCase())
    const matchS = filter === 'all' || b.status === filter
    return matchQ && matchS
  })

  return (
    <main style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '1.9rem', color: '#fff', marginBottom: 4 }}>Bin Fleet</h1>
        <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{BINS.length} units deployed · Malta</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search bin ID or name…"
            style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 8, padding: '8px 12px 8px 34px', color: '#cbd5e1', fontSize: '0.82rem', width: '100%', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ fontSize: '0.72rem', fontWeight: 600, padding: '6px 14px', borderRadius: 9999, border: '1px solid', cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'JetBrains Mono, monospace', transition: 'all 0.15s',
                background: filter === s ? '#a3e635' : 'transparent',
                color: filter === s ? '#0a0f1e' : '#475569',
                borderColor: filter === s ? '#a3e635' : '#162347' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {filtered.map(b => (
          <Link key={b.id} to={`/bins/${b.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, padding: '20px', transition: 'border-color 0.2s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#162347'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#111d38'; e.currentTarget.style.transform = 'none' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#a3e635', fontWeight: 600, marginBottom: 3 }}>{b.id}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{b.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>{b.location}</div>
                </div>
                <StatusBadge status={b.status} />
              </div>

              {/* Fill */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>FILL LEVEL</span>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', color: b.fill >= 90 ? '#ef4444' : b.fill >= 70 ? '#f59e0b' : '#a3e635' }}>{b.fill}%</span>
                </div>
                <FillBar pct={b.fill} height={6} />
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: 16, fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace' }}>
                <div>
                  <div style={{ color: '#334155', marginBottom: 2 }}>BATTERY</div>
                  <div style={{ color: b.battery < 20 ? '#ef4444' : '#94a3b8' }}>{b.battery}%</div>
                </div>
                <div>
                  <div style={{ color: '#334155', marginBottom: 2 }}>CYCLES</div>
                  <div style={{ color: '#94a3b8' }}>{b.compactions}</div>
                </div>
                <div>
                  <div style={{ color: '#334155', marginBottom: 2 }}>TEMP</div>
                  <div style={{ color: '#94a3b8' }}>{b.temp > 0 ? `${b.temp}°C` : '—'}</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ color: '#334155', marginBottom: 2 }}>SEEN</div>
                  <div style={{ color: '#94a3b8' }}>{b.lastSeen}</div>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#334155', fontSize: '0.85rem' }}>
            No bins match your filters.
          </div>
        )}
      </div>
    </main>
  )
}
