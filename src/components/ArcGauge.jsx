import { fillColor } from '../data/bins'

export default function ArcGauge({ pct, size = 80, stroke = 7 }) {
  const r = 34, cx = 40, cy = 40
  const circ = 2 * Math.PI * r
  const arc = circ * 0.75
  const color = fillColor(pct)
  const rot = -225

  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a2840" strokeWidth={stroke}
        strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"
        transform={`rotate(${rot} ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${(pct / 100) * arc} ${circ}`} strokeLinecap="round"
        transform={`rotate(${rot} ${cx} ${cy})`}
        style={{ filter: `drop-shadow(0 0 5px ${color}80)`, transition: 'stroke-dasharray 0.8s ease' }} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="13" fontWeight="600" fontFamily="IBM Plex Mono, monospace">{pct}%</text>
    </svg>
  )
}
