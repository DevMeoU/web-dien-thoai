import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash } from '@phosphor-icons/react'
import { useShop } from '../../../contexts/shopState'
import { formatCurrency } from '../../../utils/format'

const stepClass = 'flex size-9 items-center justify-center rounded-full border border-[#ddd] bg-white text-black transition-colors duration-200 ease-[ease] hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white motion-reduce:transition-none'

const issues = {
  out_of_stock: 'Sản phẩm này đã hết hàng.',
  unavailable: 'Sản phẩm này không còn được bán.',
}

export default function CartItem({ item }) {
  const { updateCartItem, removeCartItem } = useShop()
  const [error, setError] = useState('')
  const { product, variant } = item
  const options = [variant.configuration, variant.color].filter(Boolean).join(' / ')
  const label = `${product.name}${options ? `, ${options}` : ''}`
  const max = Math.min(item.available_stock, 99)
  const issue = item.issue === 'insufficient_stock' ? `Chỉ còn ${item.available_stock} sản phẩm trong kho.` : issues[item.issue]

  async function run(action) {
    setError('')
    try { await action() } catch (failure) { setError(failure.message) }
  }

  return <li className="flex gap-4 border-b border-[#f1f1f1] py-6 first:pt-0 tablet:gap-6">
    <Link to={`/products/${product.slug}`} className="size-24 shrink-0 overflow-hidden rounded-xl bg-[#f4f4f4] tablet:size-32" aria-label={`Xem ${product.name}`}>
      {product.thumbnail_url && <img className="block h-full w-full object-cover" src={product.thumbnail_url} alt="" width="1254" height="1254" loading="lazy" />}
    </Link>
    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
      <div className="flex flex-col justify-between gap-1 tablet:flex-row tablet:gap-6">
        <div>
          <Link to={`/products/${product.slug}`} className="font-medium hover:underline">{product.name}</Link>
          {options && <p className="mt-1 text-sm text-[#666]">{options}</p>}
          <p className="mt-1 text-sm text-[#666]">{formatCurrency(item.unit_price)}</p>
        </div>
        <p className="font-bold tablet:text-right">{formatCurrency(item.line_total)}</p>
      </div>
      {(issue || error) && <p role="alert" className="text-sm text-red-700">{error || issue}</p>}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3" role="group" aria-label={`Số lượng ${label}`}>
          <button type="button" className={stepClass} aria-label={`Giảm số lượng ${label}`} disabled={item.quantity <= 1} onClick={() => run(() => updateCartItem(item.id, item.quantity - 1))}><Minus size={14} /></button>
          <output className="min-w-6 text-center" aria-live="polite">{item.quantity}</output>
          <button type="button" className={stepClass} aria-label={`Tăng số lượng ${label}`} disabled={item.quantity >= max} onClick={() => run(() => updateCartItem(item.id, item.quantity + 1))}><Plus size={14} /></button>
        </div>
        <button type="button" className="flex items-center gap-1.5 text-sm text-[#555] underline-offset-4 hover:text-black hover:underline" aria-label={`Xóa ${label} khỏi giỏ hàng`} onClick={() => run(() => removeCartItem(item.id))}><Trash size={16} aria-hidden="true" />Xóa</button>
      </div>
    </div>
  </li>
}
