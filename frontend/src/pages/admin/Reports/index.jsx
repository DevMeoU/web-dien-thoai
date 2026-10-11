import { useState } from 'react'
import { BarChart, HorizontalBars } from '../../../components/admin/Charts'
import { Button, DataTable, Notice, PageHeader, Panel, StatCard, inputClass } from '../../../components/admin/ui'
import { useNotice } from '../../../components/admin/useAdminList'
import { statusLabel } from '../../../components/user/orders/orderStatus'
import { useAsync } from '../../../hooks/useAsync'
import { adminService } from '../../../services/adminService'
import { formatCurrency as fullMoney } from '../../../utils/format'

const isoDay = date => date.toISOString().slice(0, 10)
const defaultRange = () => ({ from: isoDay(new Date(Date.now() - 29 * 86400000)), to: isoDay(new Date()) })
const EXPORTS = [['orders', 'Đơn hàng'], ['products', 'Sản phẩm bán chạy'], ['customers', 'Khách mua nhiều'], ['revenue', 'Doanh thu theo ngày']]

export default function AdminReports() {
  const [range, setRange] = useState(defaultRange)
  const { data, loading, error } = useAsync(() => adminService.report(range), [range.from, range.to])
  const { notice, fail, clear } = useNotice()
  const [exporting, setExporting] = useState('')
  const report = data?.data

  async function download(type) {
    clear()
    setExporting(type)
    try { await adminService.exportReport({ ...range, type }) } catch (failure) { fail(failure) } finally { setExporting('') }
  }

  return <div>
    <PageHeader title="Báo cáo & thống kê" description="Doanh thu đơn hoàn tất, số đơn theo trạng thái, sản phẩm bán chạy, khách mua nhiều và tồn kho." actions={<div className="flex flex-wrap gap-2">
      <input type="date" aria-label="Từ ngày" value={range.from} max={range.to} onChange={event => setRange({ ...range, from: event.target.value })} className={`${inputClass} w-auto`} />
      <input type="date" aria-label="Đến ngày" value={range.to} min={range.from} onChange={event => setRange({ ...range, to: event.target.value })} className={`${inputClass} w-auto`} />
    </div>} />
    <Notice notice={notice} />
    {error && <Notice notice={{ type: 'error', text: error.message }} />}
    {loading && !report && <p className="py-10 text-center text-[#888]" role="status">Đang tải báo cáo...</p>}
    {report && <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Doanh thu (đơn hoàn tất)" value={fullMoney(report.revenue)} />
        <StatCard label="Tổng số đơn" value={Object.values(report.orders_by_status).reduce((total, value) => total + value, 0)} />
        <StatCard label="Tồn kho hiện tại" value={report.inventory.total_units} hint="Số sản phẩm đang bán" />
        <StatCard label="Sắp hết / hết hàng" value={`${report.inventory.low_stock} / ${report.inventory.out_of_stock}`} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Doanh thu theo ngày"><BarChart label="Doanh thu theo ngày" data={report.daily.map(item => ({ label: item.date.slice(5).split('-').reverse().join('/'), value: item.revenue }))} format={fullMoney} /></Panel>
        <Panel title="Số đơn theo trạng thái"><HorizontalBars data={Object.entries(report.orders_by_status).map(([status, value]) => ({ label: statusLabel(status), value }))} /></Panel>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Sản phẩm bán chạy"><DataTable rows={report.top_products} rowKey={row => row.product_id} empty="Chưa có đơn hoàn tất trong kỳ." columns={[
          { header: 'Sản phẩm', render: row => row.product_name }, { header: 'Đã bán', render: row => row.quantity_sold }, { header: 'Doanh thu', render: row => fullMoney(row.revenue) },
        ]} /></Panel>
        <Panel title="Khách mua nhiều"><DataTable rows={report.top_customers} rowKey={row => row.user_id} empty="Chưa có đơn hoàn tất trong kỳ." columns={[
          { header: 'Khách hàng', render: row => <div><p className="font-medium">{row.name}</p><p className="text-xs text-[#888]">{row.email}</p></div> }, { header: 'Số đơn', render: row => row.orders_count }, { header: 'Tổng chi tiêu', render: row => fullMoney(row.total_spent) },
        ]} /></Panel>
      </div>
      <Panel title="Xuất dữ liệu CSV" actions={<span className="text-xs text-[#888]">Theo khoảng ngày đang chọn</span>}>
        <div className="flex flex-wrap gap-3">{EXPORTS.map(([type, label]) => <Button key={type} disabled={Boolean(exporting)} onClick={() => download(type)}>{exporting === type ? 'Đang xuất...' : `Xuất ${label}`}</Button>)}</div>
      </Panel>
    </div>}
  </div>
}
