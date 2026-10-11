import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/authState'
import { LoadingBlock } from './RequireAuth'

/** Khu vực quản trị: cần đăng nhập và vai trò admin (API cũng kiểm tra lại ở máy chủ). */
export default function RequireAdmin() {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingBlock label="Đang kiểm tra quyền truy cập..." />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!isAdmin) {
    return <div className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-5xl font-medium">403</p>
      <h1 className="text-xl font-medium">Bạn không có quyền truy cập khu vực quản trị</h1>
      <p className="text-[#666]">Tài khoản hiện tại là tài khoản khách hàng. Hãy đăng nhập bằng tài khoản quản trị viên.</p>
      <Link to="/" className="rounded-[10px] bg-[#0071e3] text-white px-8 py-3 hover:bg-[#0077ed]">Về trang chủ</Link>
    </div>
  }
  return <Outlet />
}
