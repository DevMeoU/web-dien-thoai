import { useState } from 'react'
import { Star } from '@phosphor-icons/react'
import { useFeaturedReviews } from '../../../hooks/useStoreData'

/** Nhận xét thật của khách hàng (đánh giá từ 4 sao đang công khai). */
export default function TestimonialSection() {
  const reviews = useFeaturedReviews()
  const [selected, setSelected] = useState(0)
  const review = reviews[selected] ?? reviews[0]
  if (!review) return null
  return <section id="about" data-home-section="testimonial" className="scroll-mt-[72px] bg-[#f4f4f4] px-4 py-[62px] text-center tablet:px-6 tablet:py-20 desktop:py-[120px]" aria-label="Cảm nhận của khách hàng">
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
      {review && <>
        <div className="flex justify-center gap-2.5" role="img" aria-label={`${review.rating} trên 5 sao`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={24} weight={index < review.rating ? 'fill' : 'regular'} aria-hidden="true" />)}</div>
        <blockquote><h2 className="text-[28px] leading-[1.2] font-medium desktop:text-[34px]">“{review.comment}”</h2></blockquote>
        <p className="text-lg leading-[1.4] font-medium">- {review.user?.name}{review.product ? `, về ${review.product.name}` : ''}</p>
        {reviews.length > 1 && <div className="flex justify-center gap-2" role="group" aria-label="Chọn nhận xét">
          {reviews.map((item, index) => <button key={item.id} type="button" aria-label={`Nhận xét ${index + 1}`} aria-pressed={index === selected} onClick={() => setSelected(index)} className={`size-2.5 rounded-full ${index === selected ? 'bg-black' : 'bg-[#c9c9c9]'}`} />)}
        </div>}
      </>}
    </div>
  </section>
}
