/**
 * HandsOn Systems — Official Logo (inline SVG React component)
 * Accurate recreation of: the pointing cursor hand + "handson" bold wordmark
 * Brand colour: #29ABE2
 *
 * Uses inline SVG so the app's loaded fonts (Syne/Figtree) apply correctly.
 */

const BLUE = '#29ABE2'

/** The pointing-hand cursor icon — matches the exact logo shape */
export function HandsOnIcon({ size = 36, color = BLUE }) {
  const s = size / 36   // scale factor
  return (
    <svg
      width={size}
      height={Math.round(size * 1.22)}
      viewBox="0 0 36 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* ── INDEX FINGER — main pointing element, horizontal ── */}
      <rect x="8"  y="0"  width="28" height="10" rx="5" fill={color}/>

      {/* ── MIDDLE FINGER — just below, slightly shorter ── */}
      <rect x="8"  y="11" width="22" height="9"  rx="4.5" fill={color}/>

      {/* ── RING FINGER ── */}
      <rect x="8"  y="21" width="17" height="8"  rx="4" fill={color}/>

      {/* ── PINKY ── */}
      <rect x="8"  y="30" width="12" height="7"  rx="3.5" fill={color}/>

      {/* ── PALM / WRIST — left column connecting all fingers ── */}
      <rect x="0"  y="3"  width="14" height="38" rx="6"  fill={color}/>

      {/* ── THUMB — lower-right of palm ── */}
      <ellipse cx="25" cy="38" rx="5" ry="6" fill={color}/>

      {/* ── Fill gap between palm and fingers ── */}
      <rect x="8" y="3" width="6" height="35" fill={color}/>
    </svg>
  )
}

/** Full horizontal logo: icon + "handson" wordmark */
export function HandsOnLogo({ height = 34, color = BLUE, subColor = '#64748b', showSub = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, lineHeight: 1 }}>
      <HandsOnIcon size={Math.round(height * 1.1)} color={color} />
      <div>
        <div style={{
          fontFamily: "'Nunito', 'Figtree', 'Syne', 'Arial Rounded MT Bold', sans-serif",
          fontWeight: 900,
          fontSize:   height,
          color:      color,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          whiteSpace: 'nowrap',
        }}>
          handson
        </div>
        {showSub && (
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            fontSize:   Math.round(height * 0.32),
            color:      subColor,
            letterSpacing: '0.1em',
            lineHeight: 1.3,
            marginTop:  3,
          }}>
            SYSTEMS
          </div>
        )}
      </div>
    </div>
  )
}

/** Compact badge: icon + "handson" + sub-line, used in sidebar */
export function HandsOnBadge({ iconSize = 30, color = BLUE, subColor = '#64748b' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <HandsOnIcon size={iconSize} color={color} />
      <div>
        <div style={{
          fontFamily: "'Nunito', 'Figtree', 'Syne', 'Arial Rounded MT Bold', sans-serif",
          fontWeight: 900,
          fontSize:   Math.round(iconSize * 0.82),
          color:      color,
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}>
          handson
        </div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize:   Math.round(iconSize * 0.28),
          color:      subColor,
          letterSpacing: '0.12em',
          lineHeight: 1.4,
          marginTop:  2,
        }}>
          SMARTBIN · OPS
        </div>
      </div>
    </div>
  )
}

export default HandsOnLogo
