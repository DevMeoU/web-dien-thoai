import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Minus, Plus, Star } from '@phosphor-icons/react'
import { useAuth } from '../../../contexts/authState'
import { useShop } from '../../../contexts/shopState'
import { formatCurrency } from '../../../utils/format'
import WishlistButton from '../WishlistButton'

const chip = (active, disabled) => `min-h-10 min-w-12 rounded-full border px-4 text-sm transition-colors ${active ? 'border-black bg-black text-white' : 'border-[#ddd] hover:border-black'} ${disabled ? 'opacity-40 line-through' : ''}`

export default function ProductInformation({ product, detail, onVariantImageChange }) {
  const { user } = useAuth()
  const { addToCart } = useShop()
  const navigate = useNavigate()
  const location = useLocation()
  const variants = detail.variants
  const configurations = useMemo(() => [...new Set(variants.map(variant => variant.configuration).filter(Boolean))], [variants])
  const colors = useMemo(() => [...new Set(variants.map(variant => variant.color).filter(Boolean))], [variants])
  const firstInStock = variants.find(variant => variant.stock > 0) ?? variants[0]
  const [configuration, setConfiguration] = useState(firstInStock?.configuration ?? '')
  const [color, setColor] = useState(firstInStock?.color ?? '')
  const [quantity, setQuantity] = useState(1)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const variant = variants.find(item => (item.configuration ?? '') === configuration && (item.color ?? '') === color)
  const stock = variant?.stock ?? 0
  const price = variant ? Number(variant.price) : product.amount
  const maxQuantity = Math.max(1, Math.min(stock, 99))
  const sold = !product.available
  const selectedQuantity = Math.min(quantity, maxQuantity)
  useEffect(() => { onVariantImageChange(variant?.image_url ?? null) }, [variant?.image_url, onVariantImageChange])
  const information = [
    ['Trong hộp có gì?', detail.in_the_box || 'Nội dung trong hộp đang được cập nhật.'],
    ['Bảo hành', detail.warranty || 'Xem chính sách bảo hành của cửa hàng.'],
  ]

  async function add(buyNow) {
    setError('')
    setNotice('')
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    if (!variant) {
      setError('Vui lòng chọn cấu hình và màu sắc có sẵn.')
      return
    }
    setBusy(true)
    try {
      await addToCart(variant.id, selectedQuantity)
      if (buyNow) navigate('/cart')
      else setNotice(`Đã thêm ${selectedQuantity} × ${product.name} vào giỏ hàng.`)
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  return <div>
    <h1 className="text-2xl leading-[1.25] font-medium desktop:text-[28px]">{product.name}</h1>
    {product.tagline && <p className="mt-2 leading-[1.6] text-[#666]">{product.tagline}</p>}
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#666]">
      {product.code && <span>Mã: {product.code}</span>}
      {product.ratingCount > 0 && <span className="flex items-center gap-1"><Star size={14} weight="fill" aria-hidden="true" />{product.rating.toFixed(1)} ({product.ratingCount} đánh giá)</span>}
    </div>
    <p className="mt-3 flex flex-wrap items-baseline gap-x-3 text-lg font-medium">{formatCurrency(price)}{product.comparePrice && <span className="text-base font-normal text-[#999] line-through">{product.comparePrice}</span>}{product.onSale && <span className="rounded-full bg-black px-2.5 py-0.5 text-xs text-white">−{product.discountPercent}%</span>}</p>

    <div className="mt-8 flex flex-col gap-6 border-t border-[#f1f1f1] pt-6">
      {colors.length > 0 && <div><p className="mb-3 text-sm font-medium">Màu sắc: <span className="font-normal text-[#666]">{color}</span></p>
        <div className="flex flex-wrap gap-2">{colors.map(value => <button key={value} type="button" aria-pressed={color === value} onClick={() => { setColor(value); setQuantity(1) }} className={`${chip(color === value)} inline-flex items-center gap-2`}><span className="size-3.5 rounded-full border border-black/10" style={{ backgroundColor: variants.find(item => item.color === value)?.color_hex ?? '#ddd' }} aria-hidden="true" />{value}</button>)}</div></div>}
      {configurations.length > 0 && <div><p className="mb-3 text-sm font-medium">{detail.option_label || 'Dung lượng / cấu hình'}</p>
        <div className="flex flex-wrap gap-2">{configurations.map(value => {
          const match = variants.find(item => item.configuration === value && (item.color ?? '') === color)
          return <button key={value} type="button" aria-pressed={configuration === value} onClick={() => { setConfiguration(value); setQuantity(1) }} className={chip(configuration === value, !match || match.stock <= 0)}>{value}</button>
        })}</div></div>}

      <p className="text-sm" role="status">{sold ? 'Sản phẩm đã ngừng bán.' : !variant ? 'Phiên bản này không có sẵn.' : stock <= 0 ? 'Hết hàng' : stock <= 5 ? `Chỉ còn ${stock} sản phẩm` : `Còn hàng (${stock})`}</p>

      <div className="flex items-center gap-3" role="group" aria-label="Số lượng">
        <button type="button" aria-label="Giảm số lượng" disabled={selectedQuantity <= 1} onClick={() => setQuantity(selectedQuantity - 1)} className="flex size-10 items-center justify-center rounded-full border border-[#ddd] disabled:opacity-40"><Minus size={14} /></button>
        <output className="min-w-8 text-center" aria-live="polite">{selectedQuantity}</output>
        <button type="button" aria-label="Tăng số lượng" disabled={selectedQuantity >= maxQuantity || stock <= 0} onClick={() => setQuantity(selectedQuantity + 1)} className="flex size-10 items-center justify-center rounded-full border border-[#ddd] disabled:opacity-40"><Plus size={14} /></button>
      </div>

      <div className="flex gap-3">
        <button type="button" disabled={busy || sold || stock <= 0} onClick={() => add(false)} className="min-h-[49px] flex-1 rounded-full border border-black px-6 py-3 font-medium transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-black">Thêm vào giỏ</button>
        <WishlistButton product={product} className="size-[49px] shrink-0 border border-[#ddd]" />
      </div>
      <button type="button" disabled={busy || sold || stock <= 0} onClick={() => add(true)} className="min-h-[49px] w-full rounded-full bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-40">Mua ngay</button>
      {notice && <p role="status" className="text-sm text-[#555]">{notice} <Link to="/cart" className="underline underline-offset-4">Xem giỏ hàng</Link></p>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {!user && <p className="text-[13px] text-[#777]">Bạn cần <Link to="/login" state={{ from: location.pathname }} className="underline underline-offset-4">đăng nhập</Link> để thêm sản phẩm vào giỏ hàng.</p>}
    </div>

    <ul className="mt-6 mb-7 list-disc space-y-3 border-b border-[#f1f1f1] pb-7 pl-5">
      <li>Thanh toán khi nhận hàng (COD)</li>
      {(detail.highlights ?? []).slice(0, 4).map(highlight => <li key={highlight}>{highlight}</li>)}
    </ul>
    <div>{information.map(([title, content]) => <details key={title} name={`product-${product.id}`} className="group border-b border-[#f1f1f1]">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 [&::-webkit-details-marker]:hidden">
        <span>{title}</span><Plus size={18} aria-hidden="true" className="shrink-0 transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none" />
      </summary>
      <p className="pb-5 text-sm leading-[1.7] whitespace-pre-line text-[#666]">{content}</p>
    </details>)}</div>
  </div>
}
