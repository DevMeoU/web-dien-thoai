import { useEffect, useState } from 'react'
import { Star } from '@phosphor-icons/react'
import { shopService } from '../../../services/shopService'
import { formatDate } from '../../../utils/format'

export function Stars({ value, size = 16 }) {
  return <span className="inline-flex" role="img" aria-label={`${value} trên 5 sao`}>
    {[1, 2, 3, 4, 5].map(star => <Star key={star} size={size} weight={star <= value ? 'fill' : 'regular'} className={star <= value ? 'text-black' : 'text-[#ccc]'} aria-hidden="true" />)}
  </span>
}

export default function ProductReviews({ productKey }) {
  const [rating, setRating] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)

  useEffect(() => {
    let alive = true
    shopService.productReviews(productKey, { rating, page, per_page: 5 }).then(response => { if (alive) setResult(response.data) }).catch(() => {})
    return () => { alive = false }
  }, [productKey, rating, page])

  if (!result) return null
  const { summary, reviews } = result
  const list = reviews.data
  const lastPage = reviews.meta?.last_page ?? 1

  return <section className="mx-auto max-w-[1488px] px-4 py-12 tablet:px-6 tablet:py-16" aria-labelledby="reviews-title">
    <h2 id="reviews-title" className="mb-8 text-[28px] leading-[1.2] font-medium desktop:text-[34px]">Đánh giá sản phẩm</h2>
    {summary.count === 0 && !rating ? <p className="text-[#666]">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sau khi nhận hàng.</p> : <div className="grid gap-8 tablet:grid-cols-[260px_minmax(0,1fr)] tablet:gap-12">
      <div>
        <p className="text-5xl font-medium">{summary.average.toFixed(1)}</p>
        <div className="mt-2"><Stars value={Math.round(summary.average)} size={20} /></div>
        <p className="mt-1 text-sm text-[#666]">{summary.count} đánh giá</p>
        <div className="mt-5 flex flex-col gap-1.5" role="group" aria-label="Lọc theo số sao">
          <button type="button" aria-pressed={rating === ''} onClick={() => { setRating(''); setPage(1) }} className={`rounded-lg px-3 py-2 text-left text-sm ${rating === '' ? 'bg-black text-white' : 'bg-[#f4f4f4]'}`}>Tất cả</button>
          {[5, 4, 3, 2, 1].map(star => <button key={star} type="button" aria-pressed={rating === String(star)} onClick={() => { setRating(String(star)); setPage(1) }} className={`flex justify-between rounded-lg px-3 py-2 text-sm ${rating === String(star) ? 'bg-black text-white' : 'bg-[#f4f4f4]'}`}><span>{star} sao</span><span>{summary.distribution[star]}</span></button>)}
        </div>
      </div>
      <div>
        {list.length === 0 ? <p className="text-[#666]">Không có đánh giá nào ở mức sao này.</p> : <ul className="flex flex-col divide-y divide-[#f1f1f1]">
          {list.map(review => <li key={review.id} className="py-5 first:pt-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><Stars value={review.rating} /><span className="font-medium">{review.user.name}</span><span className="text-sm text-[#888]">{formatDate(review.created_at)}</span></div>
            {review.comment && <p className="mt-2 leading-[1.6]">{review.comment}</p>}
            {review.admin_reply && <p className="mt-3 rounded-lg bg-[#f4f4f4] p-3 text-sm"><strong>Phản hồi từ cửa hàng:</strong> {review.admin_reply}</p>}
          </li>)}
        </ul>}
        {lastPage > 1 && <div className="mt-6 flex items-center gap-3 text-sm">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-full border border-[#ddd] px-4 py-2 disabled:opacity-40">Trang trước</button>
          <span>{page} / {lastPage}</span>
          <button type="button" disabled={page >= lastPage} onClick={() => setPage(page + 1)} className="rounded-full border border-[#ddd] px-4 py-2 disabled:opacity-40">Trang sau</button>
        </div>}
      </div>
    </div>}
  </section>
}
