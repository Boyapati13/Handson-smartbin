/**
 * HandsOn — Official brand logo using the uploaded PNG.
 * File: public/handson_logo.png
 */

const LOGO = '/handson_logo.png'

export function HandsOnIcon({ size = 40 }) {
  return (
    <img
      src={LOGO}
      alt="HandsOn"
      height={size}
      style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }}
      draggable={false}
    />
  )
}

export function HandsOnLogo({ height = 36 }) {
  return (
    <img
      src={LOGO}
      alt="HandsOn"
      height={height}
      style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }}
      draggable={false}
    />
  )
}

export function HandsOnBadge({ iconSize = 30 }) {
  return (
    <img
      src={LOGO}
      alt="HandsOn"
      height={Math.round(iconSize * 0.85)}
      style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }}
      draggable={false}
    />
  )
}

export default HandsOnLogo
