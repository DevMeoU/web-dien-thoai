import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import { useBanners } from '../../../hooks/useStoreData'

export default function HeroSection() {
  // Banner đầu tiên do quản trị viên quản lý; chưa có banner thì dùng nội dung mặc định.
  const banner = useBanners()[0]
  const title = banner?.title ?? 'Sự tinh giản trong từng chi tiết'
  return <section data-home-section="hero" className="px-4 pt-[88px] pb-6 tablet:px-6" aria-labelledby="hero-title">
    <div className="relative isolate w-full overflow-hidden rounded-xl bg-[#f2f2f2]">
      <div className="relative z-10 mx-auto flex min-h-[292px] w-full max-w-[1440px] items-center p-6 tablet:h-[560px] tablet:p-10 desktop:h-[600px] desktop:px-16">
        <div className="flex flex-col items-start gap-6 tablet:max-w-[48%] desktop:max-w-[600px]">
          <Reveal><h1 id="hero-title" className="text-[34px] leading-[1.1] font-bold tracking-[-0.035em] tablet:text-[42px] desktop:text-[60px]">{title}</h1></Reveal>
          <Reveal className="flex flex-col items-start gap-6" delay={0.15}>
            <p className="max-w-[360px] text-lg leading-[1.5] text-[#444]">{banner?.subtitle ?? 'Khám phá iPhone 17 Pro Max'}</p>
            <Link to={banner?.link || '/products/iphone-17-pro-max'} className="inline-flex shrink-0 items-center justify-center rounded-[50px] bg-black px-8 py-3 text-base leading-[1.4] font-medium text-white transition-colors duration-250 ease-[ease] hover:bg-[#333] motion-reduce:transition-none">Khám phá ngay</Link>
          </Reveal>
        </div>
      </div>
      <img className="block h-[300px] w-full object-cover object-[75%_center] tablet:absolute tablet:inset-0 tablet:h-full tablet:object-[70%_center] desktop:object-center" src={banner?.image_url ?? '/images/home/hero-wide.png'} alt={banner?.subtitle || 'iPhone 17 Pro Max, mặt trước và mặt sau'} width="2172" height="724" fetchPriority="high" />
    </div>
  </section>
}
