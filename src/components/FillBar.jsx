import { fillColor } from '../data/bins'

export default function FillBar({ pct, height = 6, showLabel = false, glow = false }) {
  const color = fillColor(pct)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
      <div style={{ background: 'var(--border)', borderRadius: 9999, height, flex: 1, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, background: color, height: '100%', borderRadius: 9999,
          transition: 'width 0.6s ease',
          boxShadow: glow && pct >= 70 ? `0 0 8px ${color}70` : 'none',
        }} />
      </div>
      {showLabel && (
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem', color, minWidth: 32, textAlign: 'right', fontWeight: 600 }}>
          {pct}%
        </span>
      )}
    </div>
  )
}
