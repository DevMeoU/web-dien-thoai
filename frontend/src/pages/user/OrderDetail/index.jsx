import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CaretRight, Receipt } from '@phosphor-icons/react'
import { useAsync } from '../../../hooks/useAsync'
import { accountService } from '../../../services/accountService'
import { formatDateTime } from '../../../utils/format'
import OrderHistory from '../../../components/user/orders/OrderHistory'
import OrderInfoBlocks from '../../../components/user/orders/OrderInfoBlocks'
import OrderItemsList from '../../../components/user/orders/OrderItemsList'
import { orderLineItems } from '../../../components/user/orders/orderItems'
import OrderTimeline from '../../../components/user/orders/OrderTimeline'
import OrderTotals from '../../../components/user/orders/OrderTotals'
import StatusBadge from '../../../components/user/orders/StatusBadge'
import { fieldClass } from '../../../components/user/form/formStyles'
import EmptyState from '../../../components/user/shopping/EmptyState'

export default function OrderDetailPage() {
  const { id: code } = useParams()
  const { data, loading, reload } = useAsync(() => accountService.order(code), [code])
  const [confirming, setConfirming] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const order = data?.data

  if (loading && !order) return <p className="py-16 text-center text-[#666]" role="status">Đang tải đơn hàng...</p>
  if (!order) return <EmptyState icon={Receipt} title="Không tìm thấy đơn hàng" text="Đơn hàng này không tồn tại hoặc không thuộc tài khoản của bạn." to="/orders" action="Xem đơn hàng của tôi" />

  async function cancel(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await accountService.cancelOrder(order.code, reason)
      setConfirming(false)
      setReason('')
      reload()
    } catch (failure) {
      setError(failure.field('reason') ?? failure.message)
    } finally {
      setBusy(false)
    }
  }

  return <div className="flex flex-col gap-8">
    <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm tablet:text-base">
      <Link to="/orders" className="hover:underline">Đơn hàng của tôi</Link><CaretRight aria-hidden="true" size={12} className="text-[#999]" />
      <span aria-current="page" className="text-[#777]">{order.code}</span>
    </nav>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-2.5">
        <h1 className="text-[28px] leading-[1.2] font-medium desktop:text-[34px]">Đơn hàng {order.code}</h1>
        <p>Đặt lúc {formatDateTime(order.created_at)}</p>
      </div>
      <StatusBadge status={order.status} />
    </div>
    <OrderTimeline status={order.status} />
    <div className="grid items-start gap-8 tablet:grid-cols-[minmax(0,1fr)_360px] tablet:gap-12">
      <section className="flex flex-col gap-6" aria-label="Sản phẩm và thông tin giao hàng">
        <OrderItemsList items={orderLineItems(order)} />
        <div className="border-t border-[#f1f1f1] pt-6"><OrderInfoBlocks order={order} /></div>
        <div className="border-t border-[#f1f1f1] pt-6"><OrderHistory histories={order.histories} /></div>
      </section>
      <aside className="flex flex-col gap-5 rounded-xl bg-[#f4f4f4] p-6" aria-label="Tổng thanh toán">
        <h2 className="text-xl font-medium">Tổng thanh toán</h2>
        <OrderTotals subtotal={order.subtotal} shippingFee={order.shipping_fee} discount={order.discount_amount} couponCode={order.coupon_code} total={order.total} />
        {order.status === 'completed' && <Link to="/reviews" className="rounded-[10px] bg-[#0071e3] text-white px-4 py-3 text-center hover:bg-[#0077ed]">Đánh giá sản phẩm</Link>}
        {order.can_cancel && (confirming
          ? <form onSubmit={cancel} className="flex flex-col gap-3 border-t border-[#e6e6e6] pt-5">
            <label className="flex flex-col gap-2 text-sm">Lý do hủy đơn
              <textarea className={`${fieldClass} h-[90px] resize-y py-3`} value={reason} onChange={event => setReason(event.target.value)} placeholder="Ví dụ: đặt nhầm dung lượng hoặc màu sắc" required minLength={3} />
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={busy} className="flex-1 rounded-[10px] bg-red-600 px-4 py-3 text-white transition-colors duration-200 ease-[ease] hover:bg-red-700 disabled:opacity-60 motion-reduce:transition-none">Xác nhận hủy</button>
              <button type="button" onClick={() => setConfirming(false)} className="flex-1 rounded-[10px] border border-black px-4 py-3">Giữ đơn</button>
            </div>
          </form>
          : <button type="button" onClick={() => { setError(''); setConfirming(true) }} className="rounded-[10px] border border-black px-4 py-3 transition-colors duration-200 ease-[ease] hover:bg-black hover:text-white motion-reduce:transition-none">Hủy đơn hàng</button>)}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {!order.can_cancel && order.status !== 'cancelled' && order.status !== 'completed' && <p className="text-[13px] text-[#777]">Đơn hàng đã được xác nhận nên không thể hủy trực tuyến. Vui lòng liên hệ cửa hàng nếu cần hỗ trợ.</p>}
      </aside>
    </div>
  </div>
}
