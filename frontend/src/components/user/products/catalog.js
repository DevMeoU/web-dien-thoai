import { normalizeSearch } from '../../../utils/search'

export const collections = [
  { value: '', label: 'Tất cả' }, { value: 'work', label: 'Làm việc' },
  { value: 'student', label: 'Học tập' }, { value: 'creative', label: 'Sáng tạo' },
]

export const priceRanges = [
  { value: '', label: 'Tất cả mức giá', min: 0, max: Infinity },
  { value: 'under-5', label: 'Dưới 5 triệu', min: 0, max: 5000000 },
  { value: '5-15', label: '5 đến dưới 15 triệu', min: 5000000, max: 15000000 },
  { value: '15-30', label: '15 đến dưới 30 triệu', min: 15000000, max: 30000000 },
  { value: 'over-30', label: 'Từ 30 triệu', min: 30000000, max: Infinity },
]

export const sortOptions = [
  { value: '', label: 'Mới nhất' }, { value: 'price-asc', label: 'Giá: thấp đến cao' },
  { value: 'price-desc', label: 'Giá: cao đến thấp' }, { value: 'name', label: 'Tên: A đến Z' },
]

/** Danh sách màu hiện có trong các sản phẩm, kèm mã màu để vẽ ô chọn. */
export function colorOptions(products) {
  const seen = new Map()
  for (const product of products) {
    for (const color of product.colors) if (!seen.has(color.value)) seen.set(color.value, { value: color.value, label: color.value, swatch: color.hex ?? '#ddd' })
  }
  return [...seen.values()]
}

/** Dung lượng / cấu hình hiện có trong các sản phẩm, xếp theo thứ tự tự nhiên (128GB, 256GB, 1TB...). */
export function configurationOptions(products) {
  const unit = value => /TB/i.test(value) ? 1000 : 1
  const rank = value => (parseFloat(String(value).replace(',', '.')) || 0) * unit(value)
  return [...new Set(products.flatMap(product => product.configurations))]
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, 'vi', { numeric: true }))
}

/** Tùy chọn danh mục (cha rồi con) và nhóm slug để lọc: chọn danh mục cha thì gồm cả danh mục con. */
export function buildCategoryOptions(tree) {
  const options = [{ value: '', label: 'Tất cả sản phẩm' }]
  const groups = {}
  for (const root of tree) {
    const children = root.children ?? []
    groups[root.slug] = [root.slug, ...children.map(child => child.slug)]
    options.push({ value: root.slug, label: root.name })
    for (const child of children) {
      groups[child.slug] = [child.slug]
      options.push({ value: child.slug, label: child.name, depth: 1 })
    }
  }
  return { options, groups }
}

export function selectProducts(products, filters, groups = {}) {
  const range = priceRanges.find(item => item.value === filters.price) ?? priceRanges[0]
  const query = normalizeSearch(filters.q)
  const categories = filters.category ? groups[filters.category] ?? [filters.category] : null
  const result = products.filter(product =>
    (!filters.collection || product.collections.includes(filters.collection)) &&
    (!categories || categories.includes(product.category)) &&
    (!filters.config || product.configurations.includes(filters.config)) &&
    (!filters.color || product.colors.some(color => color.value === filters.color)) &&
    product.amount >= range.min && product.amount < range.max &&
    (!query || normalizeSearch(product.name).includes(query)),
  )
  if (filters.sort === 'price-asc') result.sort((a, b) => a.amount - b.amount)
  if (filters.sort === 'price-desc') result.sort((a, b) => b.amount - a.amount)
  if (filters.sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
  return result
}
