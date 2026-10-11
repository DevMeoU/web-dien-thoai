import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { Badge, Button, DataTable, Modal, Notice, PageHeader, Panel, TextAreaField, inputClass } from '../../../components/admin/ui'
import { useAdminList, useNotice } from '../../../components/admin/useAdminList'
import OrderHistory from '../../../components/user/orders/OrderHistory'
import OrderItemsList from '../../../components/user/orders/OrderItemsList'
import { orderLineItems } from '../../../components/user/orders/orderItems'
import OrderTotals from '../../../components/user/orders/OrderTotals'
import StatusBadge from '../../../components/user/orders/StatusBadge'
import { NEXT_STATUSES, ORDER_STATUSES, PAYMENT_STATUS, statusLabel } from '../../../components/user/orders/orderStatus'
import Pagination from '../../../components/user/shopping/Pagination'
import { adminService } from '../../../services/adminService'
import { formatCurrency, formatDateTime } from '../../../utils/format'

const ACTION_TONE = { confirmed: 'dark', shipping: 'dark', completed: 'primary', cancelled: 'danger' }

function OrderDetail({ id, onClose, onChanged }) {
  const [order, setOrder] = useState(null)
  const [loadedId, setLoadedId] = useState(null)
  const [note, setNote] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [pending, setPending] = useState(null)
  const [busy, setBusy] = useState(false)
  const { notice, success, fail, clear } = useNotice()

  if (id && loadedId !== id) {
    setLoadedId(id)
    setOrder(null)
    adminService.get('orders', id).then(response => { setOrder(response.data); setAdminNote(response.data.admin_note ?? '') }).catch(fail)
  }

  async function run(request, message) {
    setBusy(true)
    clear()
    try {
      const response = await request
      setOrder(response.data)
      setAdminNote(response.data.admin_note ?? '')
      setPending(null)
      setNote('')
      success(message)
      onChanged()
    } catch (error) { fail(error) } finally { setBusy(false) }
  }

  const choose = status => { clear(); setNote(''); setPending(status) }
  const nextStatuses = order ? NEXT_STATUSES[order.status] : []
  const canPay = order && ['shipping', 'completed'].includes(order.status) && order.payment_status === 'unpaid'

  return <Modal open={Boolean(id)} title={order ? `Đơn hàng ${order.code}` : 'Đơn hàng'} onClose={onClose} wide>
    <Notice notice={notice} />
    {!order ? <p className="py-8 text-center text-[#888]" role="status">Đang tải đơn hàng...</p> : <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-5">
        <Panel title="Sản phẩm"><OrderItemsList items={orderLineItems(order)} /></Panel>
        <Panel title="Giao hàng & khách hàng">
          <div className="grid gap-4 text-sm leading-[1.7] tablet:grid-cols-2">
            <div><p className="font-medium">Người nhận</p><p>{order.recipient.name}</p><p>{order.recipient.phone}</p><p>{order.recipient.email}</p></div>
            <div><p className="font-medium">Địa chỉ</p><p>{order.shipping_address.line}</p><p>{order.shipping_address.ward}, {order.shipping_address.district}</p><p>{order.shipping_address.city}</p></div>
            {order.customer && <div><p className="font-medium">Tài khoản đặt hàng</p><p>{order.customer.name}</p><p>{order.customer.email}</p></div>}
            {order.note && <div><p className="font-medium">Ghi chú của khách</p><p>{order.note}</p></div>}
            {order.cancel_reason && <div><p className="font-medium">Lý do hủy</p><p>{order.cancel_reason}</p></div>}
          </div>
        </Panel>
        <Panel><OrderHistory histories={order.histories} /></Panel>
      </div>
      <div className="flex flex-col gap-5">
        <Panel title="Trạng thái">
          <div className="flex flex-wrap items-center gap-2"><StatusBadge status={order.status} /><Badge tone={order.payment_status === 'paid' ? 'green' : 'amber'}>{PAYMENT_STATUS[order.payment_status]}</Badge></div>
          <p className="mt-2 text-xs text-[#888]">Đặt lúc {formatDateTime(order.created_at)}</p>
          {nextStatuses.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{nextStatuses.map(status => <Button key={status} small tone={ACTION_TONE[status]} onClick={() => choose(status)}>{status === 'cancelled' ? 'Hủy đơn' : `→ ${statusLabel(status)}`}</Button>)}</div>}
          {pending && <div className="mt-4 flex flex-col gap-3 rounded-lg bg-[#f6f6f6] p-3">
            <TextAreaField label={pending === 'cancelled' ? 'Lý do hủy (bắt buộc)' : 'Ghi chú (không bắt buộc)'} rows={2} value={note} onChange={event => setNote(event.target.value)} />
            <div className="flex gap-2"><Button small tone="dark" disabled={busy || (pending === 'cancelled' && !note.trim())} onClick={() => run(adminService.patch('orders', order.id, 'status', { status: pending, note: note.trim() || null }), `Đã chuyển sang "${statusLabel(pending)}".`)}>Xác nhận</Button><Button small onClick={() => setPending(null)}>Bỏ qua</Button></div>
            {pending === 'cancelled' && <p className="text-xs text-[#777]">Hủy đơn sẽ hoàn lại tồn kho và lượt dùng mã giảm giá.</p>}
          </div>}
          {canPay && <Button small tone="primary" className="mt-4" disabled={busy} onClick={() => run(adminService.patch('orders', order.id, 'payment'), 'Đã ghi nhận thu tiền COD.')}>Ghi nhận đã thu tiền COD</Button>}
        </Panel>
        <Panel title="Thanh toán"><OrderTotals subtotal={order.subtotal} shippingFee={order.shipping_fee} discount={order.discount_amount} couponCode={order.coupon_code} total={order.total} /></Panel>
        <Panel title="Ghi chú nội bộ">
          <TextAreaField label="Chỉ quản trị viên nhìn thấy" rows={3} value={adminNote} onChange={event => setAdminNote(event.target.value)} />
          <Button small tone="dark" className="mt-3" disabled={busy || adminNote === (order.admin_note ?? '')} onClick={() => run(adminService.patch('orders', order.id, 'note', { admin_note: adminNote || null }), 'Đã lưu ghi chú nội bộ.')}>Lưu ghi chú</Button>
        </Panel>
      </div>
    </div>}
  </Modal>
}

export default function AdminOrders() {
  const list = useAdminList('orders')
  const [openId, setOpenId] = useState(null)

  const columns = [
    { header: 'Mã đơn', render: row => <button type="button" className="font-mono font-semibold underline-offset-4 hover:underline" onClick={() => setOpenId(row.id)}>{row.code}</button> },
    { header: 'Khách hàng', render: row => <div><p className="font-medium">{row.recipient.name}</p><p className="text-xs text-[#888]">{row.customer?.email}</p></div> },
    { header: 'Ngày đặt', render: row => formatDateTime(row.created_at) },
    { header: 'Tổng tiền', render: row => <span className="font-medium">{formatCurrency(row.total)}</span> },
    { header: 'Thanh toán', render: row => <Badge tone={row.payment_status === 'paid' ? 'green' : 'amber'}>{PAYMENT_STATUS[row.payment_status]}</Badge> },
    { header: 'Trạng thái', render: row => <StatusBadge status={row.status} /> },
    { header: '', className: 'text-right', render: row => <Button small onClick={() => setOpenId(row.id)}>Xem</Button> },
  ]

  return <div>
    <PageHeader title="Đơn hàng" description="Tìm theo mã đơn hoặc khách hàng, lọc theo ngày và trạng thái, xử lý đơn theo quy trình." />
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="relative min-w-[220px] flex-1"><MagnifyingGlass size={16} aria-hidden="true" className="absolute top-1/2 left-3 -translate-y-1/2 text-[#999]" /><input type="search" aria-label="Tìm đơn hàng" placeholder="Tìm theo mã đơn, tên, email, số điện thoại..." value={list.params.q ?? ''} onChange={event => list.setParam('q', event.target.value)} className={`${inputClass} pl-9`} /></div>
      <select aria-label="Lọc theo trạng thái" value={list.params.status ?? ''} onChange={event => list.setParam('status', event.target.value)} className={`${inputClass} w-auto`}><option value="">Mọi trạng thái</option>{ORDER_STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select aria-label="Lọc theo thanh toán" value={list.params.payment_status ?? ''} onChange={event => list.setParam('payment_status', event.target.value)} className={`${inputClass} w-auto`}><option value="">Mọi thanh toán</option>{Object.entries(PAYMENT_STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <input type="date" aria-label="Từ ngày" value={list.params.from ?? ''} onChange={event => list.setParam('from', event.target.value)} className={`${inputClass} w-auto`} />
      <input type="date" aria-label="Đến ngày" value={list.params.to ?? ''} onChange={event => list.setParam('to', event.target.value)} className={`${inputClass} w-auto`} />
    </div>
    {list.error && <Notice notice={{ type: 'error', text: list.error.message }} />}
    <DataTable columns={columns} rows={list.rows} loading={list.loading} empty="Chưa có đơn hàng phù hợp." />
    <div className="mt-5"><Pagination page={list.meta?.current_page ?? 1} pageCount={list.meta?.last_page ?? 1} onChange={list.setPage} /></div>
    <OrderDetail id={openId} onClose={() => setOpenId(null)} onChanged={list.reload} />
  </div>
}
