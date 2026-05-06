import { Link } from 'react-router-dom'
import { ALERTS, BINS } from '../data/bins'

const S = { card:{background:'#0b1120',border:'1px solid #131e35',borderRadius:10}, mono:{fontFamily:'IBM Plex Mono,monospace'}, label:{fontSize:'0.62rem',fontFamily:'IBM Plex Mono,monospace',color:'#3a4a64',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:6} }

export default function Alerts() {
  return (
    <div style={{padding:'28px 32px',animation:'slideUp 0.35s ease both'}}>
      <div style={{marginBottom:24}}>
        <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'1.7rem',fontWeight:700,color:'#f0f4ff',letterSpacing:'-0.02em',marginBottom:4}}>Alerts</h1>
        <div style={{...S.mono,fontSize:'0.7rem',color:'#5a6b8a'}}>
          {ALERTS.filter(a=>a.sev==='crit').length} critical · {ALERTS.filter(a=>a.sev==='warn').length} warnings · live
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
        {ALERTS.map(a => {
          const sevColor = a.sev==='crit'?'#ff3b55':'#ffb347'
          return (
            <div key={a.id} style={{...S.card,overflow:'hidden'}}>
              <div style={{display:'flex'}}>
                <div style={{width:3,background:sevColor,flexShrink:0}}/>
                <div style={{flex:1,padding:'18px 20px',display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                      <span style={{...S.mono,fontSize:'0.65rem',fontWeight:700,color:sevColor,background:`${sevColor}14`,border:`1px solid ${sevColor}30`,padding:'2px 8px',borderRadius:4}}>{a.type}</span>
                      <span style={{...S.mono,fontSize:'0.62rem',color:'#5a6b8a'}}>{a.bin}</span>
                      <span style={{...S.mono,fontSize:'0.62rem',color:'#3a4a64'}}>· {a.age} ago</span>
                    </div>
                    <div style={{fontSize:'0.95rem',fontWeight:600,color:'#f0f4ff',marginBottom:4}}>{a.name}</div>
                    <div style={{fontSize:'0.8rem',color:'#5a6b8a',marginBottom:a.hex?6:0}}>{a.msg}</div>
                    {a.hex && <div style={{...S.mono,fontSize:'0.62rem',color:'#3a4a64',background:'#06090f',borderRadius:4,padding:'4px 8px',display:'inline-block'}}>{a.hex}</div>}
                  </div>
                  <div style={{display:'flex',gap:8,flexShrink:0}}>
                    <button style={{background:'transparent',border:'1px solid #1a2840',color:'#5a6b8a',fontSize:'0.74rem',fontFamily:'Figtree,sans-serif',padding:'8px 14px',borderRadius:7,cursor:'pointer'}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='#8fff00';e.currentTarget.style.color='#8fff00'}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='#1a2840';e.currentTarget.style.color='#5a6b8a'}}>
                      Acknowledge
                    </button>
                    <Link to={`/fleet/${a.bin}`} style={{background:sevColor,color:'#fff',border:'none',fontSize:'0.74rem',fontWeight:600,fontFamily:'Figtree,sans-serif',padding:'8px 14px',borderRadius:7,cursor:'pointer',textDecoration:'none',display:'inline-flex',alignItems:'center'}}>
                      View Unit →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
        {[['Mean Response','4.2 min','last 30 days'],['Resolved Today','11','of 15 raised'],['MTTR','18 min','mean time to resolve']].map(([l,v,n])=>(
          <div key={l} style={{...S.card,padding:'16px 18px',textAlign:'center'}}>
            <div style={S.label}>{l}</div>
            <div style={{...S.mono,fontSize:'1.6rem',fontWeight:600,color:'#8fff00',lineHeight:1,marginBottom:4}}>{v}</div>
            <div style={{fontSize:'0.68rem',color:'#3a4a64'}}>{n}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
