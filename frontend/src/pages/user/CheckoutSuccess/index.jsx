import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Receipt } from '@phosphor-icons/react'
import { useAsync } from '../../../hooks/useAsync'
import { accountService } from '../../../services/accountService'
import OrderInfoBlocks from '../../../components/user/orders/OrderInfoBlocks'
import OrderItemsList from '../../../components/user/orders/OrderItemsList'
import { orderLineItems } from '../../../components/user/orders/orderItems'
import OrderTotals from '../../../components/user/orders/OrderTotals'
import { submitClass } from '../../../components/user/form/formStyles'
import EmptyState from '../../../components/user/shopping/EmptyState'

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams()
  const code = params.get('order')
  const { data, loading } = useAsync(() => code ? accountService.order(code) : Promise.reject(new Error('missing')), [code])
  if (loading) return <p className="py-16 text-center text-[#666]" role="status">Đang tải đơn hàng...</p>
  const order = data?.data
  if (!order) return <EmptyState icon={Receipt} title="Không tìm thấy đơn hàng" text="Đơn hàng này không tồn tại hoặc không thuộc tài khoản của bạn." to="/orders" action="Xem đơn hàng của tôi" />
  return <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8">
    <div className="flex flex-col items-center gap-3 text-center">
      <CheckCircle size={56} weight="fill" className="text-green-600" aria-hidden="true" />
      <h1 className="text-[28px] leading-[1.2] font-medium desktop:text-[34px]">Đặt hàng thành công</h1>
      <p>Cảm ơn bạn đã mua sắm. Mã đơn hàng của bạn là <strong>{order.code}</strong>.</p>
      <p className="text-sm text-[#555]">Chúng tôi sẽ liên hệ qua {order.recipient.phone} để xác nhận đơn hàng.</p>
    </div>
    <section className="flex flex-col gap-6 rounded-xl border border-[#f1f1f1] p-6" aria-label="Chi tiết đơn hàng">
      <OrderItemsList items={orderLineItems(order)} />
      <div className="border-t border-[#f1f1f1] pt-6"><OrderTotals subtotal={order.subtotal} shippingFee={order.shipping_fee} discount={order.discount_amount} couponCode={order.coupon_code} total={order.total} /></div>
      <div className="border-t border-[#f1f1f1] pt-6"><OrderInfoBlocks order={order} /></div>
    </section>
    <div className="flex flex-col justify-center gap-3 tablet:flex-row">
      <Link to={`/orders/${order.code}`} className={submitClass}>Xem đơn hàng</Link>
      <Link to="/products" className="rounded-[10px] border border-black px-8 py-3 text-center transition-colors duration-200 ease-[ease] hover:bg-black hover:text-white motion-reduce:transition-none">Tiếp tục mua sắm</Link>
    </div>
  </div>
}
