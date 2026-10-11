import CrudPage from '../../../components/admin/CrudPage'
import { Badge } from '../../../components/admin/ui'
import { formatDate } from '../../../utils/format'

const columns = [
  { header: 'Bài viết', render: row => <div className="flex items-center gap-3">{row.image_url ? <img src={row.image_url} alt="" className="h-12 w-16 rounded-lg object-cover" /> : <span className="flex h-12 w-16 items-center justify-center rounded-lg bg-[#f1f1f1] text-xs text-[#999]">Chưa có ảnh</span>}<div><p className="font-medium">{row.title}</p><p className="line-clamp-1 max-w-[320px] text-xs text-[#888]">{row.excerpt}</p></div></div> },
  { header: 'Ngày đăng', render: row => formatDate(row.published_at) },
  { header: 'Trạng thái', render: row => <Badge tone={row.is_published ? 'green' : 'gray'}>{row.is_published ? 'Đã xuất bản' : 'Bản nháp'}</Badge> },
]

const fields = [
  { name: 'title', label: 'Tiêu đề', required: true, wide: true },
  { name: 'slug', label: 'Đường dẫn (slug)', help: 'Để trống để tự tạo từ tiêu đề.' },
  { name: 'published_at', label: 'Ngày đăng', type: 'date', help: 'Để trống để đăng ngay. Đặt ngày sau hôm nay để hẹn giờ.' },
  { name: 'excerpt', label: 'Tóm tắt', type: 'textarea', rows: 2, wide: true },
  { name: 'content', label: 'Nội dung', type: 'textarea', rows: 10, wide: true, help: 'Xuống dòng để tạo đoạn mới.' },
  { name: 'is_published', label: 'Xuất bản cho khách xem', type: 'checkbox', default: true },
]

export default function AdminPosts() {
  return <CrudPage
    resource="posts" title="Bài viết" singular="bài viết" description="Viết bài tư vấn chọn máy, mẹo sử dụng và tin tức hiển thị ở trang Tư vấn & tin tức."
    columns={columns} fields={fields} imageUpload searchPlaceholder="Tìm bài viết..."
    filters={[{ key: 'is_active', label: 'Mọi trạng thái', options: [['true', 'Đã xuất bản'], ['false', 'Bản nháp']] }]}
  />
}
