import { useState } from 'react'
import { MapPin } from '@phosphor-icons/react'
import { useAsync } from '../../../hooks/useAsync'
import { accountService } from '../../../services/accountService'
import FormField from '../../../components/user/form/FormField'
import { submitClass } from '../../../components/user/form/formStyles'
import EmptyState from '../../../components/user/shopping/EmptyState'
import PageTitle from '../../../components/user/shopping/PageTitle'

const FIELDS = ['recipient_name', 'phone', 'city', 'district', 'ward', 'line']
const REQUIRED = { recipient_name: 'Vui lòng nhập tên người nhận.', city: 'Vui lòng nhập tỉnh / thành phố.', district: 'Vui lòng nhập quận / huyện.', ward: 'Vui lòng nhập phường / xã.', line: 'Vui lòng nhập địa chỉ cụ thể.' }

function validate(data) {
  const errors = Object.fromEntries(Object.entries(REQUIRED).map(([name, message]) => [name, data.get(name).trim() ? '' : message]))
  errors.phone = /^(0|\+84)\d{9}$/.test(data.get('phone').replace(/\s/g, '')) ? '' : 'Vui lòng nhập số điện thoại hợp lệ.'
  return errors
}

function AddressForm({ address, onSaved, onCancel }) {
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const next = validate(data)
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    const body = { ...Object.fromEntries(FIELDS.map(name => [name, data.get(name).trim()])), is_default: data.get('is_default') === 'on' }
    setBusy(true)
    try {
      if (address) await accountService.updateAddress(address.id, body)
      else await accountService.createAddress(body)
      onSaved()
    } catch (error) {
      setErrors(Object.fromEntries(Object.keys(error.errors ?? {}).map(field => [field, error.field(field)])))
      setFailure(error.message)
    } finally {
      setBusy(false)
    }
  }

  return <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-xl border border-[#f1f1f1] p-6">
    <h2 className="text-xl font-medium">{address ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h2>
    <div className="grid gap-5 tablet:grid-cols-2">
      <FormField label="Tên người nhận" name="recipient_name" defaultValue={address?.recipient_name ?? ''} error={errors.recipient_name} />
      <FormField label="Số điện thoại" name="phone" type="tel" defaultValue={address?.phone ?? ''} error={errors.phone} placeholder="0901234567" />
    </div>
    <div className="grid gap-5 tablet:grid-cols-3">
      <FormField label="Tỉnh / Thành phố" name="city" defaultValue={address?.city ?? ''} error={errors.city} />
      <FormField label="Quận / Huyện" name="district" defaultValue={address?.district ?? ''} error={errors.district} />
      <FormField label="Phường / Xã" name="ward" defaultValue={address?.ward ?? ''} error={errors.ward} />
    </div>
    <FormField label="Địa chỉ cụ thể" name="line" defaultValue={address?.line ?? ''} error={errors.line} placeholder="Số nhà, tên đường" />
    {!address?.is_default && <label className="flex items-center gap-2.5 text-sm"><input type="checkbox" name="is_default" className="size-4 accent-black" />Đặt làm địa chỉ mặc định</label>}
    <div className="flex gap-3">
      <button type="submit" disabled={busy} className={`${submitClass} disabled:opacity-60`}>{busy ? 'Đang lưu...' : 'Lưu địa chỉ'}</button>
      <button type="button" onClick={onCancel} className="rounded-[10px] border border-black px-8 py-3">Hủy</button>
    </div>
    {failure && <p className="text-[13px] text-red-700" role="alert">{failure}</p>}
  </form>
}

export default function AddressesPage() {
  const { data, loading, reload } = useAsync(() => accountService.addresses(), [])
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const addresses = data?.data ?? []

  async function run(action) {
    setError('')
    try { await action(); reload() } catch (failure) { setError(failure.message) }
  }

  const done = () => { setEditing(null); reload() }
  return <div className="flex flex-col gap-8">
    <PageTitle title="Sổ địa chỉ" description="Lưu địa chỉ nhận hàng để chọn nhanh khi thanh toán. Sửa địa chỉ không làm thay đổi đơn hàng đã đặt." />
    {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
    {editing !== null && <AddressForm address={editing === 'new' ? null : editing} onSaved={done} onCancel={() => setEditing(null)} />}
    {editing === null && <button type="button" onClick={() => setEditing('new')} className="w-max rounded-[10px] bg-[#0071e3] text-white px-8 py-3 hover:bg-[#0077ed]">Thêm địa chỉ mới</button>}
    {loading && !data ? <p className="text-[#666]" role="status">Đang tải địa chỉ...</p> : addresses.length === 0
      ? <EmptyState icon={MapPin} title="Chưa có địa chỉ nào" text="Thêm địa chỉ đầu tiên để thanh toán nhanh hơn." to="/products" action="Tiếp tục mua sắm" />
      : <ul className="grid gap-4 tablet:grid-cols-2">
        {addresses.map(address => <li key={address.id} className="flex flex-col gap-3 rounded-xl border border-[#f1f1f1] p-5">
          <div className="flex items-start justify-between gap-3"><p className="font-medium">{address.recipient_name} · {address.phone}</p>{address.is_default && <span className="shrink-0 rounded-full bg-black px-2.5 py-0.5 text-xs text-white">Mặc định</span>}</div>
          <p className="text-sm leading-[1.6] text-[#555]">{address.full_address}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <button type="button" className="underline underline-offset-4" onClick={() => setEditing(address)}>Sửa</button>
            {!address.is_default && <button type="button" className="underline underline-offset-4" onClick={() => run(() => accountService.setDefaultAddress(address.id))}>Đặt mặc định</button>}
            <button type="button" className="text-red-700 underline underline-offset-4" onClick={() => { if (window.confirm('Xóa địa chỉ này?')) run(() => accountService.deleteAddress(address.id)) }}>Xóa</button>
          </div>
        </li>)}
      </ul>}
  </div>
}
