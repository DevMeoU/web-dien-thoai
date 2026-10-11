import { Truck, Money, Phone, ShieldCheck } from '@phosphor-icons/react'
import { useStoreSettings } from '../../../hooks/useStoreData'
import { formatCurrency } from '../../../utils/format'
import BenefitItem from './BenefitItem'

export default function BenefitsSection() {
  const settings = useStoreSettings()
  const threshold = Number(settings.free_shipping_threshold)
  return <section data-home-section="benefits" className="px-4 py-8 tablet:px-6 desktop:py-20" aria-label="Quyền lợi mua sắm">
    <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4 desktop:gap-0">
      <BenefitItem icon={Truck} title="Giao hàng toàn quốc" text={threshold > 0 ? `Miễn phí từ ${formatCurrency(threshold)}` : `Phí giao hàng ${formatCurrency(settings.shipping_fee)}`} />
      <BenefitItem icon={ShieldCheck} title="Hỗ trợ bảo hành" text="Theo chính sách từng thiết bị" delay={0.08} />
      <BenefitItem icon={Phone} title="Tư vấn chọn máy" text="Qua điện thoại và email" delay={0.16} />
      <BenefitItem icon={Money} title="Thanh toán khi nhận" text="Mua sắm thuận tiện với COD" delay={0.24} />
    </div>
  </section>
}
