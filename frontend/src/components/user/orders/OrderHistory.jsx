import { formatDateTime } from '../../../utils/format'
import { statusLabel } from './orderStatus'

/** Lịch sử cập nhật trạng thái của đơn hàng. */
export default function OrderHistory({ histories }) {
  if (!histories?.length) return null
  return <section aria-labelledby="order-history-title">
    <h3 id="order-history-title" className="mb-3 font-medium">Lịch sử cập nhật</h3>
    <ol className="flex flex-col gap-3 border-l border-[#e6e6e6] pl-4">
      {histories.map((history, index) => <li key={index} className="relative text-sm">
        <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full bg-black" aria-hidden="true" />
        <p className="font-medium">{history.from_status === history.to_status ? 'Cập nhật' : statusLabel(history.to_status)}{history.changed_by ? ` · ${history.changed_by}` : ''}</p>
        {history.note && <p className="text-[#555]">{history.note}</p>}
        <p className="text-xs text-[#888]">{formatDateTime(history.created_at)}</p>
      </li>)}
    </ol>
  </section>
}
