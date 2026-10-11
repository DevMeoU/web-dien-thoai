import { statusLabel, statusStyle } from './orderStatus'

export default function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-[13px] leading-[1.4] font-medium ${statusStyle[status] ?? 'bg-[#f4f4f4]'}`}>{statusLabel(status)}</span>
}
