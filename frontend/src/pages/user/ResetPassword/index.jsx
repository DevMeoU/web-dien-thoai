import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../../../services/authService'
import AuthLayout from '../../../components/user/auth/AuthLayout'
import FormField from '../../../components/user/form/FormField'
import { submitClass } from '../../../components/user/form/formStyles'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')
  const email = params.get('email')
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const password = data.get('password')
    const next = {
      password: password.length >= 8 ? '' : 'Mật khẩu cần có ít nhất 8 ký tự.',
      password_confirmation: data.get('password_confirmation') === password ? '' : 'Mật khẩu nhập lại chưa khớp.',
    }
    setErrors(next)
    setFailure('')
    if (next.password || next.password_confirmation) return
    setBusy(true)
    try {
      await authService.resetPassword({ token, email, password, password_confirmation: data.get('password_confirmation') })
      navigate('/login', { replace: true })
    } catch (error) {
      setFailure(error.message)
    } finally {
      setBusy(false)
    }
  }

  if (!token || !email) return <AuthLayout title="Liên kết không hợp lệ" description="Liên kết đặt lại mật khẩu thiếu thông tin hoặc đã hết hạn." image="/images/home/collection-work.png" imageAlt="Sản phẩm Apple" footer={<Link className="font-medium underline underline-offset-4" to="/forgot-password">Yêu cầu liên kết mới</Link>}><span /></AuthLayout>

  return <AuthLayout title="Đặt lại mật khẩu" description={`Tạo mật khẩu mới cho tài khoản ${email}.`} image="/images/home/collection-work.png" imageAlt="Sản phẩm Apple" footer={<Link className="font-medium underline underline-offset-4" to="/login">Quay lại đăng nhập</Link>}>
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <FormField label="Mật khẩu mới" name="password" type="password" autoComplete="new-password" placeholder="Ít nhất 8 ký tự" error={errors.password} onChange={() => setFailure('')} />
      <FormField label="Nhập lại mật khẩu" name="password_confirmation" type="password" autoComplete="new-password" placeholder="Nhập lại mật khẩu" error={errors.password_confirmation} onChange={() => setFailure('')} />
      <button className={`${submitClass} disabled:opacity-60`} type="submit" disabled={busy}>{busy ? 'Đang lưu...' : 'Đặt lại mật khẩu'}</button>
      {failure && <p className="text-[13px] text-red-700" role="alert">{failure}</p>}
    </form>
  </AuthLayout>
}
