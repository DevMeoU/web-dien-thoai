import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { Badge, Button, DataTable, Modal, Notice, PageHeader, TextAreaField, inputClass } from '../../../components/admin/ui'
import { useAdminList, useNotice } from '../../../components/admin/useAdminList'
import { Stars } from '../../../components/user/product-detail/ProductReviews'
import Pagination from '../../../components/user/shopping/Pagination'
import { adminService } from '../../../services/adminService'
import { formatDate } from '../../../utils/format'

export default function AdminReviews() {
  const list = useAdminList('reviews')
  const [replying, setReplying] = useState(null)
  const [reply, setReply] = useState('')
  const { notice, success, fail, clear } = useNotice()

  async function change(action, message) {
    clear()
    try { await action; success(message); setReplying(null); list.reload() } catch (error) { fail(error) }
  }

  const columns = [
    { header: 'Sản phẩm', render: row => <div><p className="font-medium">{row.product?.name}</p><p className="text-xs text-[#888]">{row.user?.name} · {row.user?.email}</p></div> },
    { header: 'Đánh giá', render: row => <div className="max-w-[360px]"><Stars value={row.rating} />{row.comment && <p className="mt-1 text-sm">{row.comment}</p>}{row.admin_reply && <p className="mt-1 rounded bg-[#f4f4f4] p-2 text-xs"><strong>Cửa hàng:</strong> {row.admin_reply}</p>}</div> },
    { header: 'Ngày gửi', render: row => formatDate(row.created_at) },
    { header: 'Hiển thị', render: row => <Badge tone={row.is_visible ? 'green' : 'gray'}>{row.is_visible ? 'Công khai' : 'Đã ẩn'}</Badge> },
    { header: 'Thao tác', className: 'text-right', render: row => <div className="flex justify-end gap-2">
      <Button small onClick={() => { clear(); setReply(row.admin_reply ?? ''); setReplying(row) }}>{row.admin_reply ? 'Sửa trả lời' : 'Trả lời'}</Button>
      <Button small tone={row.is_visible ? 'danger' : 'secondary'} onClick={() => change(adminService.patch('reviews', row.id, 'visibility', { is_visible: !row.is_visible }), row.is_visible ? 'Đã ẩn đánh giá.' : 'Đã hiện đánh giá.')}>{row.is_visible ? 'Ẩn' : 'Hiện'}</Button>
    </div> },
  ]

  return <div>
    <PageHeader title="Đánh giá" description="Xem nhận xét theo sản phẩm, khách hàng và số sao; ẩn đánh giá vi phạm và trả lời với tư cách cửa hàng. Điểm trung bình chỉ tính đánh giá đang công khai." />
    <Notice notice={notice} />
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="relative min-w-[220px] flex-1"><MagnifyingGlass size={16} aria-hidden="true" className="absolute top-1/2 left-3 -translate-y-1/2 text-[#999]" /><input type="search" aria-label="Tìm đánh giá" placeholder="Tìm theo nhận xét, khách hàng, sản phẩm..." value={list.params.q ?? ''} onChange={event => list.setParam('q', event.target.value)} className={`${inputClass} pl-9`} /></div>
      <select aria-label="Lọc theo số sao" value={list.params.rating ?? ''} onChange={event => list.setParam('rating', event.target.value)} className={`${inputClass} w-auto`}><option value="">Mọi số sao</option>{[5, 4, 3, 2, 1].map(star => <option key={star} value={star}>{star} sao</option>)}</select>
      <select aria-label="Lọc theo hiển thị" value={list.params.is_visible ?? ''} onChange={event => list.setParam('is_visible', event.target.value)} className={`${inputClass} w-auto`}><option value="">Mọi trạng thái</option><option value="true">Công khai</option><option value="false">Đã ẩn</option></select>
    </div>
    <DataTable columns={columns} rows={list.rows} loading={list.loading} empty="Chưa có đánh giá nào." />
    <div className="mt-5"><Pagination page={list.meta?.current_page ?? 1} pageCount={list.meta?.last_page ?? 1} onChange={list.setPage} /></div>
    <Modal open={Boolean(replying)} title="Trả lời đánh giá" onClose={() => setReplying(null)}>
      {replying && <form className="flex flex-col gap-4" onSubmit={event => { event.preventDefault(); change(adminService.post('reviews', replying.id, 'reply', { reply }), 'Đã gửi phản hồi.') }}>
        <div className="rounded-lg bg-[#f6f6f6] p-3 text-sm"><Stars value={replying.rating} /><p className="mt-1">{replying.comment || 'Không có nhận xét.'}</p></div>
        <TextAreaField label="Phản hồi của cửa hàng" rows={4} value={reply} onChange={event => setReply(event.target.value)} required />
        <div className="flex justify-end gap-3"><Button onClick={() => setReplying(null)}>Đóng</Button><Button type="submit" tone="dark">Gửi phản hồi</Button></div>
      </form>}
    </Modal>
  </div>
}
