/**
 * HandsOn — Logo component using the official brand PNG.
 * Place the PNG at /public/handson-logo.png (transparent or white bg).
 */

const LOGO_SRC = '/handson-logo.png'

/** Full logo image — used in landing page header, footer, etc. */
export function HandsOnLogo({ height = 34 }) {
  return (
    <img
      src={LOGO_SRC}
      alt="HandsOn"
      height={height}
      style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }}
      draggable={false}
    />
  )
}

/** Compact badge — used in sidebar navbar */
export function HandsOnBadge({ iconSize = 30 }) {
  // Scale height proportionally: the logo PNG is roughly 3.6:1 width-to-height
  const h = Math.round(iconSize * 0.9)
  return (
    <img
      src={LOGO_SRC}
      alt="HandsOn"
      height={h}
      style={{ display: 'block', objectFit: 'contain', flexShrink: 0, maxWidth: h * 3.6 }}
      draggable={false}
    />
  )
}

/** Icon-only — fallback for very small sizes, uses the full logo scaled down */
export function HandsOnIcon({ size = 36 }) {
  return (
    <img
      src={LOGO_SRC}
      alt="HandsOn"
      height={size}
      style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }}
      draggable={false}
    />
  )
}

export default HandsOnLogo
