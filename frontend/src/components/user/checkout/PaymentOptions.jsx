import { PAYMENT_METHODS } from '../orders/orderStatus'

/** Hiện chỉ hỗ trợ thanh toán khi nhận hàng (COD). */
export default function PaymentOptions() {
  return <fieldset className="flex flex-col gap-3">
    <legend className="mb-3 text-xl font-medium">Phương thức thanh toán</legend>
    <label className="flex items-start gap-3 rounded-[10px] border border-black bg-[#f4f4f4] p-4">
      <input className="mt-1 size-4 accent-black" type="radio" name="payment" value="cod" checked readOnly />
      <span><span className="block font-medium">{PAYMENT_METHODS.cod}</span><span className="mt-0.5 block text-sm text-[#666]">Kiểm tra hàng rồi thanh toán tiền mặt cho nhân viên giao hàng.</span></span>
    </label>
  </fieldset>
}
