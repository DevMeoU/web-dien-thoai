import { formatCurrency } from '../../../utils/format'

export default function OrderTotals({ subtotal, shippingFee, discount = 0, couponCode, total }) {
  return <dl className="flex flex-col gap-3">
    <div className="flex justify-between gap-4"><dt>Tạm tính</dt><dd>{formatCurrency(subtotal)}</dd></div>
    {Number(discount) > 0 && <div className="flex justify-between gap-4"><dt>Mã giảm giá{couponCode ? ` (${couponCode})` : ''}</dt><dd>−{formatCurrency(discount)}</dd></div>}
    <div className="flex justify-between gap-4"><dt>Giao hàng</dt><dd>{Number(shippingFee) === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</dd></div>
    <div className="flex justify-between gap-4 border-t border-[#e6e6e6] pt-4 text-lg font-bold"><dt>Tổng cộng</dt><dd>{formatCurrency(total)}</dd></div>
  </dl>
}
