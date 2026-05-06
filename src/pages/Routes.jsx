import { useState } from 'react'
import { BINS, fillColor } from '../data/bins'
import FillBar from '../components/FillBar'
import StatusBadge from '../components/StatusBadge'

const S = { card:{background:'#0b1120',border:'1px solid #131e35',borderRadius:10}, mono:{fontFamily:'IBM Plex Mono,monospace'}, label:{fontSize:'0.62rem',fontFamily:'IBM Plex Mono,monospace',color:'#3a4a64',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:6} }

export default function Routes() {
  const [threshold, setThreshold] = useState(80)
  const sorted = [...BINS].filter(b => b.fill >= threshold && b.status !== 'offline').sort((a,b) => b.fill - a.fill)

  return (
    <div style={{padding:'28px 32px',animation:'slideUp 0.35s ease both'}}>
      <div style={{marginBottom:24}}>
        <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'1.7rem',fontWeight:700,color:'#f0f4ff',letterSpacing:'-0.02em',marginBottom:4}}>Route Planner</h1>
        <div style={{...S.mono,fontSize:'0.7rem',color:'#5a6b8a'}}>Dynamic collection routing · live fill data</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:16,marginBottom:24,alignItems:'stretch'}}>
        <div style={{...S.card,padding:'22px 24px'}}>
          <div style={S.label}>Fill threshold — collect above</div>
          <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:18}}>
            <input type="range" min={50} max={95} value={threshold} onChange={e=>setThreshold(+e.target.value)} style={{flex:1,accentColor:'#8fff00'}}/>
            <span style={{...S.mono,fontSize:'1.6rem',fontWeight:600,color:'#8fff00',minWidth:56}}>{threshold}%</span>
          </div>
          <div style={{display:'flex',gap:28,flexWrap:'wrap'}}>
            {[['Bins to collect',sorted.length,'#8fff00'],['Est. savings','~28%','#38bdf8'],['Route type','AUTO','#5a6b8a']].map(([l,v,c])=>(
              <div key={l}>
                <div style={S.label}>{l}</div>
                <div style={{...S.mono,fontSize:'1.4rem',fontWeight:600,color:c}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <button style={{background:'#8fff00',color:'#05080f',fontWeight:700,fontSize:'0.85rem',fontFamily:'Figtree,sans-serif',
          padding:'0 28px',borderRadius:10,border:'none',cursor:'pointer',whiteSpace:'nowrap',boxShadow:'0 0 24px rgba(143,255,0,0.25)'}}>
          Dispatch Route
        </button>
      </div>

      {sorted.length === 0 ? (
        <div style={{textAlign:'center',padding:'60px',color:'#5a6b8a',fontSize:'0.85rem'}}>No bins above {threshold}% — fleet is clear.</div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {sorted.map((b,i) => (
            <div key={b.id} style={{...S.card,padding:'16px 20px',display:'flex',alignItems:'center',gap:16,
              transition:'border-color 0.2s'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#1a2840'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#131e35'}>
              <div style={{...S.mono,fontSize:'1.6rem',fontWeight:700,color:'#1a2840',minWidth:40,textAlign:'center',lineHeight:1}}>{String(i+1).padStart(2,'0')}</div>
              <div style={{width:1,height:36,background:'#131e35'}}/>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8,flexWrap:'wrap',gap:6}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{...S.mono,fontSize:'0.7rem',color:'#8fff00',fontWeight:600}}>{b.id}</span>
                    <span style={{fontSize:'0.9rem',fontWeight:600,color:'#f0f4ff'}}>{b.name}</span>
                    <span style={{fontSize:'0.72rem',color:'#5a6b8a'}}>· {b.area}</span>
                  </div>
                  <StatusBadge status={b.status}/>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{flex:1,background:'#1a2840',borderRadius:9999,height:6,overflow:'hidden'}}>
                    <div style={{width:`${b.fill}%`,height:'100%',background:fillColor(b.fill),borderRadius:9999,boxShadow:`0 0 8px ${fillColor(b.fill)}60`}}/>
                  </div>
                  <span style={{...S.mono,fontSize:'0.72rem',color:fillColor(b.fill),minWidth:32,textAlign:'right',fontWeight:600}}>{b.fill}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {sorted.length > 0 && (
        <div style={{...S.card,padding:'14px 20px',marginTop:14}}>
          <div style={{display:'flex',gap:28,flexWrap:'wrap',fontSize:'0.8rem'}}>
            <div><span style={{color:'#5a6b8a'}}>Total stops: </span><span style={{color:'#8fff00',...S.mono,fontWeight:600}}>{sorted.length}</span></div>
            <div><span style={{color:'#5a6b8a'}}>Priority unit: </span><span style={{color:'#8fff00',...S.mono,fontWeight:600}}>{sorted[0]?.name}</span></div>
            <div><span style={{color:'#5a6b8a'}}>Efficiency gain: </span><span style={{color:'#38bdf8',...S.mono,fontWeight:600}}>~28% vs fixed schedule</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
