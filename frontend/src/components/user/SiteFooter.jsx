import { Link } from 'react-router-dom'
import Reveal from './home/Reveal'
import FooterColumn from './footer/FooterColumn'
import SocialLinks from './footer/SocialLinks'
import { useStoreSettings } from '../../hooks/useStoreData'

export default function SiteFooter() {
  const settings = useStoreSettings()
  const phone = settings.contact_phone
  return <footer data-home-section="footer" className="bg-black px-4 py-8 text-[#f4f4f4] tablet:px-6 tablet:pt-20 [&_a:hover]:opacity-65">
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
      <div className="grid grid-cols-1 gap-8 tablet:grid-cols-3 desktop:grid-cols-5 desktop:gap-6">
        <div className="flex flex-col gap-6 tablet:col-span-3 desktop:col-span-2">
          <Link className="text-[32px] leading-none font-bold tracking-tight text-white" to="/" aria-label={`Trang chủ ${settings.store_name}`}>{settings.store_name}</Link>
          <Reveal><p>Thiết bị Apple cho công việc, sáng tạo và cuộc sống mỗi ngày.</p></Reveal>
          <SocialLinks />
        </div>
        <FooterColumn title="Thông tin">
          <Link to="/policies?tab=shipping">Chính sách giao hàng</Link>
          <Link to="/policies?tab=warranty">Chính sách bảo hành</Link>
          <Link to="/policies?tab=returns">Đổi trả và hoàn tiền</Link>
          <Link to="/policies?tab=privacy">Chính sách bảo mật</Link>
        </FooterColumn>
        <FooterColumn title="Cửa hàng" delay={0.08}>
          <Link to="/about">Giới thiệu</Link><Link to="/contact">Liên hệ</Link><Link to="/blogs">Tư vấn & tin tức</Link>
        </FooterColumn>
        <FooterColumn title="Liên hệ" delay={0.16}>
          {settings.contact_address && <p>{settings.contact_address}</p>}
          <div className="flex flex-col gap-2.5">
            {phone && <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>}
            {settings.contact_email && <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>}
          </div>
        </FooterColumn>
      </div>
      <div className="h-px bg-white/10" />
      <p>© 2026 {settings.store_name}. Bảo lưu mọi quyền.</p>
    </div>
  </footer>
}
