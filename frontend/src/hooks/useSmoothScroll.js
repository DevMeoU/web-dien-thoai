import { useEffect } from 'react'
import { useReducedMotion } from 'motion/react'
import 'lenis/dist/lenis.css'

export default function useSmoothScroll(enabled) {
  const reduceMotion = useReducedMotion()
  useEffect(() => {
    if (!enabled || reduceMotion) return
    let lenis
    let disposed = false
    import('lenis').then(({ default: Lenis }) => {
      if (!disposed) lenis = new Lenis({ autoRaf: true, duration: 1.1, anchors: true })
    })
    return () => { disposed = true; lenis?.destroy() }
  }, [enabled, reduceMotion])
}
