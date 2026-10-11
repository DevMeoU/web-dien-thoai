import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera } from '@phosphor-icons/react'
import { useAuth } from '../../../contexts/authState'
import { accountService } from '../../../services/accountService'
import { PasswordForm, ProfileForm } from '../../../components/user/account/AccountForms'
import PageTitle from '../../../components/user/shopping/PageTitle'

export default function ProfilePage() {
  const { user, setUser, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [avatarError, setAvatarError] = useState('')
  const shortcuts = [['/orders', 'Đơn hàng của tôi'], ['/addresses', 'Sổ địa chỉ'], ['/wishlist', 'Yêu thích'], ['/reviews', 'Đánh giá của tôi'], ...(isAdmin ? [['/admin', 'Khu vực quản trị']] : [])]

  async function chooseAvatar(event) {
    const file = event.target.files[0]
    if (!file) return
    setAvatarError('')
    try { setUser((await accountService.uploadAvatar(file)).data) } catch (error) { setAvatarError(error.field('image') ?? error.message) }
    event.target.value = ''
  }

  return <div className="flex flex-col gap-8">
    <PageTitle title="Tài khoản của tôi" description={`Xin chào ${user.name}.`} />
    <div className="flex flex-wrap items-center gap-5">
      <label className="relative size-24 cursor-pointer overflow-hidden rounded-full bg-[#f4f4f4]">
        {user.avatar_url ? <img src={user.avatar_url} alt="Ảnh đại diện" className="size-full object-cover" /> : <span className="flex size-full items-center justify-center text-3xl font-medium">{user.name.slice(0, 1)}</span>}
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/55 py-1.5 text-white"><Camera size={16} aria-hidden="true" /></span>
        <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label="Tải ảnh đại diện" onChange={chooseAvatar} />
      </label>
      <div className="flex flex-col gap-1.5">
        <p className="font-medium">{user.email}</p>
        <button type="button" className="w-max text-sm underline underline-offset-4" onClick={async () => { await logout(); navigate('/', { replace: true }) }}>Đăng xuất</button>
        {avatarError && <p className="text-[13px] text-red-700" role="alert">{avatarError}</p>}
      </div>
    </div>
    <nav className="grid grid-cols-2 gap-3 tablet:grid-cols-5" aria-label="Truy cập nhanh">
      {shortcuts.map(([to, label]) => <Link key={to} to={to} className="rounded-xl bg-[#f4f4f4] px-4 py-4 text-center text-sm font-medium transition-colors hover:bg-[#ebebeb]">{label}</Link>)}
    </nav>
    <div className="grid gap-6 tablet:grid-cols-2"><ProfileForm /><PasswordForm /></div>
  </div>
}
