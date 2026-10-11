import CrudPage from '../../../components/admin/CrudPage'
import { Badge } from '../../../components/admin/ui'
import { formatDateTime } from '../../../utils/format'

const columns = [
  { header: 'Email', render: row => <span className="font-medium">{row.email}</span> },
  { header: 'Ngày đăng ký', render: row => formatDateTime(row.created_at) },
  { header: 'Trạng thái', render: row => <Badge tone={row.is_active ? 'green' : 'gray'}>{row.is_active ? 'Đang nhận tin' : 'Đã tắt'}</Badge> },
]

export default function AdminNewsletter() {
  return <CrudPage
    resource="newsletter-subscribers" title="Đăng ký nhận tin" singular="email" description="Danh sách email khách hàng đăng ký nhận tin và ưu đãi ở cuối trang chủ."
    columns={columns} fields={[]} allowCreate={false} allowEdit={false} searchPlaceholder="Tìm email..."
  />
}
