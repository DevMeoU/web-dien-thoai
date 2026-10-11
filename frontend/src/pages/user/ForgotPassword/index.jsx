import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../../services/authService'
import AuthLayout from '../../../components/user/auth/AuthLayout'
import FormField from '../../../components/user/form/FormField'
import { submitClass } from '../../../components/user/form/formStyles'
import { validateEmail } from '../../../utils/validation'

export default function ForgotPasswordPage() {
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get('email')
    const invalid = validateEmail(email)
    setError(invalid)
    setStatus('')
    if (invalid) return
    setBusy(true)
    try {
      const response = await authService.forgotPassword(email.trim())
      setStatus(response.message)
    } catch (failure) {
      setError(failure.field('email') ?? failure.message)
    } finally {
      setBusy(false)
    }
  }

  return <AuthLayout title="Quên mật khẩu" description="Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết để bạn đặt lại mật khẩu." image="/images/home/collection-work.png" imageAlt="Sản phẩm Apple" footer={<>Đã nhớ mật khẩu? <Link className="font-medium underline underline-offset-4" to="/login">Đăng nhập</Link></>}>
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <FormField label="Email" name="email" type="email" autoComplete="email" placeholder="example@gmail.com" error={error} onChange={() => setStatus('')} />
      <button className={`${submitClass} disabled:opacity-60`} type="submit" disabled={busy}>{busy ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}</button>
      {status && <p className="text-[13px]" role="status">{status}</p>}
    </form>
  </AuthLayout>
}
