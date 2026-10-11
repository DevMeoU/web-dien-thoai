import { MagnifyingGlass, SlidersHorizontal, X } from '@phosphor-icons/react'
import { sortOptions } from './catalog'

export default function CatalogToolbar({ filters, count, onChange, onOpenFilters, activeCount }) {
  return <div className="mb-6 flex flex-col gap-4 desktop:mb-7">
    <div className="flex flex-col gap-3 tablet:flex-row">
      <div className="relative flex h-11 min-h-11 min-w-0 items-center gap-2.5 rounded-lg bg-[#f4f4f4] px-3.5 tablet:flex-1">
        <MagnifyingGlass size={19} aria-hidden="true" className="shrink-0 text-[#777]" />
        <input type="search" aria-label="Tìm trong danh sách sản phẩm" placeholder="Tìm sản phẩm bạn yêu thích..." value={filters.q} onChange={event => onChange('q', event.target.value)} className="w-0 min-w-0 flex-1 bg-transparent text-sm outline-none" />
        {filters.q && <button type="button" aria-label="Xóa từ khóa tìm kiếm" onClick={() => onChange('q', '')} className="flex size-6 shrink-0 items-center justify-center text-[#777]"><X size={16} /></button>}
      </div>
      <select value={filters.sort} aria-label="Sắp xếp sản phẩm" onChange={event => onChange('sort', event.target.value)} className="h-11 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 text-sm tablet:w-[190px]">
        {sortOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
    <div className="flex min-h-8 items-center justify-between gap-3">
      <p role="status" aria-live="polite" className="text-sm text-[#777]">{count} sản phẩm</p>
      <button type="button" onClick={onOpenFilters} className="flex min-h-10 items-center gap-2 rounded-lg border border-[#e5e5e5] px-3 text-sm tablet:hidden"><SlidersHorizontal size={18} />Bộ lọc{activeCount > 0 && <span className="flex size-5 items-center justify-center rounded-full bg-black text-[11px] text-white">{activeCount}</span>}</button>
    </div>
  </div>
}
