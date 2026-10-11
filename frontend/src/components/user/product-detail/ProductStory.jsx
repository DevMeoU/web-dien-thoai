import Reveal from '../home/Reveal'

export default function ProductStory({ product, detail, storeName }) {
  return <section className="bg-[#f4f4f4] px-4 py-12 tablet:px-6 tablet:py-20" aria-labelledby="product-story-title">
    <div className="mx-auto max-w-[1440px]">
      <Reveal><h2 id="product-story-title" className="mb-8 max-w-[900px] text-[28px] leading-[1.2] font-medium tablet:mb-12 desktop:text-[34px]">Khám phá {product.name}.</h2></Reveal>
      <div className="grid items-start gap-8 tablet:grid-cols-2 tablet:gap-12">
        <Reveal>
          <img src={detail.images?.[0]?.url || product.image || '/images/home/hero.png'} alt={`Góc nhìn chi tiết của ${product.name}`} width={1200} height={1200} loading="lazy" className="mb-6 aspect-square w-full rounded-xl object-contain" />
          <h3 className="mb-3 text-2xl leading-[1.25] font-medium">Thiết bị dành cho bạn</h3>
          <p className="max-w-[620px] leading-[1.7] whitespace-pre-line text-[#555]">{detail.description || `Khám phá ${product.name} tại ${storeName}.`}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h3 className="mb-6 text-2xl leading-[1.25] font-medium">Thông số kỹ thuật</h3>
          {(detail.specs ?? []).length > 0 ? <dl className="overflow-hidden rounded-xl bg-white p-5 tablet:p-8">
            {detail.specs.map((spec, index) => <div key={`${spec.label}-${index}`} className={`grid gap-2 py-4 tablet:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] tablet:gap-6 ${index > 0 ? 'border-t border-[#f1f1f1]' : ''}`}>
              <dt className="text-sm text-[#666]">{spec.label}</dt><dd className="text-sm leading-[1.6]">{spec.value}</dd>
            </div>)}
          </dl> : <p className="text-[#666]">Thông số đang được cập nhật.</p>}
        </Reveal>
      </div>
    </div>
  </section>
}
