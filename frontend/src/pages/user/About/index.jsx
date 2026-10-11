import { Link } from 'react-router-dom'
import { useStoreSettings } from '../../../hooks/useStoreData'
import ContentPageView from '../../../components/user/shopping/ContentPageView'
import PageTitle from '../../../components/user/shopping/PageTitle'

export default function AboutPage() {
  const settings = useStoreSettings()
  return <div className="flex flex-col gap-8">
    <PageTitle title={`Về ${settings.store_name}`} description={settings.about_content} />
    <ContentPageView slug="about" />
    <section className="grid gap-4 rounded-xl bg-[#f4f4f4] p-6 text-sm leading-[1.7] tablet:grid-cols-3" aria-label="Thông tin liên hệ">
      {settings.contact_address && <p><strong className="block">Địa chỉ</strong>{settings.contact_address}</p>}
      {settings.contact_phone && <p><strong className="block">Điện thoại</strong>{settings.contact_phone}</p>}
      {settings.contact_email && <p><strong className="block">Email</strong>{settings.contact_email}</p>}
    </section>
    <p><Link to="/contact" className="underline underline-offset-4">Gửi yêu cầu hỗ trợ</Link></p>
  </div>
}
