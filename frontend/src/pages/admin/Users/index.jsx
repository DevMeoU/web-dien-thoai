import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { Badge, Button, DataTable, Modal, Notice, PageHeader, inputClass } from '../../../components/admin/ui'
import { useAdminList, useNotice } from '../../../components/admin/useAdminList'
import StatusBadge from '../../../components/user/orders/StatusBadge'
import Pagination from '../../../components/user/shopping/Pagination'
import { useAuth } from '../../../contexts/authState'
import { useAsync } from '../../../hooks/useAsync'
import { adminService } from '../../../services/adminService'
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/format'

function UserDetail({ id, onClose }) {
  const { data, loading } = useAsync(() => id ? adminService.get('users', id) : Promise.resolve(null), [id])
  const detail = data?.data
  return <Modal open={Boolean(id)} title="Hồ sơ khách hàng" onClose={onClose} wide>
    {loading || !detail ? <p className="py-8 text-center text-[#888]" role="status">Đang tải...</p> : <div className="flex flex-col gap-5">
      <div className="grid gap-3 text-sm tablet:grid-cols-2">
        <p><strong>Họ tên:</strong> {detail.user.name}</p><p><strong>Email:</strong> {detail.user.email}</p>
        <p><strong>Điện thoại:</strong> {detail.user.phone ?? '—'}</p><p><strong>Tham gia:</strong> {formatDate(detail.user.created_at)}</p>
        <p><strong>Vai trò:</strong> {detail.user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</p><p><strong>Số đơn:</strong> {detail.user.orders_count}</p>
      </div>
      <h3 className="font-semibold">Lịch sử mua hàng gần đây</h3>
      {detail.recent_orders.length === 0 ? <p className="text-sm text-[#888]">Chưa có đơn hàng.</p> : <ul className="divide-y divide-[#f1f1f1] text-sm">
        {detail.recent_orders.map(order => <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span className="font-mono">{order.code}</span><span>{formatDateTime(order.created_at)}</span><span className="font-medium">{formatCurrency(order.total)}</span><StatusBadge status={order.status} /></li>)}
      </ul>}
    </div>}
  </Modal>
}

export default function AdminUsers() {
  const { user: me } = useAuth()
  const list = useAdminList('users')
  const [openId, setOpenId] = useState(null)
  const { notice, success, fail, clear } = useNotice()

  async function change(action, message) {
    clear()
    try { await action; success(message); list.reload() } catch (error) { fail(error) }
  }

  const columns = [
    { header: 'Người dùng', render: row => <div><p className="font-medium">{row.name}</p><p className="text-xs text-[#888]">{row.email}</p></div> },
    { header: 'Điện thoại', render: row => row.phone ?? '—' },
    { header: 'Vai trò', render: row => <Badge tone={row.role === 'admin' ? 'indigo' : 'gray'}>{row.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</Badge> },
    { header: 'Số đơn', render: row => row.orders_count },
    { header: 'Tham gia', render: row => formatDate(row.created_at) },
    { header: 'Trạng thái', render: row => <Badge tone={row.is_active ? 'green' : 'red'}>{row.is_active ? 'Hoạt động' : 'Đã khóa'}</Badge> },
    { header: 'Thao tác', className: 'text-right', render: row => <div className="flex flex-wrap justify-end gap-2">
      <Button small onClick={() => setOpenId(row.id)}>Hồ sơ</Button>
      {row.id !== me.id && <>
        <Button small tone={row.is_active ? 'danger' : 'secondary'} onClick={() => { if (!row.is_active || window.confirm(`Khóa tài khoản ${row.email}? Họ sẽ bị đăng xuất khỏi mọi thiết bị.`)) change(adminService.patch('users', row.id, 'status', { is_active: !row.is_active }), row.is_active ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.') }}>{row.is_active ? 'Khóa' : 'Mở khóa'}</Button>
        <Button small onClick={() => { if (window.confirm(row.role === 'admin' ? 'Hạ xuống khách hàng?' : 'Cấp quyền quản trị viên?')) change(adminService.patch('users', row.id, 'role', { role: row.role === 'admin' ? 'user' : 'admin' }), 'Đã cập nhật vai trò.') }}>{row.role === 'admin' ? 'Hạ quyền' : 'Cấp quyền admin'}</Button>
      </>}
    </div> },
  ]

  return <div>
    <PageHeader title="Khách hàng & tài khoản" description="Tìm theo tên, email, số điện thoại; xem lịch sử mua hàng, khóa/mở khóa và phân quyền." />
    <Notice notice={notice} />
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="relative min-w-[220px] flex-1"><MagnifyingGlass size={16} aria-hidden="true" className="absolute top-1/2 left-3 -translate-y-1/2 text-[#999]" /><input type="search" aria-label="Tìm tài khoản" placeholder="Tìm theo tên, email hoặc số điện thoại..." value={list.params.q ?? ''} onChange={event => list.setParam('q', event.target.value)} className={`${inputClass} pl-9`} /></div>
      <select aria-label="Lọc theo vai trò" value={list.params.role ?? ''} onChange={event => list.setParam('role', event.target.value)} className={`${inputClass} w-auto`}><option value="">Mọi vai trò</option><option value="user">Khách hàng</option><option value="admin">Quản trị viên</option></select>
      <select aria-label="Lọc theo trạng thái" value={list.params.is_active ?? ''} onChange={event => list.setParam('is_active', event.target.value)} className={`${inputClass} w-auto`}><option value="">Mọi trạng thái</option><option value="true">Hoạt động</option><option value="false">Đã khóa</option></select>
    </div>
    <DataTable columns={columns} rows={list.rows} loading={list.loading} />
    <div className="mt-5"><Pagination page={list.meta?.current_page ?? 1} pageCount={list.meta?.last_page ?? 1} onChange={list.setPage} /></div>
    <UserDetail id={openId} onClose={() => setOpenId(null)} />
  </div>
}
