import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import CollectionCard from './CollectionCard'
import { useBanners } from '../../../hooks/useStoreData'

/** Các thẻ mua sắm theo nhu cầu lấy từ banner vị trí "collection" do quản trị viên quản lý. */
export default function CollectionsSection() {
  const [large, ...rest] = useBanners('collection').slice(0, 3)
  if (!large) return null
  return <section data-home-section="collections" className="px-4 pt-8 pb-20 tablet:px-6 tablet:pt-20 desktop:py-[120px]" aria-labelledby="collections-title">
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
      <Reveal><SectionHeading id="collections-title" title="Chọn theo nhu cầu" description="Làm việc, học tập hay sáng tạo. Luôn có thiết bị phù hợp với bạn." className="text-center" /></Reveal>
      <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2">
        <CollectionCard banner={large} slot={0} />
        {rest.length > 0 && <div className="flex flex-col gap-5">
          {rest.map((banner, index) => <CollectionCard key={banner.id} banner={banner} slot={index + 1} />)}
        </div>}
      </div>
    </div>
  </section>
}
