import { useMemo } from 'react'
import { X } from '@phosphor-icons/react'
import { useCategories } from '../../../hooks/useStoreData'
import { buildCategoryOptions, priceRanges } from './catalog'

export default function ActiveFilters({ filters, onChange, onReset }) {
  const tree = useCategories()
  const categories = useMemo(() => buildCategoryOptions(tree).options, [tree])
  const active = [
    { key: 'category', label: categories.find(item => item.value === filters.category)?.label },
    { key: 'price', label: priceRanges.find(item => item.value === filters.price)?.label },
    { key: 'config', label: filters.config },
    { key: 'color', label: filters.color },
  ].filter(item => filters[item.key] && item.label)
  if (!active.length) return null
  return <div className="mb-6 flex flex-wrap items-center gap-2" aria-label="Bộ lọc đang áp dụng">
    {active.map(item => <button key={item.key} type="button" aria-label={`Bỏ bộ lọc ${item.label}`} onClick={() => onChange(item.key, '')} className="flex min-h-8 items-center gap-2 rounded-full bg-[#f4f4f4] px-3 text-xs">{item.label}<X size={12} aria-hidden="true" /></button>)}
    <button type="button" onClick={onReset} className="px-2 text-xs text-[#777] underline underline-offset-4 hover:text-black">Xóa bộ lọc</button>
  </div>
}
