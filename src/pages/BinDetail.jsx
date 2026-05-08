import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useApi } from '../hooks/useApi'
import { fillColor } from '../data/bins'
import FillBar    from '../components/FillBar'
import StatusBadge from '../components/StatusBadge'
import ArcGauge   from '../components/ArcGauge'
import MapView    from '../components/MapView'

const S = {
  card:  { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow)' },
  mono:  { fontFamily: 'IBM Plex Mono, monospace' },
  label: { fontSize: '0.62rem', fontFamily: 'IBM Plex Mono, monospace', color: 'var(--muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 },
}

const ETYPE_COL = {
  CAPACITY:       'var(--blue)',
  COUNTS:         'var(--blue)',
  BUCKET_STATUS:  'var(--sky)',
  BATTERY:        'var(--green)',
  LOCATION:       'var(--blue)',
  SENSOR_TRIGGER: 'var(--amber)',
  COMPRESS_START: 'var(--amber)',
  COMPRESS_DONE:  'var(--green)',
  SMOKE_FIRE:     'var(--crimson)',
  JAM:            'var(--crimson)',
  MAINTENANCE:    'var(--sub)',
}

function EventLabel(type) {
  const map = {
    CAPACITY:       'Fill update',
    COUNTS:         'Counts update',
    BUCKET_STATUS:  'Bucket status',
    BATTERY:        'Battery update',
    LOCATION:       'Location fix',
    SENSOR_TRIGGER: 'Sensor trigger',
    COMPRESS_START: 'Compressing',
    COMPRESS_DONE:  'Compaction done',
    SMOKE_FIRE:     'SMOKE ALERT',
    JAM:            'JAM detected',
    MAINTENANCE:    'Maintenance',
  }
  return map[type] || type
}

export default function BinDetail() {
  const { id } = useParams()
  const { bins, sendCommand } = useApp()
  const bin = bins.find(b => b.id === id)

  // Fetch real bin report (events + fill history) from server
  const { data: report } = useApi(`/reports/bins/${id}`, { skip: !id })

  if (!bin) return (
    <div style={{ padding: '60px 32px', textAlign: 'center' }}>
      <div style={{ color: 'var(--sub)', marginBottom: 16 }}>Bin <code style={{ color: 'var(--blue)' }}>{id}</code> not found.</div>
      <Link to="/fleet" style={{ color: 'var(--blue)', textDecoration: 'none', fontSize: '0.85rem' }}>← Back to fleet</Link>
    </div>
  )

  const fc = fillColor(bin.fill)
  const events = report?.events?.slice().reverse() || []
  const hasSlots = bin.capacitySlots?.some(s => s != null && s > 0)
  const hasDoorCounts = bin.openCounts?.some(c => c > 0)

  return (
    <div style={{ padding: '28px 32px', animation: 'slideUp 0.35s ease both' }}>

      <Link to="/fleet"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--sub)', textDecoration: 'none', fontSize: '0.78rem', marginBottom: 20, fontFamily: 'Figtree, sans-serif', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--blue)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--sub)'}>
        <ArrowLeft size={14} /> Back to fleet
      </Link>

      {/* Hero card */}
      <div style={{ ...S.card, padding: '24px 28px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 320, background: `radial-gradient(ellipse at right,${fc}10 0%,transparent 70%)` }} />
        <div style={{ position: 'absolute', top: 20, right: 28 }}>
          <ArcGauge pct={bin.fill} size={110} stroke={9} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <StatusBadge status={bin.status} />
          {bin.seen && <span style={{ ...S.mono, fontSize: '0.62rem', color: 'var(--sub)' }}>{bin.seen} ago</span>}
          {bin.doorOpen && <span style={{ ...S.mono, fontSize: '0.6rem', color: 'var(--amber)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 4, padding: '2px 8px' }}>DOOR OPEN</span>}
        </div>
        <div style={{ ...S.mono, fontSize: '0.7rem', color: 'var(--blue)', marginBottom: 5 }}>{bin.id}{bin.deviceNo ? ` · ${bin.deviceNo}` : ''}</div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4 }}>{bin.name}</h1>
        <div style={{ fontSize: '0.8rem', color: 'var(--sub)', marginBottom: 20 }}>{bin.area}</div>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {[
            ['Fill Level',    `${Math.round(bin.fill)}%`,                          fc],
            ['Battery',       `${Math.round(bin.battery)}%`,                       bin.battery < 20 ? 'var(--crimson)' : 'var(--green)'],
            ['Temperature',   bin.temp > 0 ? `${bin.temp}°C` : '—',               'var(--sky)'],
            ['Compactions',   bin.cycles,                                           'var(--sub)'],
          ].map(([l,v,c]) => (
            <div key={l}>
              <div style={S.label}>{l}</div>
              <div style={{ ...S.mono, fontSize: '1.1rem', fontWeight: 600, color: c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Fill detail */}
        <div style={{ ...S.card, padding: '20px 22px' }}>
          <div style={S.label}>Effective Fill</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
            <span style={{ ...S.mono, fontSize: '2.6rem', fontWeight: 600, color: fc, lineHeight: 1 }}>
              {Math.round(bin.fill)}<span style={{ fontSize: '1.2rem', color: 'var(--sub)' }}>%</span>
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--sub)' }}>≈ {Math.round(bin.fill * 9.6)} L of 960 L</span>
          </div>
          <FillBar pct={Math.round(bin.fill)} height={10} glow showLabel={false} />

          {/* Per-slot capacity from 0x08 response */}
          {hasSlots && (
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              {(bin.capacitySlots || []).map((s, i) => s != null && (
                <div key={i} style={{ flex: 1, background: 'var(--ink)', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ ...S.mono, fontSize: '0.55rem', color: 'var(--muted)', marginBottom: 3 }}>SLOT {i + 1}</div>
                  <div style={{ ...S.mono, fontSize: '0.9rem', fontWeight: 700, color: fillColor(s) }}>{s}%</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Battery detail — from 0x07 response */}
        <div style={{ ...S.card, padding: '20px 22px' }}>
          <div style={S.label}>Battery (Solar)</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
            <span style={{ ...S.mono, fontSize: '2.6rem', fontWeight: 600, color: bin.battery < 20 ? 'var(--crimson)' : 'var(--green)', lineHeight: 1 }}>
              {Math.round(bin.battery)}<span style={{ fontSize: '1.2rem', color: 'var(--sub)' }}>%</span>
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              ['Voltage',     bin.batteryVoltage != null ? `${bin.batteryVoltage} V`  : '—'],
              ['Current',     bin.batteryCurrent != null ? `${bin.batteryCurrent} A`  : '—'],
              ['Temperature', bin.temp > 0              ? `${bin.temp}°C`             : '—'],
              ['Status',      bin.battery < 20 ? 'LOW' : bin.battery < 50 ? 'OK' : 'GOOD'],
            ].map(([k, v]) => (
              <div key={k} style={{ background: 'var(--ink)', borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ ...S.mono, fontSize: '0.55rem', color: 'var(--muted)', marginBottom: 3 }}>{k.toUpperCase()}</div>
                <div style={{ ...S.mono, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Door counts + bucket status — from 0x09 and 0x06 */}
      <div style={{ ...S.card, padding: '20px 22px', marginBottom: 16 }}>
        <div style={S.label}>Slot Status &amp; Usage Counts</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[0, 1, 2].map(i => {
            const slot = bin.bucketStatus?.[i]
            const opens = bin.openCounts?.[i] ?? 0
            const compacts = bin.compactionCounts?.[i] ?? 0
            return (
              <div key={i} style={{ background: 'var(--ink)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ ...S.mono, fontSize: '0.62rem', color: 'var(--blue)', fontWeight: 700, marginBottom: 10 }}>SLOT {i + 1}</div>
                {slot ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
                    {[
                      ['Door',    slot.doorOpen   ? 'Open'    : 'Closed', slot.doorOpen   ? 'var(--amber)' : 'var(--green)'],
                      ['Fill',    slot.overflow   ? 'Full'    : 'Normal', slot.overflow   ? 'var(--crimson)': 'var(--green)'],
                      ['Bin',     slot.missingBin ? 'Missing' : 'Present',slot.missingBin ? 'var(--crimson)': 'var(--green)'],
                      ['Motor',   slot.motorFault  ? 'Fault'  : 'OK',     slot.motorFault  ? 'var(--crimson)': 'var(--green)'],
                      ['Sensor',  slot.sensorFault ? 'Fault'  : 'OK',     slot.sensorFault ? 'var(--crimson)': 'var(--green)'],
                    ].map(([k, v, c]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                        <span style={{ color: 'var(--muted)' }}>{k}</span>
                        <span style={{ ...S.mono, color: c, fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 10 }}>Awaiting status</div>
                )}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ ...S.mono, fontSize: '0.55rem', color: 'var(--muted)' }}>OPENS</div>
                    <div style={{ ...S.mono, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{opens}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ ...S.mono, fontSize: '0.55rem', color: 'var(--muted)' }}>COMPACTIONS</div>
                    <div style={{ ...S.mono, fontSize: '1rem', fontWeight: 700, color: 'var(--blue)' }}>{compacts}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Real event log from server */}
        <div style={{ ...S.card, overflow: 'hidden' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>Event Log</span>
            <span style={{ ...S.mono, fontSize: '0.6rem', color: 'var(--sub)' }}>{events.length} events</span>
          </div>
          {events.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.8rem' }}>
              No events yet — connect the device to see live events
            </div>
          ) : events.slice(0, 12).map((e, i) => (
            <div key={i} style={{ padding: '8px 18px', borderBottom: '1px solid var(--ink)', display: 'flex', gap: 12 }}>
              <span style={{ ...S.mono, fontSize: '0.6rem', color: 'var(--muted)', minWidth: 60, paddingTop: 2, flexShrink: 0 }}>
                {e.ts?.slice(11, 19) || '—'}
              </span>
              <span style={{ ...S.mono, fontSize: '0.6rem', fontWeight: 700, color: ETYPE_COL[e.type] || 'var(--sub)', minWidth: 76, paddingTop: 2, flexShrink: 0 }}>
                {EventLabel(e.type)}
              </span>
              <div style={{ fontSize: '0.72rem', color: 'var(--sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {e.type === 'CAPACITY'       && `Fill ${e.fill ?? ''}%`}
                {e.type === 'BATTERY'        && `${e.battery ?? '—'}% · ${e.temp ?? '—'}°C · ${e.batteryVoltage ?? '—'}V`}
                {e.type === 'COUNTS'         && `Opens: ${(e.openCounts || []).join('/')} · Compact: ${(e.compactionCounts || []).join('/')}`}
                {e.type === 'BUCKET_STATUS'  && `Status: ${e.status}`}
                {e.type === 'LOCATION'       && (e.location || 'GPS fix received')}
                {e.type === 'SENSOR_TRIGGER' && `Door ${e.door} triggered`}
                {e.type === 'COMPRESS_START' && `Door ${e.door} compressing`}
                {e.type === 'COMPRESS_DONE'  && `Door ${e.door} done`}
                {e.type === 'SMOKE_FIRE'     && 'Smoke alarm triggered'}
                {e.type === 'JAM'            && 'Mechanical jam detected'}
                {e.type === 'MAINTENANCE'    && (e.workDone || '')}
              </div>
            </div>
          ))}
        </div>

        {/* Location */}
        <div style={{ ...S.card, overflow: 'hidden' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>Location</span>
            <span style={{ ...S.mono, fontSize: '0.6rem', color: 'var(--sub)' }}>
              {bin.lastLocation || (bin.lat ? `${bin.lat?.toFixed(4)}, ${bin.lng?.toFixed(4)}` : 'Awaiting GPS')}
            </span>
          </div>
          <MapView bins={[bin]} height={220} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Device info — real data from bin object */}
        <div style={{ ...S.card, padding: '18px' }}>
          <div style={S.label}>Device Info</div>
          {[
            ['Model',       'HY-CKX1 Solar Compressor'],
            ['Card No',     bin.deviceNo || '—'],
            ['IMEI',        bin.imei     || '—'],
            ['Connectivity','4G/LTE + WiFi + Ethernet'],
            ['Power',       'Solar PV + Li-ion battery'],
            ['Capacity',    '3-slot independent compactor'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--ink)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>{k}</span>
              <span style={{ ...S.mono, fontSize: '0.68rem', color: 'var(--text)', textAlign: 'right', maxWidth: '55%', wordBreak: 'break-all' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ ...S.card, padding: '18px' }}>
          <div style={S.label}>Quick Actions</div>
          {[
            ['Poll device data',    'var(--blue)',     '#ffffff',        () => sendCommand('diagnostics',  bin.id)],
            ['Request compaction',  'transparent',     'var(--text)',    () => sendCommand('compact',      bin.id)],
            ['Acknowledge alerts',  'transparent',     'var(--text)',    () => sendCommand('acknowledge',  bin.id)],
            ['Unlock door',         'transparent',     'var(--text)',    () => sendCommand('door_unlock',  bin.id)],
            ['Reset device',        'transparent',     'var(--crimson)', () => sendCommand('reset',        bin.id)],
          ].map(([label, bg, col, action]) => (
            <button key={label} onClick={action} style={{
              width: '100%', background: bg,
              border: `1px solid ${bg === 'transparent' ? 'var(--border2)' : bg}`,
              color: col, fontSize: '0.78rem',
              fontWeight: bg === 'transparent' ? 500 : 700,
              fontFamily: 'Figtree, sans-serif', padding: '10px 14px',
              borderRadius: 7, cursor: 'pointer', marginBottom: 7,
              textAlign: 'left', transition: 'all 0.15s ease-out',
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
