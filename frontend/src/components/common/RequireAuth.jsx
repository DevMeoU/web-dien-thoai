import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/authState'

export function LoadingBlock({ label = 'Đang tải...' }) {
  return <div className="flex min-h-[40vh] items-center justify-center text-[#666]" role="status">{label}</div>
}

/** Chỉ cho người đã đăng nhập vào; người chưa đăng nhập được đưa tới trang đăng nhập rồi quay lại. */
export default function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingBlock label="Đang kiểm tra đăng nhập..." />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return <Outlet />
}
