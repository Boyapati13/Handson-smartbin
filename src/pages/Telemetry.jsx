import { useState, useEffect, useRef } from 'react'
import { PROTOCOL_LOG, BINS, REAL_DEVICE } from '../data/bins'

const S = { card:{background:'#0b1120',border:'1px solid #131e35',borderRadius:10}, mono:{fontFamily:'IBM Plex Mono,monospace'} }

// Simulate live streaming by adding entries over time
const LIVE_FRAMES = [
  { dir:'UART→TCP', hex:'E9 09 06 01 3E 58 1C 00 00 00 00 0D 0A', decoded:'Heartbeat · fill=62% · bat=88% · temp=28°C · OK' },
  { dir:'TCP→UART', hex:'E9 AB 00 0D 0A',                         decoded:'ACK · server confirmed receipt' },
  { dir:'UART→TCP', hex:'E9 09 06 01 60 40 1D 00 00 00 00 0D 0A', decoded:'Fill=96% · OVERFLOW ALERT transmitted' },
  { dir:'TCP→UART', hex:'E9 B1 01 0D 0A',                         decoded:'CMD · trigger compaction cycle' },
  { dir:'UART→TCP', hex:'E9 09 06 03 60 40 1D 00 00 00 00 0D 0A', decoded:'Compacting · motor active' },
  { dir:'UART→TCP', hex:'E9 09 06 01 52 40 1D 00 00 00 00 0D 0A', decoded:'Compaction complete · fill=82%' },
  { dir:'TCP→UART', hex:'E9 AB 00 0D 0A',                         decoded:'ACK' },
  { dir:'UART→TCP', hex:'E9 0A 06 01 1F 0C 00 00 00 00 00 0D 0A', decoded:'Fill=31% · LOW BATTERY 12% WARNING' },
  { dir:'TCP→UART', hex:'E9 C2 01 0D 0A',                         decoded:'CMD · request diagnostics' },
]

export default function Telemetry() {
  const [log, setLog] = useState(PROTOCOL_LOG.map((p,i) => ({...p, id:i})))
  const [paused, setPaused] = useState(false)
  const [filter, setFilter] = useState('all')
  const [selectedBin, setSelectedBin] = useState(BINS[0].id)
  const [frameIdx, setFrameIdx] = useState(0)
  const logRef = useRef(null)
  const counterRef = useRef(PROTOCOL_LOG.length)

  // Auto-scroll
  useEffect(() => {
    if (logRef.current && !paused) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [log, paused])

  // Live stream simulation
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      const now = new Date()
      const ts = `2026-05-05 ${now.toLocaleTimeString('en-MT',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}`
      const frame = LIVE_FRAMES[frameIdx % LIVE_FRAMES.length]
      setLog(prev => [...prev.slice(-80), { ...frame, ts, id: counterRef.current++ }])
      setFrameIdx(f => f + 1)
    }, 2400)
    return () => clearInterval(id)
  }, [paused, frameIdx])

  const bin = BINS.find(b => b.id === selectedBin)
  const filtered = log.filter(p => filter === 'all' || p.dir.startsWith(filter))

  const FRAME_TYPES = [
    { byte:'E9 09', label:'Heartbeat / Status', color:'#8fff00' },
    { byte:'E9 AB', label:'Server ACK',         color:'#38bdf8' },
    { byte:'E9 0A', label:'Alert / Warning',    color:'#ffb347' },
    { byte:'E9 0F', label:'Fault Report',       color:'#ff3b55' },
    { byte:'E9 B1', label:'CMD: Compact',       color:'#a78bfa' },
    { byte:'E9 C2', label:'CMD: Diagnostics',  color:'#a78bfa' },
    { byte:'E9 D0', label:'Diagnostics Data',  color:'#5a6b8a' },
  ]

  return (
    <div style={{padding:'28px 32px',animation:'slideUp 0.35s ease both'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'1.7rem',fontWeight:700,color:'#f0f4ff',letterSpacing:'-0.02em',marginBottom:4}}>
            Telemetry Console
          </h1>
          <div style={{...S.mono,fontSize:'0.7rem',color:'#5a6b8a'}}>UART ↔ TCP live protocol stream · EcoDisposer HY-CKX1</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setLog(PROTOCOL_LOG.map((p,i)=>({...p,id:i})))}
            style={{background:'transparent',border:'1px solid #1a2840',color:'#5a6b8a',fontSize:'0.76rem',fontFamily:'Figtree,sans-serif',padding:'8px 14px',borderRadius:7,cursor:'pointer'}}>
            Clear log
          </button>
          <button onClick={()=>setPaused(p=>!p)}
            style={{background:paused?'#8fff00':'transparent',border:`1px solid ${paused?'#8fff00':'#1a2840'}`,
              color:paused?'#05080f':'#5a6b8a',fontSize:'0.76rem',fontFamily:'Figtree,sans-serif',fontWeight:paused?700:400,padding:'8px 14px',borderRadius:7,cursor:'pointer'}}>
            {paused?'▶ Resume':'⏸ Pause'}
          </button>
        </div>
      </div>

      {/* Device identity card */}
      <div style={{...S.card,padding:'18px 22px',marginBottom:20,display:'flex',gap:32,flexWrap:'wrap',alignItems:'center',
        background:'linear-gradient(135deg,#0b1120 0%,#0d1830 100%)',borderColor:'#1a2840'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:36,height:36,borderRadius:8,background:'rgba(143,255,0,0.1)',border:'1px solid rgba(143,255,0,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{fontSize:'1.2rem'}}>📡</span>
          </div>
          <div>
            <div style={{...S.mono,fontSize:'0.62rem',color:'#3a4a64',marginBottom:2}}>ACTIVE DEVICE</div>
            <div style={{...S.mono,fontSize:'0.9rem',fontWeight:600,color:'#8fff00'}}>{REAL_DEVICE.deviceNo}</div>
          </div>
        </div>
        {[['IMEI',REAL_DEVICE.imei],['Model',REAL_DEVICE.model],['Brand',REAL_DEVICE.brand],['Protocol','UART ↔ TCP · E9xx frame']].map(([l,v])=>(
          <div key={l}>
            <div style={{...S.mono,fontSize:'0.6rem',color:'#3a4a64',marginBottom:3,letterSpacing:'0.06em'}}>{l}</div>
            <div style={{...S.mono,fontSize:'0.75rem',color:'#f0f4ff',fontWeight:500}}>{v}</div>
          </div>
        ))}
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
          <span style={{width:8,height:8,borderRadius:'50%',background:'#8fff00',display:'inline-block',boxShadow:'0 0 8px #8fff00',animation:'breathe 1.2s ease-in-out infinite'}}/>
          <span style={{...S.mono,fontSize:'0.68rem',color:'#8fff00',fontWeight:600}}>{paused?'PAUSED':'STREAMING'}</span>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:16}}>
        {/* Main console */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {/* Filter bar */}
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <span style={{...S.mono,fontSize:'0.62rem',color:'#3a4a64',marginRight:4}}>FILTER:</span>
            {[['all','All'],['UART','UART→TCP'],['TCP','TCP→UART']].map(([v,l])=>(
              <button key={v} onClick={()=>setFilter(v)}
                style={{...S.mono,fontSize:'0.65rem',fontWeight:600,padding:'5px 12px',borderRadius:5,border:'1px solid',cursor:'pointer',
                  background:filter===v?(v==='TCP'?'#38bdf8':v==='UART'?'#8fff00':'#8fff00'):'transparent',
                  color:filter===v?'#05080f':'#5a6b8a',
                  borderColor:filter===v?(v==='TCP'?'#38bdf8':'#8fff00'):'#1a2840'}}>
                {l}
              </button>
            ))}
            <span style={{...S.mono,fontSize:'0.62rem',color:'#3a4a64',marginLeft:'auto'}}>{filtered.length} FRAMES</span>
          </div>

          {/* Log window */}
          <div ref={logRef} style={{...S.card,height:420,overflowY:'auto',fontFamily:'IBM Plex Mono,monospace',background:'#06090f'}}>
            <div style={{padding:'10px 0'}}>
              {filtered.map((p,i) => {
                const isUart = p.dir.startsWith('UART')
                const color = isUart ? '#8fff00' : '#38bdf8'
                const frameColor = FRAME_TYPES.find(f => p.hex.startsWith(f.byte))?.color || '#5a6b8a'
                return (
                  <div key={p.id} style={{display:'flex',gap:0,padding:'5px 16px',borderBottom:'1px solid #070a10',
                    animation:'scroll-in 0.25s ease both',
                    background:i===filtered.length-1&&!paused?'rgba(143,255,0,0.03)':'transparent'}}>
                    {/* Timestamp */}
                    <span style={{fontSize:'0.65rem',color:'#3a4a64',minWidth:72,flexShrink:0}}>{p.ts?.slice(11)||'--:--:--'}</span>
                    {/* Direction */}
                    <span style={{fontSize:'0.65rem',fontWeight:700,color,minWidth:72,flexShrink:0}}>{p.dir}</span>
                    {/* Hex */}
                    <span style={{fontSize:'0.65rem',color:frameColor,flex:1,marginRight:12,wordBreak:'break-all'}}>{p.hex}</span>
                    {/* Decoded */}
                    <span style={{fontSize:'0.63rem',color:'#5a6b8a',minWidth:200,textAlign:'right',flexShrink:0}}>{p.decoded}</span>
                  </div>
                )
              })}
            </div>
            {/* Cursor blink */}
            {!paused && (
              <div style={{padding:'5px 16px',display:'flex',gap:0}}>
                <span style={{fontSize:'0.65rem',color:'#3a4a64',minWidth:72}}>▸</span>
                <span style={{fontSize:'0.65rem',color:'#8fff00',animation:'breathe 1s ease-in-out infinite'}}>█</span>
              </div>
            )}
          </div>

          {/* Stats strip */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
            {[
              ['Total Frames', log.length, '#f0f4ff'],
              ['UART→TCP', log.filter(p=>p.dir.startsWith('UART')).length, '#8fff00'],
              ['TCP→UART', log.filter(p=>p.dir.startsWith('TCP')).length, '#38bdf8'],
              ['Alerts', log.filter(p=>p.decoded?.includes('ALERT')||p.decoded?.includes('WARNING')).length, '#ffb347'],
            ].map(([l,v,c])=>(
              <div key={l} style={{...S.card,padding:'12px 14px',textAlign:'center'}}>
                <div style={{...S.mono,fontSize:'0.58rem',color:'#3a4a64',marginBottom:4,letterSpacing:'0.06em'}}>{l.toUpperCase()}</div>
                <div style={{...S.mono,fontSize:'1.4rem',fontWeight:600,color:c,lineHeight:1}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {/* Frame decoder */}
          <div style={{...S.card,padding:'16px',overflow:'hidden'}}>
            <div style={{fontWeight:600,fontSize:'0.82rem',color:'#f0f4ff',marginBottom:12}}>Frame Reference</div>
            <div style={{fontSize:'0.65rem',color:'#3a4a64',...S.mono,marginBottom:10}}>PREFIX → TYPE</div>
            {FRAME_TYPES.map(f=>(
              <div key={f.byte} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0',borderBottom:'1px solid #08111f'}}>
                <code style={{...S.mono,fontSize:'0.62rem',color:f.color,minWidth:52}}>{f.byte}</code>
                <span style={{fontSize:'0.68rem',color:'#5a6b8a'}}>{f.label}</span>
              </div>
            ))}
          </div>

          {/* Protocol anatomy */}
          <div style={{...S.card,padding:'16px'}}>
            <div style={{fontWeight:600,fontSize:'0.82rem',color:'#f0f4ff',marginBottom:12}}>Frame Anatomy</div>
            <div style={{background:'#06090f',borderRadius:8,padding:'12px',marginBottom:10}}>
              <div style={{...S.mono,fontSize:'0.68rem',color:'#ffb347',marginBottom:8}}>UART→TCP (Status)</div>
              <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                {[['E9','SOF','#8fff00'],['09','Len','#38bdf8'],['06','Type','#a78bfa'],['01','State','#ffb347'],['3E','Fill%','#ff3b55'],['58','Bat%','#8fff00'],['1C','Temp','#38bdf8'],['00','Res','#3a4a64'],['0D 0A','EOF','#5a6b8a']].map(([b,l,c])=>(
                  <div key={b} style={{textAlign:'center'}}>
                    <div style={{...S.mono,fontSize:'0.68rem',fontWeight:600,color:c,background:`${c}15`,border:`1px solid ${c}30`,borderRadius:4,padding:'3px 6px',marginBottom:4}}>{b}</div>
                    <div style={{fontSize:'0.58rem',color:'#3a4a64'}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:'#06090f',borderRadius:8,padding:'12px'}}>
              <div style={{...S.mono,fontSize:'0.68rem',color:'#38bdf8',marginBottom:8}}>TCP→UART (ACK)</div>
              <div style={{display:'flex',gap:4}}>
                {[['E9','SOF','#8fff00'],['AB','ACK','#38bdf8'],['00','Status','#ffb347'],['0D 0A','EOF','#5a6b8a']].map(([b,l,c])=>(
                  <div key={b} style={{textAlign:'center'}}>
                    <div style={{...S.mono,fontSize:'0.68rem',fontWeight:600,color:c,background:`${c}15`,border:`1px solid ${c}30`,borderRadius:4,padding:'3px 6px',marginBottom:4}}>{b}</div>
                    <div style={{fontSize:'0.58rem',color:'#3a4a64'}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Connected bins */}
          <div style={{...S.card,padding:'16px'}}>
            <div style={{fontWeight:600,fontSize:'0.82rem',color:'#f0f4ff',marginBottom:10}}>Device Registry</div>
            {BINS.map(b=>(
              <div key={b.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid #08111f'}}>
                <div>
                  <div style={{...S.mono,fontSize:'0.65rem',color:'#8fff00',marginBottom:2}}>{b.deviceNo}</div>
                  <div style={{fontSize:'0.68rem',color:'#5a6b8a'}}>{b.name}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:b.status==='offline'?'#3a4a64':'#8fff00',marginLeft:'auto',marginBottom:2,
                    boxShadow:b.status!=='offline'?'0 0 5px #8fff00':'none'}}/>
                  <div style={{...S.mono,fontSize:'0.58rem',color:'#3a4a64'}}>{b.status==='offline'?'OFFLINE':'LIVE'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
