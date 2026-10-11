import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { Badge, Button, DataTable, Modal, Notice, PageHeader, SelectField, TextAreaField, inputClass } from '../../../components/admin/ui'
import { useAdminList, useNotice } from '../../../components/admin/useAdminList'
import Pagination from '../../../components/user/shopping/Pagination'
import { adminService } from '../../../services/adminService'
import { formatDateTime } from '../../../utils/format'

const STATUS = { new: ['amber', 'Mới'], processing: ['blue', 'Đang xử lý'], resolved: ['green', 'Đã xử lý'] }

export default function AdminContacts() {
  const list = useAdminList('contact-requests')
  const [open, setOpen] = useState(null)
  const [form, setForm] = useState({ status: 'new', admin_note: '' })
  const { notice, success, fail, clear } = useNotice()

  async function submit(event) {
    event.preventDefault()
    clear()
    try {
      await adminService.patchItem('contact-requests', open.id, form)
      success('Đã cập nhật yêu cầu liên hệ.')
      setOpen(null)
      list.reload()
    } catch (error) { fail(error) }
  }

  const columns = [
    { header: 'Người gửi', render: row => <div><p className="font-medium">{row.name}</p><p className="text-xs text-[#888]">{row.email}{row.phone ? ` · ${row.phone}` : ''}</p></div> },
    { header: 'Nội dung', render: row => <div className="max-w-[360px]"><p className="line-clamp-2 text-sm">{row.message}</p>{row.order_code && <p className="mt-1 font-mono text-xs text-[#888]">Đơn: {row.order_code}</p>}</div> },
    { header: 'Gửi lúc', render: row => formatDateTime(row.created_at) },
    { header: 'Trạng thái', render: row => <Badge tone={STATUS[row.status][0]}>{STATUS[row.status][1]}</Badge> },
    { header: '', className: 'text-right', render: row => <Button small onClick={() => { clear(); setForm({ status: row.status, admin_note: row.admin_note ?? '' }); setOpen(row) }}>Xử lý</Button> },
  ]

  return <div>
    <PageHeader title="Yêu cầu liên hệ" description="Xem yêu cầu hỗ trợ của khách, cập nhật trạng thái và ghi chú kết quả xử lý." />
    <Notice notice={notice} />
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="relative min-w-[220px] flex-1"><MagnifyingGlass size={16} aria-hidden="true" className="absolute top-1/2 left-3 -translate-y-1/2 text-[#999]" /><input type="search" aria-label="Tìm yêu cầu" placeholder="Tìm theo tên, email, số điện thoại, mã đơn..." value={list.params.q ?? ''} onChange={event => list.setParam('q', event.target.value)} className={`${inputClass} pl-9`} /></div>
      <select aria-label="Lọc theo trạng thái" value={list.params.status ?? ''} onChange={event => list.setParam('status', event.target.value)} className={`${inputClass} w-auto`}><option value="">Mọi trạng thái</option>{Object.entries(STATUS).map(([value, [, label]]) => <option key={value} value={value}>{label}</option>)}</select>
    </div>
    <DataTable columns={columns} rows={list.rows} loading={list.loading} empty="Chưa có yêu cầu liên hệ nào." />
    <div className="mt-5"><Pagination page={list.meta?.current_page ?? 1} pageCount={list.meta?.last_page ?? 1} onChange={list.setPage} /></div>
    <Modal open={Boolean(open)} title="Yêu cầu liên hệ" onClose={() => setOpen(null)}>
      {open && <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="rounded-lg bg-[#f6f6f6] p-3 text-sm leading-[1.6]"><p><strong>{open.name}</strong> · {open.email}{open.phone ? ` · ${open.phone}` : ''}</p>{open.order_code && <p>Mã đơn: <span className="font-mono">{open.order_code}</span></p>}<p className="mt-2 whitespace-pre-line">{open.message}</p></div>
        <SelectField label="Trạng thái" value={form.status} onChange={event => setForm({ ...form, status: event.target.value })} options={Object.entries(STATUS).map(([value, [, label]]) => [value, label])} />
        <TextAreaField label="Ghi chú kết quả xử lý" rows={4} value={form.admin_note} onChange={event => setForm({ ...form, admin_note: event.target.value })} />
        <div className="flex justify-end gap-3"><Button onClick={() => setOpen(null)}>Đóng</Button><Button type="submit" tone="dark">Lưu</Button></div>
      </form>}
    </Modal>
  </div>
}
