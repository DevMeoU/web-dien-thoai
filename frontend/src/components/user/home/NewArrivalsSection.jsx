import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import AllProductsLink from './AllProductsLink'
import ProductCard from './ProductCard'
import { useCatalog } from '../../../hooks/useStoreData'

export default function NewArrivalsSection() {
  const { products, loading, error } = useCatalog()
  // Ưu tiên sản phẩm được đánh dấu "mới"; thiếu thì bổ sung bằng sản phẩm mới tạo gần nhất.
  const arrivals = [...products].sort((a, b) => Number(b.isNew) - Number(a.isNew) || Number(b.category.startsWith('iphone')) - Number(a.category.startsWith('iphone'))).slice(0, 6)
  return <section data-home-section="products" className="px-4 py-8 tablet:px-6 tablet:pt-[62px] tablet:pb-[120px]" aria-labelledby="arrivals-title">
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
      <Reveal className="flex flex-col items-start justify-between gap-2.5 tablet:flex-row tablet:items-end">
        <SectionHeading id="arrivals-title" title="Sản phẩm mới" description="Khám phá thế hệ thiết bị mới, chọn phiên bản dành cho bạn." />
        <AllProductsLink className="hidden tablet:block" />
      </Reveal>
      {loading && <p role="status" className="py-8 text-[#666]">Đang tải sản phẩm...</p>}
      {error && <p role="alert" className="py-8 text-[#666]">Chưa tải được sản phẩm. Vui lòng thử lại sau.</p>}
      {!loading && !error && arrivals.length === 0 && <p className="py-8 text-[#666]">Sản phẩm mới sẽ sớm có mặt.</p>}
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 tablet:gap-5 desktop:grid-cols-3">
        {arrivals.map((product, index) => <ProductCard key={product.id} product={product} delay={(index % 3) * 0.08} />)}
      </div>
      <AllProductsLink className="mx-auto block w-max tablet:hidden" />
    </div>
  </section>
}
