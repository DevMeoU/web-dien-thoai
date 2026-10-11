import CrudPage from '../../../components/admin/CrudPage'
import { Badge } from '../../../components/admin/ui'

const columns = [
  { header: 'Thương hiệu', render: row => <div className="flex items-center gap-3">{row.image_url && <img src={row.image_url} alt="" className="size-10 rounded-lg object-cover" />}<div><p className="font-medium">{row.name}</p><p className="text-xs text-[#888]">{row.slug}</p></div></div> },
  { header: 'Sản phẩm', render: row => row.products_count },
  { header: 'Thứ tự', render: row => row.sort_order },
  { header: 'Hiển thị', render: row => <Badge tone={row.is_active ? 'green' : 'gray'}>{row.is_active ? 'Đang hiển thị' : 'Đang ẩn'}</Badge> },
]

const fields = [
  { name: 'name', label: 'Tên thương hiệu', required: true },
  { name: 'sort_order', label: 'Thứ tự hiển thị', type: 'number', min: 0, default: 0 },
  { name: 'is_active', label: 'Hiển thị trên cửa hàng', type: 'checkbox', default: true },
  { name: 'description', label: 'Mô tả', type: 'textarea', wide: true },
]

export default function AdminBrands() {
  return <CrudPage
    resource="brands" title="Thương hiệu" singular="thương hiệu" description="Quản lý các thương hiệu của sản phẩm."
    columns={columns} fields={fields} imageUpload searchPlaceholder="Tìm thương hiệu..."
    filters={[{ key: 'is_active', label: 'Mọi trạng thái', options: [['true', 'Đang hiển thị'], ['false', 'Đang ẩn']] }]}
  />
}
