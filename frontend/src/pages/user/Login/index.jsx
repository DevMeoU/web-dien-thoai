import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/authState'
import AuthLayout from '../../../components/user/auth/AuthLayout'
import FormField from '../../../components/user/form/FormField'
import { submitClass } from '../../../components/user/form/formStyles'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState(false)
  const from = location.state?.from

  if (user) return <Navigate to={from ?? (user.role === 'admin' ? '/admin' : '/')} replace />

  async function submit(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const next = { email: data.get('email').trim() ? '' : 'Vui lòng nhập email hoặc tên đăng nhập.', password: data.get('password') ? '' : 'Vui lòng nhập mật khẩu.' }
    setErrors(next)
    setFailure('')
    if (next.email || next.password) return
    setBusy(true)
    try {
      const signedIn = await login(data.get('email').trim(), data.get('password'))
      navigate(from ?? (signedIn.role === 'admin' ? '/admin' : '/'), { replace: true })
    } catch (error) {
      setFailure(error.message)
    } finally {
      setBusy(false)
    }
  }

  return <AuthLayout title="Đăng nhập" description="Chào mừng bạn quay lại. Đăng nhập để xem giỏ hàng, đơn hàng và sản phẩm đã lưu." image="/images/home/collection-work.png" imageAlt="Sản phẩm Apple" footer={<>Chưa có tài khoản? <Link className="font-medium underline underline-offset-4" to="/register" state={{ from }}>Đăng ký</Link></>}>
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <FormField label="Email hoặc tên đăng nhập" name="email" type="text" autoComplete="username" placeholder="admin hoặc example@gmail.com" error={errors.email} onChange={() => setFailure('')} />
      <FormField label="Mật khẩu" name="password" type="password" autoComplete="current-password" placeholder="Nhập mật khẩu" error={errors.password} onChange={() => setFailure('')} />
      <Link className="self-end text-sm underline-offset-4 hover:underline" to="/forgot-password">Quên mật khẩu?</Link>
      <button className={`${submitClass} disabled:opacity-60`} type="submit" disabled={busy}>{busy ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
      {failure && <p className="text-[13px] text-red-700" role="alert">{failure}</p>}
    </form>
  </AuthLayout>
}
