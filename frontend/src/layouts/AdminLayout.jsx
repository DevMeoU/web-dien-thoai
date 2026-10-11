import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { List, SignOut, Storefront, X } from '@phosphor-icons/react'
import { useAuth } from '../contexts/authState'
import { useStoreSettings } from '../hooks/useStoreData'

const GROUPS = [
  ['Tổng quan', [['/admin', 'Bảng điều khiển'], ['/admin/reports', 'Báo cáo thống kê']]],
  ['Bán hàng', [['/admin/orders', 'Đơn hàng'], ['/admin/coupons', 'Mã giảm giá'], ['/admin/reviews', 'Đánh giá'], ['/admin/contacts', 'Yêu cầu liên hệ']]],
  ['Sản phẩm', [['/admin/products', 'Sản phẩm'], ['/admin/inventory', 'Tồn kho'], ['/admin/categories', 'Danh mục'], ['/admin/brands', 'Thương hiệu']]],
  ['Hệ thống', [['/admin/users', 'Khách hàng & tài khoản'], ['/admin/content', 'Banner & nội dung'], ['/admin/posts', 'Bài viết'], ['/admin/newsletter', 'Đăng ký nhận tin'], ['/admin/settings', 'Cài đặt cửa hàng'], ['/admin/profile', 'Hồ sơ của tôi']]],
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { store_name: storeName } = useStoreSettings()

  return <div className="min-h-screen bg-[#f6f6f6] font-brand text-[15px] text-black lg:grid lg:grid-cols-[250px_1fr]">
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e6e6e6] bg-white px-4 py-3 lg:hidden">
      <p className="font-semibold">Quản trị {storeName}</p>
      <button type="button" aria-label={open ? 'Đóng menu' : 'Mở menu'} aria-expanded={open} onClick={() => setOpen(!open)} className="rounded p-1">{open ? <X size={24} /> : <List size={24} />}</button>
    </header>
    <aside className={`${open ? 'block' : 'hidden'} border-b border-[#e6e6e6] bg-white p-5 lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-y-auto lg:border-r lg:border-b-0`}>
      <p className="hidden text-lg font-semibold lg:block">Quản trị {storeName}</p>
      <nav aria-label="Điều hướng quản trị" className="mt-2 flex flex-col gap-5 lg:mt-6">
        {GROUPS.map(([group, links]) => <div key={group}>
          <p className="mb-1.5 px-3 text-xs font-medium tracking-wide text-[#999] uppercase">{group}</p>
          <div className="flex flex-col gap-0.5">
            {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/admin'} onClick={() => setOpen(false)} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-[#e8f1fc] font-semibold' : 'text-[#555] hover:bg-[#f4f4f4]'}`}>{label}</NavLink>)}
          </div>
        </div>)}
      </nav>
      <div className="mt-6 flex flex-col gap-2 border-t border-[#eee] pt-5 text-sm">
        <p className="truncate font-medium" title={user.email}>{user.name}</p>
        <Link to="/" className="flex items-center gap-2 text-[#555] hover:text-black"><Storefront size={18} />Xem cửa hàng</Link>
        <button type="button" onClick={async () => { await logout(); navigate('/login', { replace: true }) }} className="flex items-center gap-2 text-left text-[#555] hover:text-black"><SignOut size={18} />Đăng xuất</button>
      </div>
    </aside>
    <main className="min-w-0 p-4 lg:p-8"><Outlet /></main>
  </div>
}
