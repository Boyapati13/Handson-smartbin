import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BINS, fillColor } from '../data/bins'
import FillBar from '../components/FillBar'
import StatusBadge from '../components/StatusBadge'
import ArcGauge from '../components/ArcGauge'

const S = { card: { background:'#0b1120',border:'1px solid #131e35',borderRadius:10 }, mono:{fontFamily:'IBM Plex Mono,monospace'} }

export default function Bins() {
  const [q,setQ]=useState('')
  const [filter,setFilter]=useState('all')
  const [view,setView]=useState('grid')
  const filtered = BINS.filter(b => {
    const mq = b.name.toLowerCase().includes(q.toLowerCase()) || b.id.toLowerCase().includes(q.toLowerCase()) || b.area.toLowerCase().includes(q.toLowerCase())
    const ms = filter==='all' || b.status===filter
    return mq && ms
  })
  return (
    <div style={{padding:'28px 32px',animation:'slideUp 0.35s ease both'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'1.7rem',fontWeight:700,color:'#f0f4ff',letterSpacing:'-0.02em',marginBottom:4}}>Bin Fleet</h1>
          <div style={{...S.mono,fontSize:'0.7rem',color:'#5a6b8a'}}>{BINS.length} units deployed · Malta</div>
        </div>
        <div style={{display:'flex',gap:4,background:'#0f1729',borderRadius:8,padding:3,border:'1px solid #131e35'}}>
          {['grid','list'].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{padding:'6px 14px',borderRadius:6,border:'none',cursor:'pointer',fontSize:'0.75rem',
              fontFamily:'Figtree,sans-serif',fontWeight:500,background:view===v?'#0b1120':'transparent',color:view===v?'#f0f4ff':'#5a6b8a',transition:'all 0.15s'}}>
              {v==='grid'?'Grid':'List'}
            </button>
          ))}
        </div>
      </div>

      <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search ID, name or area…"
          style={{background:'#0b1120',border:'1px solid #131e35',borderRadius:8,padding:'9px 14px',color:'#f0f4ff',fontSize:'0.82rem',outline:'none',flex:'1 1 240px'}} />
        <div style={{display:'flex',gap:5}}>
          {['all','online','full','warning','fault','offline'].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{fontSize:'0.68rem',fontWeight:600,padding:'7px 12px',borderRadius:6,border:'1px solid',cursor:'pointer',
              fontFamily:'IBM Plex Mono,monospace',transition:'all 0.15s',
              background:filter===s?'#8fff00':'transparent',color:filter===s?'#05080f':'#5a6b8a',borderColor:filter===s?'#8fff00':'#1a2840'}}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {view==='grid'?(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(255px,1fr))',gap:12}}>
          {filtered.map(b=>(
            <Link key={b.id} to={`/fleet/${b.id}`} style={{textDecoration:'none'}}>
              <div style={{...S.card,padding:'18px',transition:'all 0.2s',position:'relative',overflow:'hidden'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#1a2840';e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#131e35';e.currentTarget.style.transform='none'}}>
                <div style={{position:'absolute',top:0,right:0,width:80,height:80,background:`radial-gradient(circle at top right,${fillColor(b.fill)}08 0%,transparent 70%)`}}/>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                  <div>
                    <div style={{...S.mono,fontSize:'0.68rem',color:'#8fff00',fontWeight:600,marginBottom:3}}>{b.id}</div>
                    <div style={{fontSize:'0.9rem',fontWeight:600,color:'#f0f4ff',marginBottom:2}}>{b.name}</div>
                    <div style={{fontSize:'0.7rem',color:'#5a6b8a'}}>{b.area}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
                    <StatusBadge status={b.status}/>
                    <ArcGauge pct={b.fill} size={52} stroke={5}/>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,paddingTop:12,borderTop:'1px solid #131e35'}}>
                  {[['BATTERY',`${b.battery}%`,b.battery<20],['CYCLES',b.cycles,false],['SIGNAL',`${b.signal}/4`,b.signal<2]].map(([l,v,warn])=>(
                    <div key={l}>
                      <div style={{fontSize:'0.58rem',color:'#3a4a64',...S.mono,marginBottom:2}}>{l}</div>
                      <div style={{fontSize:'0.78rem',...S.mono,fontWeight:500,color:warn?'#ff3b55':'#5a6b8a'}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:10,...S.mono,fontSize:'0.58rem',color:'#3a4a64'}}>
                  DEV {b.deviceNo} · IMEI {b.imei.slice(-6)}
                </div>
              </div>
            </Link>
          ))}
          {filtered.length===0&&<div style={{gridColumn:'1/-1',textAlign:'center',padding:60,color:'#3a4a64',fontSize:'0.85rem'}}>No bins match filters.</div>}
        </div>
      ):(
        <div style={{...S.card,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.8rem'}}>
            <thead>
              <tr style={{borderBottom:'1px solid #131e35'}}>
                {['Unit','Name','Area','Status','Fill','Battery','Cycles','Device No',''].map(h=>(
                  <th key={h} style={{padding:'10px 14px',textAlign:'left',color:'#3a4a64',fontWeight:600,fontSize:'0.62rem',letterSpacing:'0.06em',textTransform:'uppercase',...S.mono,whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b=>(
                <tr key={b.id} style={{borderBottom:'1px solid #06090e',cursor:'pointer'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#0f1729'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  onClick={()=>window.location.href=`/fleet/${b.id}`}>
                  <td style={{padding:'10px 14px',...S.mono,color:'#8fff00',fontWeight:600,fontSize:'0.72rem'}}>{b.id}</td>
                  <td style={{padding:'10px 14px',color:'#f0f4ff',fontWeight:500}}>{b.name}</td>
                  <td style={{padding:'10px 14px',color:'#5a6b8a',...S.mono,fontSize:'0.72rem'}}>{b.area}</td>
                  <td style={{padding:'10px 14px'}}><StatusBadge status={b.status}/></td>
                  <td style={{padding:'10px 14px',minWidth:120}}><FillBar pct={b.fill} showLabel /></td>
                  <td style={{padding:'10px 14px',...S.mono,fontSize:'0.72rem',color:b.battery<20?'#ff3b55':'#5a6b8a'}}>{b.battery}%</td>
                  <td style={{padding:'10px 14px',...S.mono,fontSize:'0.72rem',color:'#5a6b8a'}}>{b.cycles}</td>
                  <td style={{padding:'10px 14px',...S.mono,fontSize:'0.65rem',color:'#3a4a64'}}>{b.deviceNo}</td>
                  <td style={{padding:'10px 14px',color:'#5a6b8a',fontSize:'0.8rem'}}>→</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
