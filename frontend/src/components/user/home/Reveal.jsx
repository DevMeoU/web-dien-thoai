import { motion, useReducedMotion } from 'motion/react'

export default function Reveal({ children, className = '', delay = 0, ...props }) {
  const reduceMotion = useReducedMotion()
  return <motion.div
    className={className}
    initial={reduceMotion ? false : { opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.08 }}
    transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
    {...props}
  >{children}</motion.div>
}
