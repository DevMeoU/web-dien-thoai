import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from '@phosphor-icons/react'
import { useShop } from '../../../contexts/shopState'
import { useAsync } from '../../../hooks/useAsync'
import { accountService } from '../../../services/accountService'
import CheckoutSummary from '../../../components/user/checkout/CheckoutSummary'
import PaymentOptions from '../../../components/user/checkout/PaymentOptions'
import FormField from '../../../components/user/form/FormField'
import { fieldClass, labelClass } from '../../../components/user/form/formStyles'
import EmptyState from '../../../components/user/shopping/EmptyState'
import PageTitle from '../../../components/user/shopping/PageTitle'

const required = (data, name, message) => data.get(name).trim() ? '' : message

function validate(data) {
  return {
    recipient_name: required(data, 'recipient_name', 'Vui lòng nhập họ tên người nhận.'),
    phone: /^(0|\+84)\d{9}$/.test(data.get('phone').replace(/\s/g, '')) ? '' : 'Vui lòng nhập số điện thoại hợp lệ (ví dụ 0901234567).',
    city: required(data, 'city', 'Vui lòng nhập tỉnh / thành phố.'),
    district: required(data, 'district', 'Vui lòng nhập quận / huyện.'),
    ward: required(data, 'ward', 'Vui lòng nhập phường / xã.'),
    line: required(data, 'line', 'Vui lòng nhập địa chỉ cụ thể.'),
  }
}

function SavedAddresses({ addresses, choice, onChoose }) {
  return <fieldset className="flex flex-col gap-3">
    <legend className="mb-3 text-xl font-medium">Địa chỉ nhận hàng</legend>
    {addresses.map(address => <label key={address.id} className={`flex cursor-pointer items-start gap-3 rounded-[10px] border p-4 ${choice === address.id ? 'border-black bg-[#f4f4f4]' : 'border-[#e6e6e6] hover:bg-[#fafafa]'}`}>
      <input className="mt-1 size-4 accent-black" type="radio" name="address_choice" checked={choice === address.id} onChange={() => onChoose(address.id)} />
      <span className="text-sm"><span className="block font-medium">{address.recipient_name} · {address.phone}{address.is_default && <span className="ml-2 rounded-full bg-black px-2 py-0.5 text-xs text-white">Mặc định</span>}</span><span className="mt-0.5 block text-[#666]">{address.full_address}</span></span>
    </label>)}
    <label className={`flex cursor-pointer items-center gap-3 rounded-[10px] border p-4 ${choice === 'new' ? 'border-black bg-[#f4f4f4]' : 'border-[#e6e6e6] hover:bg-[#fafafa]'}`}>
      <input className="size-4 accent-black" type="radio" name="address_choice" checked={choice === 'new'} onChange={() => onChoose('new')} />
      <span className="text-sm font-medium">Giao tới địa chỉ khác</span>
    </label>
  </fieldset>
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, loading, refresh } = useShop()
  const { data: addressData } = useAsync(() => accountService.addresses(), [])
  const addresses = addressData?.data ?? []
  const [selected, setSelected] = useState(null)
  const choice = selected ?? addresses[0]?.id ?? 'new'
  const [coupon, setCoupon] = useState('')
  const [couponMessage, setCouponMessage] = useState('')
  const [totals, setTotals] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [busy, setBusy] = useState(false)
  const hasItems = Boolean(cart?.items.length)

  // Tính lại tổng tiền mỗi khi giỏ hàng hoặc mã giảm giá đổi.
  useEffect(() => {
    if (!hasItems) return undefined
    let alive = true
    accountService.checkoutPreview(coupon)
      .then(response => { if (alive) setTotals(response.data) })
      .catch(error => { if (alive) { setCouponMessage(error.message); setCoupon('') } })
    return () => { alive = false }
  }, [cart, coupon, hasItems])

  async function applyCoupon(code) {
    const trimmed = code.trim()
    if (!trimmed) { setCouponMessage('Vui lòng nhập mã giảm giá.'); return }
    try {
      const response = await accountService.checkoutPreview(trimmed)
      setTotals(response.data)
      setCoupon(response.data.coupon_code)
      setCouponMessage(`Đã áp dụng mã ${response.data.coupon_code}.`)
    } catch (error) {
      setCouponMessage(error.message)
    }
  }

  async function submit(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const body = { note: data.get('note').trim() || null, coupon_code: coupon || null }
    if (choice === 'new') {
      const next = validate(data)
      setErrors(next)
      if (Object.values(next).some(Boolean)) { setSubmitError('Vui lòng kiểm tra lại thông tin giao hàng.'); return }
      body.address = Object.fromEntries(['recipient_name', 'phone', 'city', 'district', 'ward', 'line'].map(name => [name, data.get(name).trim()]))
      body.save_address = data.get('save_address') === 'on'
    } else {
      body.address_id = choice
    }
    setBusy(true)
    setSubmitError('')
    try {
      const response = await accountService.placeOrder(body)
      await refresh()
      navigate(`/checkout/success?order=${response.data.code}`, { replace: true })
    } catch (error) {
      const details = error.errors?.items?.join(' ')
      setSubmitError([error.message, details].filter(Boolean).join(' '))
      refresh().catch(() => {})
    } finally {
      setBusy(false)
    }
  }

  if (loading && !cart) return <p className="py-16 text-center text-[#666]" role="status">Đang tải giỏ hàng...</p>
  if (!hasItems) return <div className="flex flex-col gap-8">
    <PageTitle title="Thanh toán" description="Giỏ hàng của bạn đang trống." />
    <EmptyState icon={ShoppingBag} title="Chưa có gì để thanh toán" text="Hãy thêm sản phẩm vào giỏ hàng trước khi đặt hàng." />
  </div>

  return <div className="flex flex-col gap-8">
    <PageTitle title="Thanh toán" description="Chọn địa chỉ nhận hàng và xác nhận đơn hàng." />
    <div className="grid items-start gap-8 tablet:grid-cols-[minmax(0,1fr)_400px] tablet:gap-12">
      <form id="checkout-form" onSubmit={submit} noValidate className="flex flex-col gap-8" onChange={() => setSubmitError('')}>
        {addresses.length > 0 && <SavedAddresses addresses={addresses} choice={choice} onChoose={setSelected} />}
        {choice === 'new' && <fieldset className="flex flex-col gap-5">
          <legend className="mb-5 text-xl font-medium">{addresses.length ? 'Địa chỉ mới' : 'Thông tin nhận hàng'}</legend>
          <div className="grid gap-5 tablet:grid-cols-2">
            <FormField label="Họ tên người nhận" name="recipient_name" autoComplete="name" placeholder="Nguyễn Văn A" error={errors.recipient_name} />
            <FormField label="Số điện thoại" name="phone" type="tel" autoComplete="tel" placeholder="0901234567" error={errors.phone} />
          </div>
          <div className="grid gap-5 tablet:grid-cols-3">
            <FormField label="Tỉnh / Thành phố" name="city" autoComplete="address-level1" placeholder="TP. Hồ Chí Minh" error={errors.city} />
            <FormField label="Quận / Huyện" name="district" autoComplete="address-level2" placeholder="Quận 1" error={errors.district} />
            <FormField label="Phường / Xã" name="ward" placeholder="Phường Bến Nghé" error={errors.ward} />
          </div>
          <FormField label="Địa chỉ cụ thể" name="line" autoComplete="street-address" placeholder="Số nhà, tên đường" error={errors.line} />
          <label className="flex items-center gap-2.5 text-sm"><input type="checkbox" name="save_address" defaultChecked className="size-4 accent-black" />Lưu vào sổ địa chỉ</label>
        </fieldset>}
        <label className={labelClass}>Ghi chú cho cửa hàng (không bắt buộc)
          <textarea className={`${fieldClass} h-[100px] resize-y py-3`} name="note" placeholder="Ví dụ: giao giờ hành chính" />
        </label>
        <PaymentOptions />
      </form>
      <CheckoutSummary cart={cart} totals={totals} coupon={coupon} couponMessage={couponMessage} onApplyCoupon={applyCoupon} onRemoveCoupon={() => { setCoupon(''); setCouponMessage('') }} submitError={submitError} busy={busy} />
    </div>
  </div>
}
