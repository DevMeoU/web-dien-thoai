import CrudPage from '../../../components/admin/CrudPage'
import { Badge, Button } from '../../../components/admin/ui'
import { adminService } from '../../../services/adminService'
import { formatCurrency, formatDate } from '../../../utils/format'

const columns = [
  { header: 'Mã', render: row => <div><p className="font-mono font-semibold">{row.code}</p><p className="text-xs text-[#888]">{row.description}</p></div> },
  { header: 'Mức giảm', render: row => row.type === 'percent' ? `${Number(row.value)}%${row.max_discount ? ` (tối đa ${formatCurrency(row.max_discount)})` : ''}` : formatCurrency(row.value) },
  { header: 'Đơn tối thiểu', render: row => Number(row.min_order_amount) ? formatCurrency(row.min_order_amount) : '—' },
  { header: 'Đã dùng', render: row => `${row.used_count}${row.usage_limit ? ` / ${row.usage_limit}` : ''}` },
  { header: 'Hạn dùng', render: row => row.expires_at ? formatDate(row.expires_at) : 'Không giới hạn' },
  { header: 'Trạng thái', render: row => <Badge tone={row.is_active ? 'green' : 'gray'}>{row.is_active ? 'Đang bật' : 'Đã tắt'}</Badge> },
]

const fields = [
  { name: 'code', label: 'Mã giảm giá', required: true, placeholder: 'THU2026', help: 'Chỉ gồm chữ, số, gạch ngang; tự viết hoa.' },
  { name: 'type', label: 'Loại giảm', type: 'select', required: true, default: 'percent', options: [['percent', 'Theo phần trăm (%)'], ['fixed', 'Số tiền cố định']] },
  { name: 'value', label: 'Giá trị giảm', type: 'number', required: true, min: 0, help: 'Phần trăm (≤ 100) hoặc số tiền.' },
  { name: 'max_discount', label: 'Giảm tối đa', type: 'number', min: 0, help: 'Chỉ áp dụng khi giảm theo phần trăm.' },
  { name: 'min_order_amount', label: 'Giá trị đơn tối thiểu', type: 'number', min: 0, default: 0 },
  { name: 'usage_limit', label: 'Số lượt sử dụng tối đa', type: 'number', min: 1, help: 'Để trống nếu không giới hạn.' },
  { name: 'starts_at', label: 'Bắt đầu từ ngày', type: 'date' },
  { name: 'expires_at', label: 'Hết hạn vào ngày', type: 'date' },
  { name: 'description', label: 'Mô tả', wide: true },
  { name: 'is_active', label: 'Đang bật', type: 'checkbox', default: true },
]

export default function AdminCoupons() {
  return <CrudPage
    resource="coupons" title="Mã giảm giá" singular="mã giảm giá" description="Tạo mã giảm theo phần trăm hoặc số tiền, đặt hạn dùng, đơn tối thiểu và số lượt."
    columns={columns} fields={fields} searchPlaceholder="Tìm mã giảm giá..."
    filters={[{ key: 'is_active', label: 'Mọi trạng thái', options: [['true', 'Đang bật'], ['false', 'Đã tắt']] }]}
    extraActions={(row, reload, notice) => <Button small onClick={async () => {
      try { await adminService.update('coupons', row.id, { is_active: !row.is_active }); notice.success(row.is_active ? 'Đã tắt mã giảm giá.' : 'Đã bật mã giảm giá.'); reload() } catch (error) { notice.fail(error) }
    }}>{row.is_active ? 'Tắt' : 'Bật'}</Button>}
  />
}
