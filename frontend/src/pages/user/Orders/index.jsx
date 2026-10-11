import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlass, Receipt } from '@phosphor-icons/react'
import { useAsync } from '../../../hooks/useAsync'
import { accountService } from '../../../services/accountService'
import { formatCurrency, formatDateTime } from '../../../utils/format'
import StatusBadge from '../../../components/user/orders/StatusBadge'
import { ORDER_STATUSES } from '../../../components/user/orders/orderStatus'
import EmptyState from '../../../components/user/shopping/EmptyState'
import PageTitle from '../../../components/user/shopping/PageTitle'
import Pagination from '../../../components/user/shopping/Pagination'

const FILTERS = [['', 'Tất cả'], ...ORDER_STATUSES]

export default function OrdersPage() {
  const [status, setStatus] = useState('')
  const [term, setTerm] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const { data, loading, error } = useAsync(() => accountService.orders({ status, q, page, per_page: 5 }), [status, q, page])
  const orders = data?.data ?? []
  const meta = data?.meta
  const filtering = Boolean(status || q)

  return <div className="flex flex-col gap-8">
    <PageTitle title="Đơn hàng của tôi" description="Theo dõi trạng thái và lịch sử mua hàng của bạn." />
    <div className="flex flex-col gap-4">
      <form className="flex gap-3" role="search" onSubmit={event => { event.preventDefault(); setQ(term.trim()); setPage(1) }}>
        <div className="relative flex min-w-0 flex-1 items-center rounded-[10px] bg-[#f4f4f4] px-3.5">
          <MagnifyingGlass size={18} aria-hidden="true" className="shrink-0 text-[#777]" />
          <input type="search" aria-label="Tìm theo mã đơn hàng" placeholder="Tìm theo mã đơn hàng" value={term} onChange={event => setTerm(event.target.value)} className="h-11 w-full border-0 bg-transparent px-2.5 outline-none" />
        </div>
        <button type="submit" className="rounded-[10px] border border-black px-5 text-sm hover:bg-black hover:text-white">Tìm</button>
      </form>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 tablet:mx-0 tablet:flex-wrap tablet:px-0" role="group" aria-label="Lọc theo trạng thái">
        {FILTERS.map(([value, label]) => <button key={value} type="button" aria-pressed={status === value} onClick={() => { setStatus(value); setPage(1) }} className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors duration-200 ease-[ease] motion-reduce:transition-none ${status === value ? 'border-black bg-black text-white' : 'border-[#ddd] hover:bg-[#f4f4f4]'}`}>{label}</button>)}
      </div>
    </div>
    {loading && <p className="py-10 text-center text-[#666]" role="status">Đang tải đơn hàng...</p>}
    {error && <p className="py-10 text-center text-red-700" role="alert">{error.message}</p>}
    {!loading && !error && (orders.length === 0
      ? (filtering
        ? <p className="rounded-xl bg-[#f4f4f4] px-6 py-10 text-center text-[#555]" role="status">Không có đơn hàng phù hợp với bộ lọc.</p>
        : <EmptyState icon={Receipt} title="Chưa có đơn hàng" text="Khi bạn đặt hàng, đơn sẽ xuất hiện ở đây để theo dõi." />)
      : <>
        <ul className="flex flex-col gap-4">
          {orders.map(order => <li key={order.code} className="flex flex-col gap-4 rounded-xl border border-[#f1f1f1] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-medium">{order.code}</p><p className="text-sm text-[#666]">{formatDateTime(order.created_at)}</p></div>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-2" aria-label="Ảnh sản phẩm trong đơn">
              {order.items.slice(0, 4).map(item => item.image_url && <img key={item.id} className="size-14 rounded-lg bg-[#f4f4f4] object-cover" src={item.image_url} alt={item.product_name} width="56" height="56" loading="lazy" />)}
              {order.items.length > 4 && <span className="text-sm text-[#666]">+{order.items.length - 4}</span>}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f1f1f1] pt-4">
              <p>{order.items_count} sản phẩm · <strong>{formatCurrency(order.total)}</strong></p>
              <Link to={`/orders/${order.code}`} className="rounded-full border border-black px-5 py-2 text-sm transition-colors duration-200 ease-[ease] hover:bg-black hover:text-white motion-reduce:transition-none">Xem chi tiết</Link>
            </div>
          </li>)}
        </ul>
        <Pagination page={meta?.current_page ?? 1} pageCount={meta?.last_page ?? 1} onChange={setPage} />
      </>)}
  </div>
}
