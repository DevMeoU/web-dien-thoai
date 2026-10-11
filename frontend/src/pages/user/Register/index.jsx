import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/authState'
import AuthLayout from '../../../components/user/auth/AuthLayout'
import FormField from '../../../components/user/form/FormField'
import { submitClass } from '../../../components/user/form/formStyles'
import { validateEmail } from '../../../utils/validation'

const MIN_PASSWORD = 8

function validate(data) {
  const password = data.get('password')
  return {
    name: data.get('name').trim() ? '' : 'Vui lòng nhập họ tên.',
    email: validateEmail(data.get('email')),
    phone: !data.get('phone').trim() || /^(0|\+84)\d{9}$/.test(data.get('phone').replace(/\s/g, '')) ? '' : 'Số điện thoại không hợp lệ.',
    password: password.length >= MIN_PASSWORD ? '' : `Mật khẩu cần có ít nhất ${MIN_PASSWORD} ký tự.`,
    password_confirmation: data.get('password_confirmation') === password ? '' : 'Mật khẩu nhập lại chưa khớp.',
    terms: data.get('terms') ? '' : 'Vui lòng đồng ý với chính sách để tiếp tục.',
  }
}

export default function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const from = useLocation().state?.from
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={from ?? '/'} replace />

  async function submit(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const next = validate(data)
    setErrors(next)
    setFailure('')
    if (Object.values(next).some(Boolean)) return
    setBusy(true)
    try {
      await register({
        name: data.get('name').trim(), email: data.get('email').trim(), phone: data.get('phone').trim() || null,
        password: data.get('password'), password_confirmation: data.get('password_confirmation'),
      })
      navigate(from ?? '/', { replace: true })
    } catch (error) {
      setErrors(Object.fromEntries(Object.keys(error.errors).map(field => [field, error.field(field)])))
      setFailure(Object.keys(error.errors).length ? '' : error.message)
    } finally {
      setBusy(false)
    }
  }

  const clear = () => setFailure('')
  return <AuthLayout title="Tạo tài khoản" description="Đăng ký để lưu sản phẩm yêu thích và theo dõi đơn hàng dễ dàng hơn." image="/images/home/collection-creative.png" imageAlt="Sản phẩm Apple" footer={<>Đã có tài khoản? <Link className="font-medium underline underline-offset-4" to="/login" state={{ from }}>Đăng nhập</Link></>}>
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <FormField label="Họ tên" name="name" autoComplete="name" placeholder="Nguyễn Văn A" error={errors.name} onChange={clear} />
      <FormField label="Email" name="email" type="email" autoComplete="email" placeholder="example@gmail.com" error={errors.email} onChange={clear} />
      <FormField label="Số điện thoại (không bắt buộc)" name="phone" type="tel" autoComplete="tel" placeholder="0901234567" error={errors.phone} onChange={clear} />
      <FormField label="Mật khẩu" name="password" type="password" autoComplete="new-password" placeholder={`Ít nhất ${MIN_PASSWORD} ký tự`} error={errors.password} onChange={clear} />
      <FormField label="Nhập lại mật khẩu" name="password_confirmation" type="password" autoComplete="new-password" placeholder="Nhập lại mật khẩu" error={errors.password_confirmation} onChange={clear} />
      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-2.5 text-sm leading-[1.4]">
          <input className="mt-0.5 size-4 shrink-0 accent-black" type="checkbox" name="terms" aria-invalid={Boolean(errors.terms)} aria-describedby={errors.terms ? 'terms-error' : undefined} onChange={clear} />
          <span>Tôi đồng ý với <Link className="underline underline-offset-4" to="/policies?tab=privacy">chính sách bảo mật</Link> của cửa hàng.</span>
        </label>
        {errors.terms && <span id="terms-error" role="alert" className="text-[13px] text-red-700">{errors.terms}</span>}
      </div>
      <button className={`${submitClass} disabled:opacity-60`} type="submit" disabled={busy}>{busy ? 'Đang tạo tài khoản...' : 'Đăng ký'}</button>
      {failure && <p className="text-[13px] text-red-700" role="alert">{failure}</p>}
    </form>
  </AuthLayout>
}
