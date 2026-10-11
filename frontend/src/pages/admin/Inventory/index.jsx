import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { Badge, Button, DataTable, Notice, PageHeader, inputClass } from '../../../components/admin/ui'
import { useAdminList, useNotice } from '../../../components/admin/useAdminList'
import Pagination from '../../../components/user/shopping/Pagination'
import { adminService } from '../../../services/adminService'
import { invalidateStoreData } from '../../../hooks/useStoreData'

export default function AdminInventory() {
  const list = useAdminList('inventory', {}, 20)
  const [edits, setEdits] = useState({})
  const { notice, success, fail, clear } = useNotice()

  async function save(row) {
    clear()
    try {
      await adminService.setStock(row.id, Number(edits[row.id]))
      setEdits(previous => { const next = { ...previous }; delete next[row.id]; return next })
      invalidateStoreData()
      success(`Đã cập nhật tồn kho ${row.sku}.`)
      list.reload()
    } catch (error) { fail(error) }
  }

  const columns = [
    { header: 'Sản phẩm', render: row => <div><p className="font-medium">{row.product?.name}</p><p className="font-mono text-xs text-[#888]">{row.sku}</p></div> },
    { header: 'Lựa chọn', render: row => [row.configuration, row.color].filter(Boolean).join(' / ') || '—' },
    { header: 'Tình trạng', render: row => row.stock === 0 ? <Badge tone="red">Hết hàng</Badge> : row.stock <= 5 ? <Badge tone="amber">Sắp hết</Badge> : <Badge tone="green">Còn hàng</Badge> },
    { header: 'Tồn kho', render: row => <input type="number" min="0" aria-label={`Tồn kho ${row.sku}`} value={edits[row.id] ?? row.stock} onChange={event => setEdits({ ...edits, [row.id]: event.target.value })} className="w-24 rounded-lg border border-[#ddd] px-2 py-1.5" /> },
    { header: 'Thao tác', className: 'text-right', render: row => edits[row.id] !== undefined && Number(edits[row.id]) !== row.stock ? <Button small tone="dark" onClick={() => save(row)}>Lưu</Button> : null },
  ]

  return <div>
    <PageHeader title="Tồn kho" description="Theo dõi và cập nhật số lượng tồn của từng phiên bản (cấu hình × màu). Tồn kho tự giảm khi đặt hàng và hoàn lại khi hủy đơn." />
    <Notice notice={notice} />
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="relative min-w-[220px] flex-1"><MagnifyingGlass size={16} aria-hidden="true" className="absolute top-1/2 left-3 -translate-y-1/2 text-[#999]" /><input type="search" aria-label="Tìm theo SKU hoặc tên sản phẩm" placeholder="Tìm theo SKU hoặc tên sản phẩm..." value={list.params.q ?? ''} onChange={event => list.setParam('q', event.target.value)} className={`${inputClass} pl-9`} /></div>
      <select aria-label="Lọc theo tồn kho" value={list.params.stock_status ?? ''} onChange={event => list.setParam('stock_status', event.target.value)} className={`${inputClass} w-auto`}><option value="">Tất cả</option><option value="low">Sắp hết hàng</option><option value="out">Hết hàng</option></select>
    </div>
    <DataTable columns={columns} rows={list.rows} loading={list.loading} empty="Không có dòng tồn kho phù hợp." />
    <div className="mt-5"><Pagination page={list.meta?.current_page ?? 1} pageCount={list.meta?.last_page ?? 1} onChange={list.setPage} /></div>
  </div>
}
