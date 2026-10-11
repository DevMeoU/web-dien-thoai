import { PageHeader } from '../../../components/admin/ui'
import { PasswordForm, ProfileForm } from '../../../components/user/account/AccountForms'
import { useAuth } from '../../../contexts/authState'

export default function AdminProfile() {
  const { user } = useAuth()
  return <>
    <PageHeader title="Hồ sơ quản trị" description={`Đăng nhập với tài khoản ${user.email}.`} />
    <div className="grid gap-6 desktop:grid-cols-2"><ProfileForm /><PasswordForm /></div>
  </>
}
