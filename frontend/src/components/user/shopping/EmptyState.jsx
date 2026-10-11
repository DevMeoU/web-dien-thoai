import { Link } from 'react-router-dom'
import { submitClass } from '../form/formStyles'

export default function EmptyState({ icon: Icon, title, text, to = '/products', action = 'Khám phá sản phẩm' }) {
  return <div className="flex flex-col items-center gap-4 rounded-xl bg-[#f4f4f4] px-6 py-16 text-center">
    <Icon size={40} aria-hidden="true" />
    <h2 className="text-xl font-medium">{title}</h2>
    <p className="max-w-[420px] text-[#555]">{text}</p>
    <Link to={to} className={`${submitClass} mt-2 inline-flex`}>{action}</Link>
  </div>
}
