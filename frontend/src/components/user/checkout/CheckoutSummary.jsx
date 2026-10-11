import { useState } from 'react'
import { formatCurrency } from '../../../utils/format'
import { submitClass } from '../form/formStyles'
import OrderItemsList from '../orders/OrderItemsList'
import { cartLineItems } from '../orders/orderItems'
import OrderTotals from '../orders/OrderTotals'

export default function CheckoutSummary({ cart, totals, coupon, couponMessage, onApplyCoupon, onRemoveCoupon, submitError, busy }) {
  const [code, setCode] = useState('')
  return <aside className="flex flex-col gap-5 rounded-xl bg-[#f4f4f4] p-6 tablet:sticky tablet:top-[104px]" aria-label="Tóm tắt đơn hàng">
    <h2 className="text-xl font-medium">Đơn hàng của bạn</h2>
    <OrderItemsList items={cartLineItems(cart)} />
    <div className="flex flex-col gap-2 border-t border-[#e6e6e6] pt-5">
      {coupon
        ? <div className="flex items-center justify-between gap-3 rounded-[10px] bg-white px-3 py-2.5 text-sm"><span>Mã <strong>{coupon}</strong> đã được áp dụng</span><button type="button" className="underline underline-offset-4" onClick={() => { setCode(''); onRemoveCoupon() }}>Bỏ mã</button></div>
        : <div className="flex gap-3">
          <input className="min-w-0 flex-1 rounded-[10px] border border-[#e6e6e6] bg-white px-3 py-[11px] font-form text-base leading-[1.2] uppercase placeholder:normal-case placeholder:text-[#999]" aria-label="Mã giảm giá" placeholder="Mã giảm giá" value={code} onChange={event => setCode(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); onApplyCoupon(code) } }} />
          <button type="button" className="rounded-[10px] border border-black px-5 text-sm transition-colors duration-200 ease-[ease] hover:bg-black hover:text-white motion-reduce:transition-none" onClick={() => onApplyCoupon(code)}>Áp dụng</button>
        </div>}
      {couponMessage && <p className={`text-[13px] ${coupon ? 'text-green-700' : 'text-red-700'}`} role="status">{couponMessage}</p>}
    </div>
    {totals ? <OrderTotals subtotal={totals.subtotal} shippingFee={totals.shipping_fee} discount={totals.discount_amount} couponCode={totals.coupon_code} total={totals.total} /> : <p className="text-sm text-[#666]" role="status">Đang tính tổng tiền...</p>}
    <button type="submit" form="checkout-form" disabled={busy || !totals} className={`${submitClass} disabled:cursor-not-allowed disabled:opacity-60`}>{busy ? 'Đang đặt hàng...' : `Đặt hàng${totals ? ` · ${formatCurrency(totals.total)}` : ''}`}</button>
    {submitError && <p role="alert" className="text-sm text-red-700">{submitError}</p>}
  </aside>
}
