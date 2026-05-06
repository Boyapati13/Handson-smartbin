/**
 * HandsOn Systems official logo component.
 * Uses /handson-logo.svg (public folder) — exact brand colours #29ABE2.
 */

/** Full horizontal wordmark — used in sidebar */
export function HandsOnLogo({ height = 32 }) {
  return (
    <img
      src="/handson-logo.svg"
      alt="HandsOn Systems"
      height={height}
      style={{ display: 'block', objectFit: 'contain' }}
      draggable={false}
    />
  )
}

/** Icon-only mark — used in small spaces / favicon context */
export function HandsOnIcon({ size = 32, color = '#29ABE2' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 66 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="HandsOn Systems">
      {/* Palm */}
      <path d="M14 58 C14 52 18 48 24 48 L52 48 C58 48 62 52 62 58 L62 76 C62 84 56 88 48 88 L28 88 C20 88 14 84 14 78 Z" fill={color}/>
      {/* Index finger */}
      <rect x="28" y="10" width="10" height="44" rx="5" fill={color}/>
      {/* Middle finger */}
      <rect x="40" y="16" width="10" height="38" rx="5" fill={color}/>
      {/* Ring finger */}
      <rect x="16" y="22" width="10" height="32" rx="5" fill={color}/>
      {/* Pinky */}
      <rect x="4"  y="30" width="9"  height="26" rx="4.5" fill={color}/>
    </svg>
  )
}

/** Compact inline badge — icon + text, used in topbar / public page */
export function HandsOnBadge({ iconSize = 28, textColor = '#29ABE2', subColor = '#64748b' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <HandsOnIcon size={iconSize} color={textColor} />
      <div>
        <div style={{
          fontFamily: "'Nunito', 'Figtree', 'Syne', sans-serif",
          fontWeight: 900, fontSize: '1rem', color: textColor,
          lineHeight: 1, letterSpacing: '-0.02em',
        }}>handson</div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.55rem', color: subColor,
          letterSpacing: '0.12em', lineHeight: 1.3,
        }}>SMARTBIN · OPS</div>
      </div>
    </div>
  )
}

export default HandsOnLogo
