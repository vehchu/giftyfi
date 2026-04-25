import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface GiftAnimationProps {
  onComplete: () => void;
}

const CONFETTI_COLORS = ['#fb7185', '#c084fc', '#818cf8', '#34d399', '#fcd34d', '#e879f9']
const CONFETTI = Array.from({ length: 40 }).map((_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  shape: i % 2 === 0 ? 'rounded-full' : 'rounded-sm'
}))

export default function GiftAnimation({ onComplete }: GiftAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLImageElement>(null)
  const bottomRef = useRef<HTMLImageElement>(null)
  const confettiRefs = useRef<(HTMLDivElement | null)[]>([])

  // Expose timeline to React's lifecycle to fully prevent memory recreation leaks
  const tl = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initialize timeline explicitly into the ref
      tl.current = gsap.timeline({ onComplete })

      // 1. Initial pause for dramatic effect
      tl.current.set({}, {}, "+=0.3")

      // 2. Subtle independent pre-open rattle
      tl.current.to(topRef.current, {
        rotation: 4,
        x: 6,
        y: -2,
        yoyo: true,
        repeat: 2,
        duration: 0.1,
        ease: 'power1.inOut'
      })

      tl.current.to(bottomRef.current, {
        rotation: -2,
        x: -2,
        yoyo: true,
        repeat: 2,
        duration: 0.1,
        ease: 'power1.inOut'
      }, "<") // Start exact same time as top lid rattle

      // Snap both flawlessly back to 0 so they aren't crooked before opening
      tl.current.to([topRef.current, bottomRef.current], {
        rotation: 0,
        x: 0,
        y: 0,
        duration: 0.1
      }, ">")

      // 3. Pop the lid off (smooth sweep upwards, no rubber-banding)
      tl.current.to(topRef.current, {
        y: -150,
        rotation: 25,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out'
      }, ">")

      // 3.5. Fire confetti explosion exactly as the lid pops!
      const validConfetti = confettiRefs.current.filter(Boolean)
      if (validConfetti.length > 0) {
        tl.current.to(validConfetti, {
          y: () => gsap.utils.random(-400, -100),   // Fly aggressively upwards
          x: () => gsap.utils.random(-250, 250),    // Spread out wide horizontally
          rotation: () => gsap.utils.random(-720, 720), // Spin frantically
          opacity: 0,
          scale: () => gsap.utils.random(0.5, 1.8),
          duration: () => gsap.utils.random(0.8, 1.5),
          ease: 'power3.out'
        }, "<") // Start at the EXACT same time as the lid popping animation
      }

      tl.current.to(bottomRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out'
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen overflow-hidden">
      {/* Container holding both parts of the gift */}
      <div
        ref={containerRef}
        className="relative w-64 h-64 flex items-center justify-center"
      >
        {/* Confetti Explosion Particles (Behind everything) */}
        {CONFETTI.map((c, i) => (
          <div
            key={c.id}
            ref={el => confettiRefs.current[i] = el}
            className={`absolute w-3 h-3 z-0 ${c.shape}`}
            style={{ backgroundColor: c.color, top: '50%', left: '50%' }}
          />
        ))}

        {/* Bottom Box */}
        <img
          ref={bottomRef}
          src="/gBottom.svg"
          alt="Gift Box"
          className="absolute bottom-8 w-3/4 object-contain z-10"
        />

        {/* Top Lid */}
        <img
          ref={topRef}
          src="/gTop.svg"
          alt="Gift Lid"
          className="absolute top-0 w-[85%] z-20 object-contain" />
      </div>
    </div>
  )
}
