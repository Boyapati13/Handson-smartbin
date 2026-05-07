import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Trash2, Wifi, WifiOff } from 'lucide-react'
import { useApp } from '../context/AppContext'

const mono = { fontFamily: 'IBM Plex Mono, monospace' }
const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow)' }

const FRAME_REF = [
  { byte: 'E9 00', label: 'Handshake (IMEI)',      color: '#94a3b8' },
  { byte: 'E9 10', label: 'Location',              color: '#60a5fa' },
  { byte: 'E9 11', label: 'Alert (smoke / jam)',   color: '#f87171' },
  { byte: 'E9 06', label: 'Bucket status',         color: '#29ABE2' },
  { byte: 'E9 07', label: 'Battery state',         color: '#34d399' },
  { byte: 'E9 08', label: 'Capacity',              color: '#29ABE2' },
  { byte: 'E9 09', label: 'Counts / heartbeat',    color: '#29ABE2' },
  { byte: 'E9 AB', label: 'Server ACK',            color: '#a78bfa' },
  { byte: 'E9 C1', label: 'CMD → open door',       color: '#fb923c' },
  { byte: 'E9 C3', label: 'CMD → read status',     color: '#fb923c' },
  { byte: 'E9 C5', label: 'CMD → read capacity',   color: '#fb923c' },
]

function frameColor(hex) {
  const match = FRAME_REF.find(f => hex?.startsWith(f.byte))
  return match?.color ?? '#475569'
}

export default function Telemetry() {
  const { frames, connected, sendCommand, bins, connectedDevices } = useApp()
  const [paused,  setPaused]  = useState(false)
  const [filter,  setFilter]  = useState('all')
  const [log,     setLog]     = useState([])
  const bottomRef = useRef(null)

  // Freeze log when paused, follow tail when live
  useEffect(() => {
    if (!paused) setLog(frames)
  }, [frames, paused])

  useEffect(() => {
    if (!paused) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log, paused])

  const display    = log.filter(p => filter === 'all' || p.dir?.startsWith(filter))
  const uartCount  = log.filter(p => p.dir?.startsWith('UART')).length
  const tcpCount   = log.filter(p => p.dir?.startsWith('TCP')).length
  const alertCount = log.filter(p => p.decoded?.toLowerCase().includes('alert')).length
  const isLive     = connectedDevices.some(d => d.connected)

  return (
    <div style={{ padding: '28px 32px', animation: 'slideUp 0.3s ease both' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
            Telemetry
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: isLive ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', border: `1px solid ${isLive ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.2)'}` }}>
            {isLive
              ? <><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981', animation: 'breathe 1.2s ease-in-out infinite' }} /><span style={{ ...mono, fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>LIVE</span></>
              : <><WifiOff size={11} color="var(--muted)" /><span style={{ ...mono, fontSize: '0.65rem', color: 'var(--muted)' }}>WAITING</span></>
            }
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setLog([]); setPaused(false) }}
            style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--sub)', fontSize: '0.76rem', fontFamily: 'Figtree, sans-serif', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--crimson)'; e.currentTarget.style.color = 'var(--crimson)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--sub)' }}>
            <Trash2 size={13} /> Clear
          </button>
          <button
            onClick={() => setPaused(p => !p)}
            style={{ background: paused ? 'var(--blue)' : 'transparent', border: `1px solid ${paused ? 'var(--blue)' : 'var(--border2)'}`, color: paused ? '#fff' : 'var(--sub)', fontSize: '0.76rem', fontFamily: 'Figtree, sans-serif', fontWeight: paused ? 700 : 400, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}>
            {paused ? <><Play size={13} /> Resume</> : <><Pause size={13} /> Pause</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 240px', gap: 16, alignItems: 'start' }}>

        {/* Left — terminal + stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Filter bar */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ ...mono, fontSize: '0.6rem', color: 'var(--muted)', marginRight: 4 }}>FILTER</span>
            {[['all', 'All'], ['UART', 'UART → TCP'], ['TCP', 'TCP → UART']].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)} style={{ ...mono, fontSize: '0.65rem', fontWeight: 600, padding: '5px 12px', borderRadius: 6, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s', background: filter === v ? 'var(--blue)' : 'transparent', color: filter === v ? '#fff' : 'var(--sub)', borderColor: filter === v ? 'var(--blue)' : 'var(--border2)' }}>
                {l}
              </button>
            ))}
            <span style={{ ...mono, fontSize: '0.6rem', color: 'var(--muted)', marginLeft: 'auto' }}>{display.length} frames</span>
          </div>

          {/* Terminal */}
          <div style={{ height: 480, overflowY: 'auto', fontFamily: 'IBM Plex Mono, monospace', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, boxShadow: 'var(--shadow)' }}>
            <div style={{ padding: '8px 0' }}>
              {display.length === 0 && (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#475569', fontSize: '0.78rem' }}>
                  {connected ? 'Waiting for frames…' : 'Server offline — run npm run dev:all'}
                </div>
              )}
              {display.map((p, i) => {
                const isUart  = p.dir?.startsWith('UART')
                const dirCol  = isUart ? '#29ABE2' : '#a78bfa'
                const hexCol  = frameColor(p.hex)
                return (
                  <div key={p.id ?? i} style={{ display: 'flex', padding: '3px 16px', borderBottom: '1px solid rgba(30,41,59,0.5)', background: i === display.length - 1 ? 'rgba(41,171,226,0.04)' : 'transparent' }}>
                    <span style={{ fontSize: '0.62rem', color: '#475569', minWidth: 72, flexShrink: 0 }}>{p.ts?.slice(11) ?? '--:--:--'}</span>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: dirCol, minWidth: 76, flexShrink: 0 }}>{p.dir}</span>
                    <span style={{ fontSize: '0.62rem', color: hexCol, flex: 1, marginRight: 12, wordBreak: 'break-all' }}>{p.hex}</span>
                    <span style={{ fontSize: '0.6rem', color: '#64748b', minWidth: 180, textAlign: 'right', flexShrink: 0 }}>{p.decoded}</span>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
            {!paused && connected && (
              <div style={{ padding: '4px 16px' }}>
                <span style={{ fontSize: '0.63rem', color: '#29ABE2', animation: 'breathe 1s ease-in-out infinite' }}>█</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[['Total', log.length, 'var(--text)'], ['UART→TCP', uartCount, 'var(--blue)'], ['TCP→UART', tcpCount, '#a78bfa'], ['Alerts', alertCount, 'var(--crimson)']].map(([l, v, c]) => (
              <div key={l} style={{ ...card, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ ...mono, fontSize: '0.56rem', color: 'var(--muted)', marginBottom: 4, letterSpacing: '0.06em' }}>{l.toUpperCase()}</div>
                <div style={{ ...mono, fontSize: '1.4rem', fontWeight: 700, color: c, lineHeight: 1 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — frame ref + send command */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Frame reference */}
          <div style={{ ...card, padding: '16px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text)', marginBottom: 10 }}>Frame Reference</div>
            {FRAME_REF.map(f => (
              <div key={f.byte} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', borderBottom: '1px solid var(--ink)' }}>
                <code style={{ ...mono, fontSize: '0.6rem', color: f.color, minWidth: 48 }}>{f.byte}</code>
                <span style={{ fontSize: '0.68rem', color: 'var(--sub)' }}>{f.label}</span>
              </div>
            ))}
          </div>

          {/* Send command */}
          <div style={{ ...card, padding: '16px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text)', marginBottom: 10 }}>Send Command</div>
            <select
              id="cmd-bin"
              style={{ width: '100%', background: 'var(--raised)', border: '1px solid var(--border2)', borderRadius: 7, padding: '7px 10px', color: 'var(--text)', fontSize: '0.76rem', marginBottom: 10, fontFamily: 'Figtree, sans-serif', cursor: 'pointer' }}>
              {bins.map(b => (
                <option key={b.id} value={b.id}>{b.id} — {b.name}</option>
              ))}
            </select>
            {[
              ['compact',     'Poll Capacity',       'var(--blue)'],
              ['diagnostics', 'Full Diagnostics',    'transparent'],
              ['acknowledge', 'Clear Alerts',        'transparent'],
            ].map(([cmd, lbl, bg]) => (
              <button key={cmd}
                onClick={() => { const sel = document.getElementById('cmd-bin'); sendCommand(cmd, sel?.value || bins[0]?.id) }}
                disabled={!connected}
                style={{ width: '100%', background: bg, color: bg !== 'transparent' ? '#fff' : 'var(--text)', border: `1px solid ${bg !== 'transparent' ? bg : 'var(--border2)'}`, fontSize: '0.76rem', fontWeight: bg !== 'transparent' ? 600 : 500, fontFamily: 'Figtree, sans-serif', padding: '8px 12px', borderRadius: 7, cursor: connected ? 'pointer' : 'not-allowed', marginBottom: 6, textAlign: 'left', transition: 'all 0.15s', opacity: connected ? 1 : 0.4 }}
                onMouseEnter={e => { if (connected && bg === 'transparent') { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)' } }}
                onMouseLeave={e => { if (bg === 'transparent') { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)' } }}>
                {lbl}
              </button>
            ))}
            {!connected && <div style={{ ...mono, fontSize: '0.6rem', color: 'var(--muted)', textAlign: 'center', marginTop: 6 }}>Start server to enable</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
