import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import ProductCard from './ProductCard'

/** Một hàng sản phẩm trên trang chủ; không hiển thị khi chưa có sản phẩm nào. */
export default function ProductShelf({ id, title, description, products }) {
  if (products.length === 0) return null
  return <section data-home-section={id} className="px-4 py-8 tablet:px-6 tablet:py-[60px]" aria-labelledby={`${id}-title`}>
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
      <Reveal><SectionHeading id={`${id}-title`} title={title} description={description} /></Reveal>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 tablet:gap-x-5 desktop:grid-cols-4">
        {products.map((product, index) => <ProductCard key={product.id} product={product} compact delay={(index % 3) * 0.08} />)}
      </div>
    </div>
  </section>
}
