import { useState } from 'react'
import CrudPage from '../../../components/admin/CrudPage'
import { Badge, Button, CheckField, DataTable, Modal, Notice, PageHeader, TextAreaField, TextField } from '../../../components/admin/ui'
import { useNotice } from '../../../components/admin/useAdminList'
import { useAsync } from '../../../hooks/useAsync'
import { adminService } from '../../../services/adminService'
import { invalidateStoreData } from '../../../hooks/useStoreData'

const bannerColumns = [
  { header: 'Banner', render: row => <div className="flex items-center gap-3">{row.image_url ? <img src={row.image_url} alt="" className="h-12 w-20 rounded-lg object-cover" /> : <span className="flex h-12 w-20 items-center justify-center rounded-lg bg-[#f1f1f1] text-xs text-[#999]">Chưa có ảnh</span>}<div><p className="font-medium">{row.title}</p><p className="text-xs text-[#888]">{row.subtitle}</p></div></div> },
  { header: 'Vị trí', render: row => row.position === 'collection' ? 'Theo nhu cầu' : 'Đầu trang chủ' },
  { header: 'Liên kết', render: row => row.link || '—' },
  { header: 'Thứ tự', render: row => row.sort_order },
  { header: 'Hiển thị', render: row => <Badge tone={row.is_active ? 'green' : 'gray'}>{row.is_active ? 'Đang hiển thị' : 'Đang ẩn'}</Badge> },
]

const bannerFields = [
  { name: 'title', label: 'Tiêu đề', required: true },
  { name: 'subtitle', label: 'Phụ đề' },
  { name: 'position', label: 'Vị trí hiển thị', type: 'select', required: true, default: 'hero', options: [['hero', 'Đầu trang chủ'], ['collection', 'Thẻ theo nhu cầu']], help: 'Đầu trang chủ: lấy banner đầu tiên (theo thứ tự). Theo nhu cầu: hiển thị tối đa 3 thẻ, thẻ đầu tiên là thẻ lớn.' },
  { name: 'link', label: 'Liên kết khi bấm', placeholder: '/products?collection=work' },
  { name: 'sort_order', label: 'Thứ tự', type: 'number', min: 0, default: 0 },
  { name: 'is_active', label: 'Hiển thị trên trang chủ', type: 'checkbox', default: true },
]

function PagesEditor() {
  const { data, loading, reload } = useAsync(() => adminService.pages(), [])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [busy, setBusy] = useState(false)
  const { notice, success, fail, clear } = useNotice()

  const open = page => { clear(); setForm({ title: page.title, content: page.content ?? '', is_published: page.is_published }); setEditing(page) }
  async function save(event) {
    event.preventDefault()
    setBusy(true)
    try { await adminService.savePage(editing.slug, form); invalidateStoreData(); setEditing(null); success('Đã lưu nội dung trang.'); reload() } catch (error) { fail(error) } finally { setBusy(false) }
  }

  return <div>
    <Notice notice={notice} />
    <DataTable loading={loading} rows={data?.data ?? []} rowKey={row => row.slug} columns={[
      { header: 'Trang', render: row => <div><p className="font-medium">{row.title}</p><p className="text-xs text-[#888]">{row.slug}</p></div> },
      { header: 'Nội dung', render: row => <span className="line-clamp-1 max-w-[360px] text-[#666]">{row.content}</span> },
      { header: 'Trạng thái', render: row => <Badge tone={row.is_published ? 'green' : 'gray'}>{row.is_published ? 'Đã xuất bản' : 'Bản nháp'}</Badge> },
      { header: 'Thao tác', className: 'text-right', render: row => <Button small onClick={() => open(row)}>Chỉnh sửa</Button> },
    ]} />
    <Modal open={Boolean(editing)} title={`Chỉnh sửa: ${editing?.title ?? ''}`} onClose={() => setEditing(null)} wide>
      <form onSubmit={save} className="flex flex-col gap-4">
        <TextField label="Tiêu đề" value={form.title ?? ''} onChange={event => setForm({ ...form, title: event.target.value })} required />
        <TextAreaField label="Nội dung" rows={12} value={form.content ?? ''} onChange={event => setForm({ ...form, content: event.target.value })} help="Xuống dòng để tạo đoạn mới." />
        <CheckField label="Xuất bản cho khách xem" checked={Boolean(form.is_published)} onChange={event => setForm({ ...form, is_published: event.target.checked })} />
        <div className="flex justify-end gap-3"><Button onClick={() => setEditing(null)}>Đóng</Button><Button type="submit" tone="dark" disabled={busy}>{busy ? 'Đang lưu...' : 'Lưu'}</Button></div>
      </form>
    </Modal>
  </div>
}

export default function AdminContent() {
  const [tab, setTab] = useState('banners')
  return <div>
    <div className="mb-6 flex gap-2" role="tablist" aria-label="Nội dung">
      {[['banners', 'Banner trang chủ'], ['pages', 'Trang nội dung & chính sách']].map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === key ? 'bg-black text-white' : 'border border-[#ddd] bg-white hover:bg-[#f4f4f4]'}`}>{label}</button>)}
    </div>
    {tab === 'banners'
      ? <CrudPage resource="banners" title="Banner trang chủ" singular="banner" description="Quản lý banner đầu trang và các thẻ mua sắm theo nhu cầu; đặt ảnh, liên kết, thứ tự và trạng thái hiển thị." columns={bannerColumns} fields={bannerFields} imageUpload searchPlaceholder="Tìm banner..." filters={[{ key: 'position', label: 'Mọi vị trí', options: [['hero', 'Đầu trang chủ'], ['collection', 'Thẻ theo nhu cầu']] }]} />
      : <><PageHeader title="Trang nội dung & chính sách" description="Giới thiệu, hướng dẫn mua hàng, chính sách giao hàng, đổi trả và bảo mật." /><PagesEditor /></>}
  </div>
}
