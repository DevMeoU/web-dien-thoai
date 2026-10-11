import { useState } from 'react'
import { Button, Notice, PageHeader, Panel, TextAreaField, TextField } from '../../../components/admin/ui'
import { useNotice } from '../../../components/admin/useAdminList'
import { useAsync } from '../../../hooks/useAsync'
import { invalidateStoreData } from '../../../hooks/useStoreData'
import { adminService } from '../../../services/adminService'

export default function AdminSettings() {
  const { data, loading } = useAsync(() => adminService.settings(), [])
  const [edits, setEdits] = useState(null)
  const form = edits ?? data?.data ?? null
  const setForm = setEdits
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const { notice, success, fail, clear } = useNotice()

  const set = name => event => setForm({ ...form, [name]: event.target.value })

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setErrors({})
    clear()
    try {
      const response = await adminService.saveSettings({
        ...form, shipping_fee: Number(form.shipping_fee), free_shipping_threshold: Number(form.free_shipping_threshold), low_stock_threshold: Number(form.low_stock_threshold),
      })
      setEdits(response.data)
      invalidateStoreData()
      success('Đã lưu cài đặt cửa hàng.')
    } catch (error) {
      setErrors(Object.fromEntries(Object.keys(error.errors ?? {}).map(name => [name, error.field(name)])))
      fail(error)
    } finally { setBusy(false) }
  }

  if (loading || !form) return <p className="py-10 text-center text-[#888]" role="status">Đang tải cài đặt...</p>
  return <form onSubmit={save} noValidate className="max-w-[900px]">
    <PageHeader title="Cài đặt cửa hàng" description="Thông tin liên hệ, giới thiệu và cấu hình phí giao hàng áp dụng vào tổng tiền khi đặt hàng." actions={<Button type="submit" tone="dark" disabled={busy}>{busy ? 'Đang lưu...' : 'Lưu cài đặt'}</Button>} />
    <Notice notice={notice} />
    <div className="flex flex-col gap-6">
      <Panel title="Thông tin cửa hàng">
        <div className="grid gap-4 tablet:grid-cols-2">
          <TextField label="Tên cửa hàng" value={form.store_name ?? ''} onChange={set('store_name')} error={errors.store_name} />
          <TextField label="Email liên hệ" type="email" value={form.contact_email ?? ''} onChange={set('contact_email')} error={errors.contact_email} />
          <TextField label="Số điện thoại" value={form.contact_phone ?? ''} onChange={set('contact_phone')} error={errors.contact_phone} />
          <TextField label="Địa chỉ" value={form.contact_address ?? ''} onChange={set('contact_address')} error={errors.contact_address} />
        </div>
        <TextAreaField className="mt-4" label="Giới thiệu ngắn" rows={4} value={form.about_content ?? ''} onChange={set('about_content')} error={errors.about_content} help="Hiển thị ở trang Giới thiệu." />
      </Panel>
      <Panel title="Phí giao hàng">
        <div className="grid gap-4 tablet:grid-cols-2">
          <TextField label="Phí giao hàng cố định (₫)" type="number" min="0" value={form.shipping_fee ?? ''} onChange={set('shipping_fee')} error={errors.shipping_fee} />
          <TextField label="Miễn phí giao hàng từ (₫)" type="number" min="0" value={form.free_shipping_threshold ?? ''} onChange={set('free_shipping_threshold')} error={errors.free_shipping_threshold} help="Nhập 0 để không bao giờ miễn phí." />
        </div>
      </Panel>
      <Panel title="Tồn kho">
        <TextField label="Ngưỡng cảnh báo sắp hết hàng" type="number" min="0" value={form.low_stock_threshold ?? ''} onChange={set('low_stock_threshold')} error={errors.low_stock_threshold} help="Phiên bản có tồn kho bằng hoặc thấp hơn ngưỡng này được coi là sắp hết." className="max-w-[320px]" />
      </Panel>
    </div>
  </form>
}
