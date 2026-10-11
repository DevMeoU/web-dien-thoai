import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../utils/format'

/** Danh sách sản phẩm trong đơn hàng hoặc giỏ hàng, nhận dữ liệu đã chuẩn hóa: { key, name, image, meta, quantity, lineTotal, to }. */
export default function OrderItemsList({ items }) {
  return <ul className="divide-y divide-[#f1f1f1]" aria-label="Sản phẩm trong đơn hàng">
    {items.map(item => <li key={item.key} className="flex gap-4 py-4 first:pt-0 last:pb-0">
      <Link to={item.to} className="size-16 shrink-0 overflow-hidden rounded-lg bg-[#f4f4f4]" aria-label={`Xem ${item.name}`}>
        {item.image && <img className="block h-full w-full object-cover" src={item.image} alt="" width="1254" height="1254" loading="lazy" />}
      </Link>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{item.name}</p>
        <p className="mt-0.5 text-sm text-[#666]">{item.meta} × {item.quantity}</p>
      </div>
      <p className="font-bold">{formatCurrency(item.lineTotal)}</p>
    </li>)}
  </ul>
}
