import { Link } from 'react-router-dom'

export default function RollingLink({ to, children, onClick }) {
  const textClass = 'block transition-transform duration-300 ease-[ease] group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none'
  return <Link to={to} onClick={onClick} className="group block h-[22.4px] overflow-hidden">
    <span className={textClass}>{children}</span><span className={textClass} aria-hidden="true">{children}</span>
  </Link>
}
