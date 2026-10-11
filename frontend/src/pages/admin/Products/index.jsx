import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import ProductEditor from '../../../components/admin/ProductEditor'
import { Badge, Button, DataTable, Notice, PageHeader, inputClass } from '../../../components/admin/ui'
import { useAdminList, useNotice } from '../../../components/admin/useAdminList'
import Pagination from '../../../components/user/shopping/Pagination'
import { useAsync } from '../../../hooks/useAsync'
import { adminService } from '../../../services/adminService'
import { invalidateStoreData } from '../../../hooks/useStoreData'
import { formatCurrency } from '../../../utils/format'

const PRODUCT_STATUS = {
  active: ['green', 'Đang bán'],
  hidden: ['amber', 'Tạm ẩn'],
  discontinued: ['gray', 'Ngừng bán'],
}

export default function AdminProducts() {
  const list = useAdminList('products')
  const { data: categories } = useAsync(async () => (await adminService.list('categories', { per_page: 100 })).data, [])
  const { data: brands } = useAsync(async () => (await adminService.list('brands', { per_page: 100 })).data, [])
  const [editing, setEditing] = useState(null)
  const { notice, success, fail, clear } = useNotice()

  async function remove(product) {
    if (!window.confirm(`Xóa sản phẩm "${product.name}"?`)) return
    clear()
    try { await adminService.remove('products', product.id); invalidateStoreData(); success('Đã xóa sản phẩm.'); list.reload() } catch (error) { fail(error) }
  }

  const columns = [
    { header: 'Sản phẩm', render: row => <div className="flex items-center gap-3">{row.thumbnail_url ? <img src={row.thumbnail_url} alt="" className="size-12 rounded-lg object-cover" /> : <span className="size-12 rounded-lg bg-[#f1f1f1]" />}<div><p className="font-medium">{row.name}</p><p className="text-xs text-[#888]">{row.code}</p></div></div> },
    { header: 'Danh mục', render: row => <div><p>{row.category?.name ?? '—'}</p><p className="text-xs text-[#888]">{row.brand?.name}</p></div> },
    { header: 'Giá bán', render: row => <div><p className="font-medium">{formatCurrency(row.price)}</p>{row.is_on_sale && <p className="text-xs text-[#999] line-through">{formatCurrency(row.compare_at_price)}</p>}</div> },
    { header: 'Tồn kho', render: row => <span className={row.total_stock === 0 ? 'font-medium text-red-700' : ''}>{row.total_stock}</span> },
    { header: 'Trạng thái', render: row => { const [tone, label] = PRODUCT_STATUS[row.status]; return <div className="flex flex-wrap gap-1"><Badge tone={tone}>{label}</Badge>{row.is_new && <Badge tone="blue">Mới</Badge>}{row.is_featured && <Badge tone="indigo">Nổi bật</Badge>}</div> } },
    { header: 'Thao tác', className: 'text-right', render: row => <div className="flex justify-end gap-2"><Button small onClick={() => { clear(); setEditing(row) }}>Sửa</Button><Button small tone="danger" onClick={() => remove(row)}>Xóa</Button></div> },
  ]

  return <div>
    <PageHeader title="Sản phẩm" description="Thêm, sửa sản phẩm, quản lý ảnh, phiên bản (dung lượng/cấu hình × màu), thông số kỹ thuật và trạng thái bán." actions={<Button tone="primary" onClick={() => { clear(); setEditing('new') }}>Thêm sản phẩm</Button>} />
    <Notice notice={notice} />
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="relative min-w-[220px] flex-1"><MagnifyingGlass size={16} aria-hidden="true" className="absolute top-1/2 left-3 -translate-y-1/2 text-[#999]" /><input type="search" aria-label="Tìm sản phẩm" placeholder="Tìm theo tên hoặc mã sản phẩm..." value={list.params.q ?? ''} onChange={event => list.setParam('q', event.target.value)} className={`${inputClass} pl-9`} /></div>
      <select aria-label="Lọc theo danh mục" value={list.params.category ?? ''} onChange={event => list.setParam('category', event.target.value)} className={`${inputClass} w-auto`}><option value="">Mọi danh mục</option>{(categories ?? []).map(category => <option key={category.id} value={category.id}>{category.parent ? `— ${category.name}` : category.name}</option>)}</select>
      <select aria-label="Lọc theo trạng thái" value={list.params.status ?? ''} onChange={event => list.setParam('status', event.target.value)} className={`${inputClass} w-auto`}><option value="">Mọi trạng thái</option>{Object.entries(PRODUCT_STATUS).map(([value, [, label]]) => <option key={value} value={value}>{label}</option>)}</select>
    </div>
    {list.error && <Notice notice={{ type: 'error', text: list.error.message }} />}
    <DataTable columns={columns} rows={list.rows} loading={list.loading} empty="Chưa có sản phẩm phù hợp." />
    <div className="mt-5"><Pagination page={list.meta?.current_page ?? 1} pageCount={list.meta?.last_page ?? 1} onChange={list.setPage} /></div>
    <ProductEditor target={editing} categories={categories ?? []} brands={brands ?? []} onClose={() => setEditing(null)} onChanged={() => { invalidateStoreData(); list.reload() }} onMessage={success} />
  </div>
}
