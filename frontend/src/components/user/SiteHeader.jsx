import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useReducedMotion } from 'motion/react'
import { Heart, MagnifyingGlass, ShoppingBag, User, X } from '@phosphor-icons/react'
import RollingLink from './navigation/RollingLink'
import MobileNavigation from './navigation/MobileNavigation'
import ProductSearchDialog from './navigation/ProductSearchDialog'
import { useAuth } from '../../contexts/authState'
import { useShop } from '../../contexts/shopState'
import { useStoreSettings } from '../../hooks/useStoreData'

const links = [['/products', 'Sản phẩm'], ['/about', 'Giới thiệu'], ['/contact', 'Liên hệ']]
const badgeClass = 'absolute top-0.5 right-0 min-w-4 rounded-full bg-black px-1 text-center text-[10px] leading-4 text-white'
const iconButtonClass = 'flex size-10 items-center justify-center border-0 bg-transparent p-0 text-black'

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchButton = useRef(null)
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const { user, isAdmin } = useAuth()
  const { cartCount, wishlistCount } = useShop()
  const settings = useStoreSettings()
  const navLinks = isAdmin ? [...links, ['/admin', 'Quản trị']] : links
  const mobileLinks = [...navLinks, ['/wishlist', 'Yêu thích'], ...(user ? [['/orders', 'Đơn hàng'], ['/profile', 'Tài khoản']] : [['/login', 'Đăng nhập']])]

  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth' })
  }, [location.hash, location.key, reduceMotion])

  const closePanels = () => { setMenuOpen(false); setSearchOpen(false) }

  return <>
    <header className="fixed inset-x-0 top-0 z-30 border-b border-[#ececec] bg-white/90 px-4 py-4 backdrop-blur-[12px] tablet:px-6" onKeyDown={event => { if (event.key === 'Escape') setMenuOpen(false) }}>
      <div className="relative mx-auto flex h-10 w-full max-w-[1440px] items-center justify-between tablet:grid tablet:grid-cols-[auto_1fr_auto] tablet:gap-8">
        <button className={`${iconButtonClass} tablet:hidden`} aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} /> : <span className="flex flex-col gap-2.5" aria-hidden="true"><span className="h-0.5 w-6 bg-black" /><span className="h-0.5 w-6 bg-black" /></span>}
        </button>
        <Link to="/" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 tablet:static tablet:translate-x-0 tablet:translate-y-0" aria-label={`Trang chủ ${settings.store_name}`} onClick={() => { closePanels(); window.scrollTo({ top: 0, behavior: 'instant' }) }}>
          <span className="text-[28px] leading-none font-bold tracking-tight text-black tablet:text-[34px]">{settings.store_name}</span>
        </Link>
        <nav className="hidden items-center justify-center gap-6 whitespace-nowrap tablet:flex" aria-label="Điều hướng chính">
          {navLinks.map(([to, label]) => <RollingLink key={label} to={to} onClick={closePanels}>{label}</RollingLink>)}
        </nav>
        <div className="ml-auto flex items-center gap-1 desktop:gap-2">
          <button ref={searchButton} className={`${iconButtonClass} rounded-full transition-colors hover:bg-[#f2f2f2] desktop:w-[220px] desktop:justify-start desktop:gap-3 desktop:bg-[#f4f4f4] desktop:px-4 desktop:text-[#555] desktop:hover:bg-[#eaeaea]`} aria-label="Tìm kiếm" aria-haspopup="dialog" onClick={() => { setMenuOpen(false); setSearchOpen(true) }}>
            <MagnifyingGlass size={20} weight="bold" />
            <span className="hidden text-sm desktop:inline">Tìm sản phẩm...</span>
          </button>
          <Link to="/wishlist" className={`${iconButtonClass} relative hidden tablet:flex`} aria-label={`Yêu thích, ${wishlistCount} sản phẩm`} onClick={closePanels}>
            <Heart size={20} weight="bold" />{wishlistCount > 0 && <span className={badgeClass} aria-hidden="true">{wishlistCount}</span>}
          </Link>
          <Link to={user ? '/profile' : '/login'} className={`${iconButtonClass} hidden tablet:flex`} aria-label={user ? `Tài khoản của ${user.name}` : 'Đăng nhập'} onClick={closePanels}><User size={20} weight="bold" /></Link>
          <Link to="/cart" className={`${iconButtonClass} relative`} aria-label={`Giỏ hàng, ${cartCount} sản phẩm`} onClick={closePanels}>
            <ShoppingBag size={20} weight="bold" />{cartCount > 0 && <span className={badgeClass} aria-hidden="true">{cartCount}</span>}
          </Link>
        </div>
      </div>
      <MobileNavigation open={menuOpen} links={mobileLinks} onNavigate={closePanels} />
    </header>
    <ProductSearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={closePanels} returnFocusRef={searchButton} />
  </>
}
