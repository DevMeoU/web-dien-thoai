import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import RollingLink from './RollingLink'

export default function MobileNavigation({ open, links, onNavigate }) {
  const reduceMotion = useReducedMotion()
  return <AnimatePresence>
    {open && <motion.nav id="mobile-navigation" aria-label="Điều hướng trên điện thoại" className="flex flex-col items-center gap-6 overflow-hidden pt-6 tablet:hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.3 }}>
      {links.map(([to, label]) => <RollingLink key={label} to={to} onClick={onNavigate}>{label}</RollingLink>)}
    </motion.nav>}
  </AnimatePresence>
}
