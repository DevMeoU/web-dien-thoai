import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Heart } from '@phosphor-icons/react'
import { useAuth } from '../../contexts/authState'
import { useShop } from '../../contexts/shopState'

/** Thêm hoặc bỏ sản phẩm khỏi yêu thích; khách chưa đăng nhập được đưa tới trang đăng nhập. */
export default function WishlistButton({ product, className = '' }) {
  const { user } = useAuth()
  const { isWishlisted, toggleWishlist } = useShop()
  const navigate = useNavigate()
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const active = isWishlisted(product.productId)

  async function click() {
    if (!user) {
      navigate('/login', { state: { from: location.pathname + location.search } })
      return
    }
    setBusy(true)
    try { await toggleWishlist(product) } catch { /* sản phẩm có thể đã ngừng bán */ } finally { setBusy(false) }
  }

  return <button type="button" aria-pressed={active} disabled={busy} aria-label={active ? `Bỏ ${product.name} khỏi yêu thích` : `Thêm ${product.name} vào yêu thích`} onClick={click} className={`flex size-9 items-center justify-center rounded-full bg-white/90 text-black transition-colors duration-200 ease-[ease] hover:bg-white disabled:opacity-60 motion-reduce:transition-none ${className}`}>
    <Heart size={18} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
  </button>
}
