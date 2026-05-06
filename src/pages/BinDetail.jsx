import { useParams, Link } from 'react-router-dom'
import { BINS, PROTOCOL_LOG, fillColor } from '../data/bins'
import FillBar from '../components/FillBar'
import StatusBadge from '../components/StatusBadge'
import ArcGauge from '../components/ArcGauge'

const S = { card:{background:'#0b1120',border:'1px solid #131e35',borderRadius:10}, mono:{fontFamily:'IBM Plex Mono,monospace'}, label:{fontSize:'0.62rem',fontFamily:'IBM Plex Mono,monospace',color:'#3a4a64',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:6} }

const EVENTS=[
  {t:'14:32',type:'COMPACT',msg:'Compaction cycle complete',detail:'Compression successful · fill reduced'},
  {t:'13:10',type:'FILL',msg:'Fill threshold crossed',detail:'Level exceeded 80% threshold'},
  {t:'11:45',type:'POWER',msg:'Solar charging active',detail:'Panel output 14.2 W detected'},
  {t:'09:00',type:'SYS',msg:'Daily health check passed',detail:'All 6 sensors nominal'},
  {t:'08:22',type:'DOOR',msg:'Service door closed',detail:'Access duration 7 min · Operator 02'},
  {t:'08:15',type:'DOOR',msg:'Service door opened',detail:'Key access · maintenance visit'},
]
const ETYPE_COL={COMPACT:'#8fff00',FILL:'#ffb347',POWER:'#38bdf8',SYS:'#5a6b8a',DOOR:'#3a4a64'}

export default function BinDetail() {
  const { id } = useParams()
  const bin = BINS.find(b => b.id === id)
  if (!bin) return (
    <div style={{padding:'60px 32px',textAlign:'center'}}>
      <div style={{color:'#5a6b8a',marginBottom:16}}>Bin <code style={{color:'#8fff00'}}>{id}</code> not found.</div>
      <Link to="/fleet" style={{color:'#8fff00',textDecoration:'none',fontSize:'0.85rem'}}>← Back to fleet</Link>
    </div>
  )
  const fc = fillColor(bin.fill)
  const binProtoLog = PROTOCOL_LOG.slice(0, 6)

  return (
    <div style={{padding:'28px 32px',animation:'slideUp 0.35s ease both'}}>
      <Link to="/fleet" style={{display:'inline-flex',alignItems:'center',gap:6,color:'#5a6b8a',textDecoration:'none',fontSize:'0.78rem',marginBottom:20,fontFamily:'Figtree,sans-serif'}}
        onMouseEnter={e=>e.currentTarget.style.color='#f0f4ff'} onMouseLeave={e=>e.currentTarget.style.color='#5a6b8a'}>
        ← Back to fleet
      </Link>

      {/* Hero */}
      <div style={{...S.card,padding:'24px 28px',marginBottom:20,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,right:0,bottom:0,width:320,background:`radial-gradient(ellipse at right,${fc}08 0%,transparent 70%)`}}/>
        <div style={{position:'absolute',top:20,right:28}}>
          <ArcGauge pct={bin.fill} size={110} stroke={9}/>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
          <StatusBadge status={bin.status}/>
          <span style={{...S.mono,fontSize:'0.62rem',color:'#5a6b8a'}}>{bin.seen} ago</span>
        </div>
        <div style={{...S.mono,fontSize:'0.7rem',color:'#8fff00',marginBottom:5}}>{bin.id}</div>
        <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'1.8rem',fontWeight:700,color:'#f0f4ff',letterSpacing:'-0.02em',marginBottom:4}}>{bin.name}</h1>
        <div style={{fontSize:'0.8rem',color:'#5a6b8a',marginBottom:20}}>{bin.area}, Malta</div>
        <div style={{display:'flex',gap:28,flexWrap:'wrap'}}>
          {[
            ['Fill Level',`${bin.fill}%`,fc],
            ['Battery',`${bin.battery}%`,bin.battery<20?'#ff3b55':'#8fff00'],
            ['Temperature',bin.temp>0?`${bin.temp}°C`:'—','#38bdf8'],
            ['Signal',`${bin.signal}/4`,bin.signal<2?'#ffb347':'#5a6b8a'],
            ['Cycles Today',bin.cycles,'#5a6b8a'],
          ].map(([l,v,c])=>(
            <div key={l}>
              <div style={{...S.label}}>{l}</div>
              <div style={{...S.mono,fontSize:'1.1rem',fontWeight:600,color:c}}>{v}</div>
            </div>
          ))}
        </div>
        {/* Device identity strip */}
        <div style={{marginTop:16,paddingTop:14,borderTop:'1px solid #131e35',display:'flex',gap:28,flexWrap:'wrap'}}>
          {[['Device No',bin.deviceNo],['IMEI',bin.imei],['Model','HY-CKX1']].map(([l,v])=>(
            <div key={l}>
              <div style={{...S.label}}>{l}</div>
              <div style={{...S.mono,fontSize:'0.78rem',color:'#38bdf8',fontWeight:500}}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        {/* Fill detail */}
        <div style={{...S.card,padding:'20px 22px'}}>
          <div style={S.label}>Effective Fill</div>
          <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:14}}>
            <span style={{...S.mono,fontSize:'2.6rem',fontWeight:600,color:fc,lineHeight:1}}>{bin.fill}<span style={{fontSize:'1.2rem',color:'#5a6b8a'}}>%</span></span>
            <span style={{fontSize:'0.76rem',color:'#5a6b8a'}}>≈ {Math.round(bin.fill*9.6)} L of 960 L</span>
          </div>
          <FillBar pct={bin.fill} height={10} glow showLabel={false}/>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
            <span style={{...S.mono,fontSize:'0.6rem',color:'#3a4a64'}}>0 L EMPTY</span>
            <span style={{...S.mono,fontSize:'0.6rem',color:'#3a4a64'}}>960 L FULL</span>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[
            {l:'Battery',v:`${bin.battery}%`,warn:bin.battery<20},
            {l:'Temperature',v:bin.temp>0?`${bin.temp}°C`:'—',warn:false},
            {l:'Signal',v:`${bin.signal}/4 bars`,warn:bin.signal<2},
            {l:'Compactions Today',v:bin.cycles,warn:false},
          ].map(m=>(
            <div key={m.l} style={{...S.card,padding:'14px 15px'}}>
              <div style={S.label}>{m.l}</div>
              <div style={{...S.mono,fontSize:'1rem',fontWeight:600,color:m.warn?'#ff3b55':'#8fff00'}}>{m.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        {/* Event log */}
        <div style={{...S.card,overflow:'hidden'}}>
          <div style={{padding:'13px 18px',borderBottom:'1px solid #131e35'}}>
            <span style={{fontWeight:600,fontSize:'0.85rem',color:'#f0f4ff'}}>Event Log</span>
            <span style={{...S.mono,fontSize:'0.6rem',color:'#5a6b8a',marginLeft:10}}>TODAY</span>
          </div>
          {EVENTS.map((e,i)=>(
            <div key={i} style={{padding:'9px 18px',borderBottom:'1px solid #05080e',display:'flex',gap:14}}>
              <span style={{...S.mono,fontSize:'0.63rem',color:'#3a4a64',minWidth:36,paddingTop:2}}>{e.t}</span>
              <span style={{...S.mono,fontSize:'0.6rem',fontWeight:600,color:ETYPE_COL[e.type]||'#5a6b8a',minWidth:52,paddingTop:2}}>{e.type}</span>
              <div>
                <div style={{fontSize:'0.76rem',color:'#f0f4ff',marginBottom:2}}>{e.msg}</div>
                <div style={{fontSize:'0.66rem',color:'#5a6b8a'}}>{e.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Protocol log for this bin */}
        <div style={{...S.card,overflow:'hidden'}}>
          <div style={{padding:'13px 18px',borderBottom:'1px solid #131e35',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontWeight:600,fontSize:'0.85rem',color:'#f0f4ff'}}>UART ↔ TCP Log</span>
            <span style={{...S.mono,fontSize:'0.6rem',color:'#38bdf8'}}>LIVE</span>
          </div>
          <div style={{maxHeight:260,overflowY:'auto'}}>
            {binProtoLog.map((p,i)=>(
              <div key={i} style={{padding:'8px 16px',borderBottom:'1px solid #05080e',display:'flex',gap:10,alignItems:'flex-start'}}>
                <div style={{...S.mono,fontSize:'0.58rem',color:'#3a4a64',minWidth:44,paddingTop:2,whiteSpace:'nowrap'}}>{p.ts.slice(11)}</div>
                <div style={{...S.mono,fontSize:'0.6rem',fontWeight:700,color:p.dir.startsWith('UART')?'#8fff00':'#38bdf8',minWidth:64,paddingTop:1,whiteSpace:'nowrap'}}>{p.dir}</div>
                <div>
                  <div style={{...S.mono,fontSize:'0.62rem',color:'#ffb347',marginBottom:2,wordBreak:'break-all'}}>{p.hex}</div>
                  <div style={{fontSize:'0.64rem',color:'#5a6b8a'}}>{p.decoded}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:'8px 16px',borderTop:'1px solid #131e35',textAlign:'center'}}>
            <Link to="/telemetry" style={{...S.mono,fontSize:'0.62rem',color:'#38bdf8',textDecoration:'none'}}>View full protocol console →</Link>
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        {/* Unit details */}
        <div style={{...S.card,padding:'18px'}}>
          <div style={S.label}>Unit Details</div>
          {[['Model','HY-CKX1'],['Device No',bin.deviceNo],['IMEI',bin.imei],['Material','#304 SS, powder-coated'],
            ['Dimensions','650×700×1400 mm'],['Compaction','7 kN · 8:1 ratio'],
            ['Power','2×12V 20Ah + PV solar'],['Connectivity','4G/LTE modem'],
            ['Installed','14 Mar 2025'],['Last Service','28 Apr 2026']].map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #06090f'}}>
              <span style={{fontSize:'0.72rem',color:'#5a6b8a'}}>{k}</span>
              <span style={{...S.mono,fontSize:'0.72rem',color:'#f0f4ff',textAlign:'right',maxWidth:'55%'}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{...S.card,padding:'18px'}}>
          <div style={S.label}>Quick Actions</div>
          {[['Request collection','#8fff00','#05080f'],['Log maintenance','transparent','#f0f4ff'],['Raise fault ticket','transparent','#ff3b55'],['Acknowledge alerts','transparent','#f0f4ff'],['Download service report','transparent','#f0f4ff']].map(([label,bg,col])=>(
            <button key={label} style={{width:'100%',background:bg,border:`1px solid ${bg==='transparent'?'#1a2840':bg}`,color:col,
              fontSize:'0.78rem',fontWeight:bg==='transparent'?500:700,fontFamily:'Figtree,sans-serif',
              padding:'10px 14px',borderRadius:7,cursor:'pointer',marginBottom:7,textAlign:'left',transition:'all 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#8fff00';if(bg==='transparent')e.currentTarget.style.color='#8fff00'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=bg==='transparent'?'#1a2840':bg;e.currentTarget.style.color=col}}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
