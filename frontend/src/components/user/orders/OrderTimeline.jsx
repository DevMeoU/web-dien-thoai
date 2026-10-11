import { ORDER_FLOW } from './orderStatus'

export default function OrderTimeline({ status }) {
  if (status === 'cancelled') return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Đơn hàng này đã bị hủy.</p>
  const current = ORDER_FLOW.findIndex(([value]) => value === status)
  return <ol className="grid grid-cols-4 gap-2" aria-label="Tiến trình đơn hàng">
    {ORDER_FLOW.map(([value, label], index) => <li key={value} className="flex flex-col gap-2" aria-current={index === current ? 'step' : undefined}>
      <span className={`h-1 rounded-full ${index <= current ? 'bg-black' : 'bg-[#e6e6e6]'}`} />
      <span className={`text-[13px] leading-[1.3] tablet:text-sm ${index <= current ? 'font-medium' : 'text-[#888]'}`}>{label}</span>
    </li>)}
  </ol>
}
