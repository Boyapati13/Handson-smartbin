import { fillColor } from '../data/bins'

export default function FillBar({ pct, height = 6, showLabel = false }) {
  const color = fillColor(pct)
  return (
    <div className="flex items-center gap-2 w-full">
      <div style={{ background: '#162347', borderRadius: 9999, height, flex: 1, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 9999, transition: 'width 0.5s ease' }} />
      </div>
      {showLabel && (
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color, minWidth: '2.5rem', textAlign: 'right' }}>
          {pct}%
        </span>
      )}
    </div>
  )
}
