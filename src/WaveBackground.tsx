import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const WAVES = [
  { fill: '#6b0020', opacity: 1.0, speed: 22, baseY: 0.96, amp: 0.62, pulseFreq: 0.31, blur: 12 },
  { fill: '#c01030', opacity: 0.90, speed: 16, baseY: 0.88, amp: 0.20, pulseFreq: 0.47, blur: 22 },
  { fill: '#e8204a', opacity: 0.85, speed: 12, baseY: 0.82, amp: 0.56, pulseFreq: 0.59, blur: 36 },
  { fill: '#d02080', opacity: 0.80, speed: 18, baseY: 0.76, amp: 0.74, pulseFreq: 0.38, blur: 48 },
  { fill: '#a015a0', opacity: 0.70, speed: 14, baseY: 0.71, amp: 0.66, pulseFreq: 0.53, blur: 58 },
  { fill: '#6010b0', opacity: 0.55, speed: 25, baseY: 0.67, amp: 0.21, pulseFreq: 0.42, blur: 70 },
]

// Compound sine for "beat" pulsing
function soundAmp(t: number, freq: number, base: number) {
  const a = Math.sin(t * freq * Math.PI * 2)
  const b = Math.sin(t * freq * 1.618 * Math.PI * 2) * 0.5
  const c = Math.sin(t * freq * 2.414 * Math.PI * 2) * 0.25
  return base * (0.55 + 0.75 * Math.abs((a + b + c) / 1.75) + 0.2)
}

function buildPath(t: number, wave: typeof WAVES[0], W: number, H: number) {
  const drift = -((t / wave.speed) % 1) * W * 2
  // More segments = narrower, denser peaks like an audio waveform
  const segments = 57
  const segW = (W * 2) / segments
  const curAmp = soundAmp(t, wave.pulseFreq, wave.amp)

  const pts: { x: number; y: number }[] = []
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const x = i * segW + drift
    const y = (wave.baseY + Math.sin(angle + t / (wave.speed * 0.5) * Math.PI * 2) * curAmp) * H
    pts.push({ x, y })
  }

  let d = `M ${pts[0].x},${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    // Tighter bezier handles = sharper, narrower crests
    const cp = segW * 0.32
    d += ` C ${pts[i].x + cp},${pts[i].y} ${pts[i + 1].x - cp},${pts[i + 1].y} ${pts[i + 1].x},${pts[i + 1].y}`
  }
  d += ` L ${pts[pts.length - 1].x},${H + 50} L ${pts[0].x},${H + 50} Z`
  return d
}

export default function WaveBackground() {
  const pathRefs = useRef<(SVGPathElement | null)[]>([])

  useEffect(() => {
    const ticker = gsap.ticker.add((time) => {
      const W = window.innerWidth
      const H = window.innerHeight
      WAVES.forEach((wave, i) => {
        pathRefs.current[i]?.setAttribute('d', buildPath(time, wave, W, H))
      })
    })
    return () => { gsap.ticker.remove(ticker) }
  }, [])

  return (
    <>
      {/* SVG wave layers — each in its own element to avoid mask/filter conflicts */}
      {WAVES.map((wave, i) => (
        <svg
          key={i}
          style={{
            position: 'fixed',
            inset: 0,
            width: '100%',
            height: '160%',
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
          preserveAspectRatio="none"
        >
          <defs>
            <filter id={`wblur${i}`} x="-30%" y="-60%" width="160%" height="220%">
              <feGaussianBlur stdDeviation={wave.blur} />
            </filter>
          </defs>
          <path
            ref={(el) => { pathRefs.current[i] = el }}
            fill={wave.fill}
            fillOpacity={wave.opacity}
            filter={`url(#wblur${i})`}
          />
        </svg>
      ))}

      {/* Noise grain overlay */}
      <svg
        style={{ position: 'fixed', inset: 0, width: '100%', height: '150%', zIndex: 1, pointerEvents: 'none', opacity: 0.08 }}
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="overlay" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#grain)" fill="white" />
      </svg>

      {/* Top fade: blend waves into the dark background — pure CSS, never fails */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(to bottom, #09090f 0%, #09090f 30%, transparent 55%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}
