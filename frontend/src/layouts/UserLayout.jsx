import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import SiteHeader from '../components/user/SiteHeader'
import SiteFooter from '../components/user/SiteFooter'
import useSmoothScroll from '../hooks/useSmoothScroll'

export default function UserLayout() {
  const { pathname, hash } = useLocation()
  const isHome = pathname === '/'
  const isCatalog = pathname === '/products' || pathname === '/products/'
  const isProductDetail = pathname.startsWith('/products/')
  const isContact = pathname === '/contact' || pathname === '/contact/'
  useSmoothScroll(isHome)
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return <div className="bg-white font-brand text-base leading-[1.4] text-black [&_button]:cursor-pointer [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-[#888] [&_:focus-visible]:outline-offset-5">
    <a href="#main-content" className="fixed top-[-60px] left-4 z-[100] bg-white px-4 py-2 focus:top-4">Chuyển đến nội dung</a>
    <SiteHeader />
    <main id="main-content" className={`scroll-mt-[72px] ${isHome || isCatalog || isProductDetail || isContact ? '' : 'mx-auto min-h-[65vh] max-w-[1200px] px-6 pt-[104px] pb-16'}`}><Outlet /></main>
    <SiteFooter />
  </div>
}
