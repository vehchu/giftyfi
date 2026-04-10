import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(MotionPathPlugin)

interface GiftAnimationProps {
  onComplete: () => void;
}

export default function GiftAnimation({ onComplete }: GiftAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLImageElement>(null)
  const bottomRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    // You can fully customize this timeline right here!
    const tl = gsap.timeline({ onComplete })

    // 1. Initial pause for dramatic effect
    tl.set({}, {}, "+=0.3")

    // 2. Shake / Wobble the box before opening
    tl.to(containerRef.current, {
      rotation: 5,
      yoyo: true,
      repeat: 5,
      duration: 0.08,
      ease: 'power1.inOut'
    })
    
    // Set rotation back to 0 just to be clean
    tl.to(containerRef.current, { rotation: 0, duration: 0.05 })

    // 3. Pop the lid off (lifts up and rotates out of view)
    tl.to(topRef.current, {
      y: -150,
      rotation: 25,
      opacity: 0,
      duration: 0.7,
      ease: 'back.out(1.5)'
    }, "+=0.2")

    // 4. Fade out the bottom of the box
    tl.to(bottomRef.current, {
      scale: 0.7,
      opacity: 0,
      y: 20,
      duration: 0.4,
      ease: 'power2.in'
    }, "-=0.3")

  }, [onComplete])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#09090f]">
      {/* Container holding both parts of the gift */}
      <div 
        ref={containerRef} 
        className="relative w-64 h-64 flex items-center justify-center"
      >
        {/* Bottom Box */}
        <img 
          ref={bottomRef}
          src="/media/gBottom.svg" 
          alt="Gift Box" 
          className="absolute bottom-8 w-3/4 object-contain origin-bottom"
        />
        
        {/* Top Lid */}
        <img 
          ref={topRef}
          src="/media/gTop.svg" 
          alt="Gift Lid" 
          className="absolute top-4 w-[85%] z-10 object-contain origin-center"
        />
      </div>
    </div>
  )
}
