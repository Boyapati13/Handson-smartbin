import { useState } from 'react'
import { Play, Pause, Trash2, Radio, Cpu } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { REAL_DEVICE } from '../data/bins'

const mono = { fontFamily:'IBM Plex Mono, monospace' }
const card = { background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, boxShadow:'var(--shadow)' }

const FRAME_TYPES = [
  { byte:'E9 09', label:'Heartbeat / Status', color:'var(--blue)'    },
  { byte:'E9 AB', label:'Server ACK',          color:'var(--sky)'     },
  { byte:'E9 0A', label:'Alert / Warning',     color:'var(--amber)'   },
  { byte:'E9 0F', label:'Fault Report',        color:'var(--crimson)' },
  { byte:'E9 B1', label:'CMD: Compact',        color:'#a78bfa'        },
  { byte:'E9 C2', label:'CMD: Diagnostics',    color:'#a78bfa'        },
  { byte:'E9 D0', label:'Diagnostics Data',    color:'var(--sub)'     },
]

export default function Telemetry() {
  const { frames, connected, sendCommand, bins } = useApp()
  const [paused,  setPaused]  = useState(false)
  const [filter,  setFilter]  = useState('all')

  const display  = (paused ? [] : frames).filter(p => filter === 'all' || p.dir?.startsWith(filter))
  const uartCount = frames.filter(p => p.dir?.startsWith('UART')).length
  const tcpCount  = frames.filter(p => p.dir?.startsWith('TCP')).length
  const alertCount = frames.filter(p => p.decoded?.includes('ALERT') || p.decoded?.includes('WARNING')).length

  return (
    <div style={{ padding:'28px 32px', animation:'slideUp 0.3s ease both' }}>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.65rem', fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:4 }}>
            Telemetry Console
          </h1>
          <div style={{ ...mono, fontSize:'0.7rem', color:'var(--sub)' }}>UART ↔ TCP live protocol stream · EcoDisposer HY-CKX1</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => {}} style={{ background:'transparent', border:'1px solid var(--border2)', color:'var(--sub)', fontSize:'0.76rem', fontFamily:'Figtree, sans-serif', padding:'8px 14px', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', gap:6, transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--crimson)'; e.currentTarget.style.color='var(--crimson)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.color='var(--sub)' }}>
            <Trash2 size={13} /> Clear
          </button>
          <button onClick={() => setPaused(p => !p)} style={{
            background: paused ? 'var(--blue)' : 'transparent',
            border: `1px solid ${paused ? 'var(--blue)' : 'var(--border2)'}`,
            color: paused ? '#fff' : 'var(--sub)',
            fontSize:'0.76rem', fontFamily:'Figtree, sans-serif', fontWeight: paused ? 700 : 400,
            padding:'8px 14px', borderRadius:8, cursor:'pointer',
            display:'flex', alignItems:'center', gap:6, transition:'all 0.15s',
          }}>
            {paused ? <><Play size={13} /> Resume</> : <><Pause size={13} /> Pause</>}
          </button>
        </div>
      </div>

      {/* Device identity */}
      <div style={{ ...card, padding:'16px 22px', marginBottom:20, display:'flex', gap:28, flexWrap:'wrap', alignItems:'center', background:'linear-gradient(135deg,#ffffff 0%,#f0f9ff 100%)', borderColor:'rgba(41,171,226,0.2)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:'var(--blue-dim)', border:'1px solid var(--blue-glow)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Radio size={18} color="var(--blue)" />
          </div>
          <div>
            <div style={{ ...mono, fontSize:'0.6rem', color:'var(--muted)', marginBottom:2 }}>ACTIVE DEVICE</div>
            <div style={{ ...mono, fontSize:'0.88rem', fontWeight:700, color:'var(--blue)' }}>{REAL_DEVICE.deviceNo}</div>
          </div>
        </div>
        {[['Model', REAL_DEVICE.model], ['Protocol','UART ↔ TCP · E9xx frame'], ['Frames received', frames.length]].map(([l,v]) => (
          <div key={l}>
            <div style={{ ...mono, fontSize:'0.6rem', color:'var(--muted)', marginBottom:3, letterSpacing:'0.06em' }}>{l.toUpperCase()}</div>
            <div style={{ ...mono, fontSize:'0.75rem', color:'var(--text)', fontWeight:600 }}>{v}</div>
          </div>
        ))}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background: connected ? 'var(--green)' : 'var(--amber)', display:'inline-block', boxShadow: connected ? '0 0 8px #10b981' : '0 0 8px #f59e0b', animation: connected ? 'breathe 1.2s ease-in-out infinite' : 'none' }} />
          <span style={{ ...mono, fontSize:'0.68rem', color: connected ? 'var(--green)' : 'var(--amber)', fontWeight:700 }}>
            {connected ? 'STREAMING' : 'CONNECTING…'}
          </span>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 270px', gap:16 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* Filter bar */}
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ ...mono, fontSize:'0.62rem', color:'var(--muted)', marginRight:4 }}>FILTER:</span>
            {[['all','All'],['UART','UART→TCP'],['TCP','TCP→UART']].map(([v,l]) => (
              <button key={v} onClick={() => setFilter(v)} style={{
                ...mono, fontSize:'0.65rem', fontWeight:600, padding:'5px 12px',
                borderRadius:6, border:'1px solid', cursor:'pointer', transition:'all 0.15s',
                background: filter===v ? 'var(--blue)' : 'transparent',
                color:      filter===v ? '#fff'        : 'var(--sub)',
                borderColor:filter===v ? 'var(--blue)' : 'var(--border2)',
              }}>{l}</button>
            ))}
            <span style={{ ...mono, fontSize:'0.62rem', color:'var(--muted)', marginLeft:'auto' }}>{display.length} FRAMES</span>
          </div>

          {/* Terminal log */}
          <div style={{ height:420, overflowY:'auto', fontFamily:'IBM Plex Mono, monospace', background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, boxShadow:'var(--shadow)' }}>
            <div style={{ padding:'8px 0' }}>
              {display.length === 0 && (
                <div style={{ padding:'40px 20px', textAlign:'center', color:'#475569', fontSize:'0.78rem' }}>
                  {connected ? 'Waiting for frames…' : 'Not connected — start the server with: npm run dev:all'}
                </div>
              )}
              {display.map((p, i) => {
                const isUart     = p.dir?.startsWith('UART')
                const dirColor   = isUart ? '#29ABE2' : '#38bdf8'
                const frameColor = FRAME_TYPES.find(f => p.hex?.startsWith(f.byte))?.color || '#475569'
                return (
                  <div key={p.id ?? i} style={{ display:'flex', padding:'4px 16px', borderBottom:'1px solid rgba(30,41,59,0.6)', animation:'scroll-in 0.2s ease both', background: i===display.length-1 ? 'rgba(41,171,226,0.04)' : 'transparent' }}>
                    <span style={{ fontSize:'0.63rem', color:'#475569', minWidth:74, flexShrink:0 }}>{p.ts?.slice(11)||'--:--:--'}</span>
                    <span style={{ fontSize:'0.63rem', fontWeight:700, color:dirColor, minWidth:72, flexShrink:0 }}>{p.dir}</span>
                    <span style={{ fontSize:'0.63rem', color: typeof frameColor === 'string' ? frameColor : '#475569', flex:1, marginRight:12, wordBreak:'break-all' }}>{p.hex}</span>
                    <span style={{ fontSize:'0.61rem', color:'#64748b', minWidth:200, textAlign:'right', flexShrink:0 }}>{p.decoded}</span>
                  </div>
                )
              })}
            </div>
            {!paused && connected && (
              <div style={{ padding:'4px 16px' }}>
                <span style={{ fontSize:'0.63rem', color:'#29ABE2', animation:'breathe 1s ease-in-out infinite' }}>█</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
            {[['Total Frames',frames.length,'var(--text)'],['UART→TCP',uartCount,'var(--blue)'],['TCP→UART',tcpCount,'var(--sky)'],['Alerts',alertCount,'var(--amber)']].map(([l,v,c]) => (
              <div key={l} style={{ ...card, padding:'12px 14px', textAlign:'center' }}>
                <div style={{ ...mono, fontSize:'0.58rem', color:'var(--muted)', marginBottom:4, letterSpacing:'0.06em' }}>{l.toUpperCase()}</div>
                <div style={{ ...mono, fontSize:'1.4rem', fontWeight:700, color:c, lineHeight:1 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Frame reference */}
          <div style={{ ...card, padding:'16px' }}>
            <div style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--text)', marginBottom:12 }}>Frame Reference</div>
            {FRAME_TYPES.map(f => (
              <div key={f.byte} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0', borderBottom:'1px solid var(--ink)' }}>
                <code style={{ ...mono, fontSize:'0.62rem', color:f.color, minWidth:52 }}>{f.byte}</code>
                <span style={{ fontSize:'0.7rem', color:'var(--sub)' }}>{f.label}</span>
              </div>
            ))}
          </div>

          {/* Device commands */}
          <div style={{ ...card, padding:'16px' }}>
            <div style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--text)', marginBottom:10 }}>Send Command</div>
            <div style={{ ...mono, fontSize:'0.62rem', color:'var(--muted)', marginBottom:10 }}>SELECT UNIT:</div>
            <select style={{ width:'100%', background:'var(--raised)', border:'1px solid var(--border2)', borderRadius:7, padding:'8px 10px', color:'var(--text)', fontSize:'0.78rem', marginBottom:10, fontFamily:'Figtree, sans-serif', cursor:'pointer' }}
              id="cmd-bin">
              {bins.map(b => (
                <option key={b.id} value={b.id}>{b.id} — {b.name}</option>
              ))}
            </select>
            {[
              ['compact',     'Trigger Compaction',   'var(--blue)'],
              ['diagnostics', 'Request Diagnostics',  'transparent'],
              ['acknowledge', 'Acknowledge Alerts',   'transparent'],
            ].map(([cmd, lbl, bg]) => (
              <button key={cmd}
                onClick={() => { const sel = document.getElementById('cmd-bin'); sendCommand(cmd, sel?.value || bins[0]?.id) }}
                disabled={!connected}
                style={{
                  width:'100%', background: bg, color: bg !== 'transparent' ? '#fff' : 'var(--text)',
                  border:`1px solid ${bg !== 'transparent' ? bg : 'var(--border2)'}`,
                  fontSize:'0.78rem', fontWeight: bg !== 'transparent' ? 600 : 500,
                  fontFamily:'Figtree, sans-serif', padding:'9px 12px', borderRadius:7,
                  cursor: connected ? 'pointer' : 'not-allowed', marginBottom:6,
                  textAlign:'left', transition:'all 0.15s',
                  opacity: connected ? 1 : 0.4,
                }}
                onMouseEnter={e => { if (connected && bg === 'transparent') { e.currentTarget.style.borderColor='var(--blue)'; e.currentTarget.style.color='var(--blue)' } }}
                onMouseLeave={e => { if (bg === 'transparent') { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.color='var(--text)' } }}>
                {lbl}
              </button>
            ))}
            {!connected && <div style={{ ...mono, fontSize:'0.62rem', color:'var(--muted)', textAlign:'center', marginTop:4 }}>Start server to send commands</div>}
          </div>

          {/* Device registry */}
          <div style={{ ...card, padding:'16px' }}>
            <div style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--text)', marginBottom:10 }}>Device Registry</div>
            {bins.map(b => (
              <div key={b.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid var(--border)' }}>
                <div>
                  <div style={{ ...mono, fontSize:'0.65rem', color:'var(--blue)', marginBottom:2, fontWeight:600 }}>{b.id}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--sub)', maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.name}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background: b.status==='offline' ? 'var(--muted)' : 'var(--green)', marginLeft:'auto', marginBottom:2, boxShadow: b.status!=='offline' ? '0 0 5px #10b981' : 'none' }} />
                  <div style={{ ...mono, fontSize:'0.58rem', color:'var(--muted)' }}>{b.status==='offline' ? 'OFFLINE' : 'LIVE'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
