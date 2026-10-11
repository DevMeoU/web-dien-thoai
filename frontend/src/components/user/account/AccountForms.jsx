import { useState } from 'react'
import { useAuth } from '../../../contexts/authState'
import { accountService } from '../../../services/accountService'
import FormField from '../form/FormField'
import { submitClass } from '../form/formStyles'

const card = 'flex flex-col gap-5 rounded-xl border border-[#f1f1f1] p-6'

function fieldErrors(error) {
  return Object.fromEntries(Object.keys(error.errors ?? {}).map(field => [field, error.field(field)]))
}

export function ProfileForm() {
  const { user, setUser } = useAuth()
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  const [failure, setFailure] = useState('')

  async function submit(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setStatus('')
    setFailure('')
    try {
      const response = await accountService.updateProfile({ name: data.get('name').trim(), phone: data.get('phone').trim() || null })
      setUser(response.data)
      setErrors({})
      setStatus('Đã lưu thông tin cá nhân.')
    } catch (error) {
      setErrors(fieldErrors(error))
      setFailure(Object.keys(error.errors ?? {}).length ? '' : error.message)
    }
  }

  return <form onSubmit={submit} noValidate className={card}>
    <h2 className="text-xl font-medium">Thông tin cá nhân</h2>
    <FormField label="Họ tên" name="name" autoComplete="name" defaultValue={user.name} error={errors.name} />
    <FormField label="Số điện thoại" name="phone" type="tel" autoComplete="tel" defaultValue={user.phone ?? ''} error={errors.phone} placeholder="0901234567" />
    <div className="flex flex-col gap-2.5 text-sm"><span>Email (không thể thay đổi)</span><p className="rounded-[10px] bg-[#f4f4f4] px-3 py-[11px] text-[#666]">{user.email}</p></div>
    <button type="submit" className={submitClass}>Lưu thay đổi</button>
    {status && <p className="text-[13px] text-green-700" role="status">{status}</p>}
    {failure && <p className="text-[13px] text-red-700" role="alert">{failure}</p>}
  </form>
}

export function PasswordForm() {
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')

  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const password = data.get('password')
    const next = {
      current_password: data.get('current_password') ? '' : 'Vui lòng nhập mật khẩu hiện tại.',
      password: password.length >= 8 ? '' : 'Mật khẩu mới cần có ít nhất 8 ký tự.',
      password_confirmation: data.get('password_confirmation') === password ? '' : 'Mật khẩu nhập lại chưa khớp.',
    }
    setErrors(next)
    setStatus('')
    if (Object.values(next).some(Boolean)) return
    try {
      await accountService.changePassword({ current_password: data.get('current_password'), password, password_confirmation: data.get('password_confirmation') })
      form.reset()
      setStatus('Đã đổi mật khẩu. Các thiết bị khác sẽ được đăng xuất.')
    } catch (error) {
      setErrors(Object.keys(error.errors ?? {}).length ? fieldErrors(error) : { current_password: error.message })
    }
  }

  return <form onSubmit={submit} noValidate className={card}>
    <h2 className="text-xl font-medium">Đổi mật khẩu</h2>
    <FormField label="Mật khẩu hiện tại" name="current_password" type="password" autoComplete="current-password" error={errors.current_password} />
    <FormField label="Mật khẩu mới" name="password" type="password" autoComplete="new-password" placeholder="Ít nhất 8 ký tự" error={errors.password} />
    <FormField label="Nhập lại mật khẩu mới" name="password_confirmation" type="password" autoComplete="new-password" error={errors.password_confirmation} />
    <button type="submit" className={submitClass}>Đổi mật khẩu</button>
    {status && <p className="text-[13px] text-green-700" role="status">{status}</p>}
  </form>
}
