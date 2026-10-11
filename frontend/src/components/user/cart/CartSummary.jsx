import { Link } from 'react-router-dom'
import { shippingFor, useStoreSettings } from '../../../hooks/useStoreData'
import { formatCurrency } from '../../../utils/format'
import { submitClass } from '../form/formStyles'

export default function CartSummary({ cart }) {
  const settings = useStoreSettings()
  const subtotal = cart.subtotal
  const threshold = Number(settings.free_shipping_threshold)
  const shipping = shippingFor(subtotal, settings)
  const remaining = threshold - subtotal
  return <aside className="flex flex-col gap-5 rounded-xl bg-[#f4f4f4] p-6 tablet:sticky tablet:top-[104px]" aria-label="Tóm tắt đơn hàng">
    <h2 className="text-xl font-medium">Tóm tắt đơn hàng</h2>
    <dl className="flex flex-col gap-3">
      <div className="flex justify-between gap-4"><dt>Tạm tính ({cart.item_count} sản phẩm)</dt><dd>{formatCurrency(subtotal)}</dd></div>
      <div className="flex justify-between gap-4"><dt>Giao hàng</dt><dd>{shipping === 0 ? 'Miễn phí' : formatCurrency(shipping)}</dd></div>
      <div className="flex justify-between gap-4 border-t border-[#e6e6e6] pt-4 text-lg font-bold"><dt>Tổng cộng</dt><dd>{formatCurrency(subtotal + shipping)}</dd></div>
    </dl>
    {threshold > 0 && <p className="text-sm text-[#555]" role="status">{remaining <= 0 ? 'Đơn hàng của bạn được miễn phí giao hàng.' : `Mua thêm ${formatCurrency(remaining)} để được miễn phí giao hàng.`}</p>}
    {cart.has_issues
      ? <p role="alert" className="rounded-[10px] bg-red-50 p-3 text-sm text-red-700">Một số sản phẩm không đủ hàng hoặc đã ngừng bán. Hãy điều chỉnh giỏ hàng trước khi thanh toán.</p>
      : <Link to="/checkout" className={submitClass}>Tiến hành thanh toán</Link>}
    <Link to="/products" className="text-center text-sm underline-offset-4 hover:underline">Tiếp tục mua sắm</Link>
    <p className="text-[13px] text-[#777]">Mã giảm giá có thể nhập ở bước thanh toán.</p>
  </aside>
}
