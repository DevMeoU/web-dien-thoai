import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart } from '../../../components/admin/Charts'
import { Badge, DataTable, Notice, PageHeader, Panel, StatCard, inputClass } from '../../../components/admin/ui'
import StatusBadge from '../../../components/user/orders/StatusBadge'
import { useAsync } from '../../../hooks/useAsync'
import { adminService } from '../../../services/adminService'
import { formatCurrency as fullMoney, formatDateTime } from '../../../utils/format'

const isoDay = date => date.toISOString().slice(0, 10)
const today = () => isoDay(new Date())
const daysAgo = days => isoDay(new Date(Date.now() - days * 86400000))

export default function AdminDashboard() {
  const [range, setRange] = useState({ from: daysAgo(29), to: today() })
  const { data, loading, error } = useAsync(() => adminService.dashboard(range), [range.from, range.to])
  const dashboard = data?.data

  const presets = [['7 ngày', 6], ['30 ngày', 29], ['90 ngày', 89]]
  const label = date => date.slice(5).split('-').reverse().join('/')

  return <div>
    <PageHeader title="Bảng điều khiển" description="Tổng quan khách hàng, sản phẩm, đơn hàng và doanh thu từ đơn đã hoàn tất." actions={<div className="flex flex-wrap items-center gap-2">
      {presets.map(([text, days]) => <button key={text} type="button" onClick={() => setRange({ from: daysAgo(days), to: today() })} className="rounded-lg border border-[#ddd] bg-white px-3 py-2 text-sm hover:bg-[#f4f4f4]">{text}</button>)}
      <input type="date" aria-label="Từ ngày" value={range.from} max={range.to} onChange={event => setRange({ ...range, from: event.target.value })} className={`${inputClass} w-auto`} />
      <input type="date" aria-label="Đến ngày" value={range.to} min={range.from} onChange={event => setRange({ ...range, to: event.target.value })} className={`${inputClass} w-auto`} />
    </div>} />
    {error && <Notice notice={{ type: 'error', text: error.message }} />}
    {loading && !dashboard && <p className="py-10 text-center text-[#888]" role="status">Đang tải số liệu...</p>}
    {dashboard && <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Khách hàng" value={dashboard.customers_count} />
        <StatCard label="Sản phẩm" value={dashboard.products_count} />
        <StatCard label="Đơn mới trong kỳ" value={dashboard.new_orders_count} />
        <StatCard label="Đơn chờ xử lý" value={dashboard.pending_orders_count} hint="Toàn bộ thời gian" />
        <StatCard label="Doanh thu" value={fullMoney(dashboard.revenue)} hint="Đơn hoàn tất trong kỳ" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Doanh thu theo ngày"><BarChart label="Doanh thu theo ngày" data={dashboard.chart.map(item => ({ label: label(item.date), value: item.revenue }))} format={fullMoney} /></Panel>
        <Panel title="Số đơn mới theo ngày"><BarChart label="Số đơn mới theo ngày" color="#454545" data={dashboard.chart.map(item => ({ label: label(item.date), value: item.orders }))} /></Panel>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="Đơn hàng gần nhất" actions={<Link to="/admin/orders" className="text-sm underline underline-offset-4">Xem tất cả</Link>}>
          <DataTable rows={dashboard.recent_orders} columns={[
            { header: 'Mã đơn', render: row => <span className="font-mono">{row.code}</span> },
            { header: 'Khách', render: row => row.recipient.name },
            { header: 'Thời gian', render: row => formatDateTime(row.created_at) },
            { header: 'Tổng', render: row => fullMoney(row.total) },
            { header: 'Trạng thái', render: row => <StatusBadge status={row.status} /> },
          ]} />
        </Panel>
        <Panel title="Sản phẩm sắp hết hàng" actions={<Link to="/admin/inventory" className="text-sm underline underline-offset-4">Quản lý kho</Link>}>
          {dashboard.low_stock.length === 0 ? <p className="text-sm text-[#888]">Không có sản phẩm nào sắp hết hàng.</p> : <ul className="divide-y divide-[#f1f1f1] text-sm">
            {dashboard.low_stock.map(item => <li key={item.id} className="flex items-center justify-between gap-3 py-2.5"><span><span className="font-medium">{item.product?.name}</span><span className="block text-xs text-[#888]">{[item.configuration, item.color].filter(Boolean).join(' / ')} · {item.sku}</span></span><Badge tone={item.stock === 0 ? 'red' : 'amber'}>Còn {item.stock}</Badge></li>)}
          </ul>}
        </Panel>
      </div>
    </div>}
  </div>
}
