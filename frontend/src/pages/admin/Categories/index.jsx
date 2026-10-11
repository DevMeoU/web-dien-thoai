import CrudPage from '../../../components/admin/CrudPage'
import { Badge } from '../../../components/admin/ui'
import { adminService } from '../../../services/adminService'

const columns = [
  { header: 'Danh mục', render: row => <div className="flex items-center gap-3">{row.image_url && <img src={row.image_url} alt="" className="size-10 rounded-lg object-cover" />}<div><p className="font-medium">{row.name}</p><p className="text-xs text-[#888]">{row.slug}</p></div></div> },
  { header: 'Danh mục cha', render: row => row.parent?.name ?? <span className="text-[#aaa]">Danh mục gốc</span> },
  { header: 'Sản phẩm', render: row => row.products_count },
  { header: 'Thứ tự', render: row => row.sort_order },
  { header: 'Hiển thị', render: row => <Badge tone={row.is_active ? 'green' : 'gray'}>{row.is_active ? 'Đang hiển thị' : 'Đang ẩn'}</Badge> },
]

const fields = [
  { name: 'name', label: 'Tên danh mục', required: true },
  { name: 'parent_id', label: 'Danh mục cha', type: 'select', placeholder: '— Danh mục gốc —', help: 'Chỉ hỗ trợ hai cấp: cha và con.', options: context => (context ?? []).map(category => [category.id, category.name]) },
  { name: 'sort_order', label: 'Thứ tự hiển thị', type: 'number', min: 0, default: 0 },
  { name: 'is_active', label: 'Hiển thị trên cửa hàng', type: 'checkbox', default: true },
  { name: 'description', label: 'Mô tả', type: 'textarea', wide: true },
]

export default function AdminCategories() {
  return <CrudPage
    resource="categories" title="Danh mục" singular="danh mục" description="Phân loại sản phẩm theo dòng sản phẩm: iPhone, Mac, iPad, Apple Watch, AirPods, phụ kiện (hai cấp cha - con)."
    columns={columns} fields={fields} imageUpload searchPlaceholder="Tìm danh mục..."
    filters={[{ key: 'is_active', label: 'Mọi trạng thái', options: [['true', 'Đang hiển thị'], ['false', 'Đang ẩn']] }]}
    loadContext={async () => (await adminService.list('categories', { per_page: 100 })).data.filter(category => !category.parent_id)}
  />
}
