import { useId, useMemo } from 'react'
import { useCategories } from '../../../hooks/useStoreData'
import { buildCategoryOptions, colorOptions, priceRanges, configurationOptions } from './catalog'

export default function ProductFilters({ filters, products, onChange, onReset }) {
  const id = useId()
  const tree = useCategories()
  const { options: categories, groups } = useMemo(() => buildCategoryOptions(tree), [tree])
  const colors = useMemo(() => colorOptions(products), [products])
  const configs = useMemo(() => configurationOptions(products), [products])
  return <div>
    <div className="mb-7 flex items-center justify-between gap-3">
      <h2 className="text-lg font-medium">Bộ lọc</h2>
      <button type="button" onClick={onReset} className="text-xs text-[#777] underline underline-offset-4 hover:text-black">Đặt lại</button>
    </div>
    <fieldset className="border-b border-[#e8e8e8] pb-7">
      <legend className="mb-4 text-sm font-medium">Danh mục</legend>
      <div className="flex flex-col gap-3">
        {categories.map(category => <label key={category.value} className="flex cursor-pointer items-center gap-3 text-sm">
          <input type="radio" name={`${id}-category`} checked={filters.category === category.value} onChange={() => onChange('category', category.value)} className="size-4 accent-black" />
          <span className={`${category.depth ? 'pl-3 ' : ''}${filters.category === category.value ? 'font-medium' : 'text-[#666]'}`}>{category.label}</span>
          <span aria-hidden="true" className="ml-auto text-xs text-[#999]">{products.filter(product => !category.value || (groups[category.value] ?? []).includes(product.category)).length}</span>
        </label>)}
      </div>
    </fieldset>
    <div className="border-b border-[#e8e8e8] py-7">
      <label htmlFor={`${id}-price`} className="mb-4 block text-sm font-medium">Khoảng giá</label>
      <select id={`${id}-price`} value={filters.price} onChange={event => onChange('price', event.target.value)} className="min-h-11 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 text-sm">
        {priceRanges.map(range => <option key={range.value} value={range.value}>{range.label}</option>)}
      </select>
    </div>
    <fieldset className="border-b border-[#e8e8e8] py-7">
      <legend className="float-left mb-4 w-full text-sm font-medium">Dung lượng / cấu hình</legend>
      <div className="clear-both flex flex-wrap gap-2.5">
        {configs.map(config => <button key={config} type="button" aria-pressed={filters.config === config} onClick={() => onChange('config', filters.config === config ? '' : config)} className={`flex min-h-10 min-w-11 items-center justify-center rounded-lg border px-3 text-xs transition-colors motion-reduce:transition-none ${filters.config === config ? 'border-black bg-[#f4f4f4]' : 'border-[#e8e8e8] hover:border-[#aaa]'}`}>{config}</button>)}
      </div>
    </fieldset>
    <fieldset className="pt-7">
      <legend className="float-left mb-4 w-full text-sm font-medium">Màu sắc</legend>
      <div className="clear-both grid grid-cols-2 gap-2.5">
        {colors.map(color => <button key={color.value} type="button" aria-pressed={filters.color === color.value} onClick={() => onChange('color', filters.color === color.value ? '' : color.value)} className={`flex min-h-10 items-center gap-2 rounded-lg border px-2 text-xs transition-colors motion-reduce:transition-none ${filters.color === color.value ? 'border-black bg-[#f4f4f4]' : 'border-[#e8e8e8] hover:border-[#aaa]'}`}>
          <span aria-hidden="true" className="size-3.5 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: color.swatch }} />{color.label}
        </button>)}
      </div>
    </fieldset>
  </div>
}
