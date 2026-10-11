import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from '@phosphor-icons/react'
import { useAsync } from '../../../hooks/useAsync'
import { accountService } from '../../../services/accountService'
import { formatDate } from '../../../utils/format'
import { Stars } from '../../../components/user/product-detail/ProductReviews'
import { fieldClass, submitClass } from '../../../components/user/form/formStyles'
import PageTitle from '../../../components/user/shopping/PageTitle'

function StarPicker({ value, onChange }) {
  return <div className="flex gap-1" role="radiogroup" aria-label="Chọn số sao">
    {[1, 2, 3, 4, 5].map(star => <button key={star} type="button" role="radio" aria-checked={value === star} aria-label={`${star} sao`} onClick={() => onChange(star)} className="p-1">
      <Star size={28} weight={star <= value ? 'fill' : 'regular'} className={star <= value ? 'text-black' : 'text-[#bbb]'} />
    </button>)}
  </div>
}

function ReviewForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [rating, setRating] = useState(initial?.rating ?? 5)
  const [comment, setComment] = useState(initial?.comment ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try { await onSubmit({ rating, comment: comment.trim() || null }) } catch (failure) { setError(failure.message) } finally { setBusy(false) }
  }

  return <form onSubmit={submit} className="mt-3 flex flex-col gap-3">
    <StarPicker value={rating} onChange={setRating} />
    <textarea className={`${fieldClass} h-[90px] resize-y py-3`} value={comment} onChange={event => setComment(event.target.value)} placeholder="Chia sẻ cảm nhận của bạn về sản phẩm" maxLength={2000} aria-label="Nhận xét" />
    <div className="flex gap-3">
      <button type="submit" disabled={busy} className={`${submitClass} disabled:opacity-60`}>{submitLabel}</button>
      {onCancel && <button type="button" onClick={onCancel} className="rounded-[10px] border border-black px-8 py-3">Hủy</button>}
    </div>
    {error && <p className="text-[13px] text-red-700" role="alert">{error}</p>}
  </form>
}

function Pending({ onChanged }) {
  const { data, loading } = useAsync(() => accountService.eligibleReviews(), [])
  const [open, setOpen] = useState(null)
  const items = data?.data ?? []
  if (loading) return <p className="text-[#666]" role="status">Đang tải...</p>
  if (!items.length) return <p className="rounded-xl bg-[#f4f4f4] p-6 text-[#555]">Bạn chưa có sản phẩm nào cần đánh giá. Sau khi đơn hàng hoàn tất, sản phẩm sẽ xuất hiện ở đây.</p>
  return <ul className="flex flex-col gap-4">
    {items.map(item => <li key={item.order_item_id} className="rounded-xl border border-[#f1f1f1] p-5">
      <div className="flex items-center gap-4">
        {item.image_url && <img src={item.image_url} alt="" className="size-16 rounded-lg object-cover" width="64" height="64" />}
        <div className="flex-1"><p className="font-medium">{item.product_name}</p><p className="text-sm text-[#666]">Đơn {item.order_code}{item.configuration ? ` · ${item.configuration}` : ''}</p></div>
        {open !== item.order_item_id && <button type="button" onClick={() => setOpen(item.order_item_id)} className="rounded-full border border-black px-5 py-2 text-sm hover:bg-black hover:text-white">Viết đánh giá</button>}
      </div>
      {open === item.order_item_id && <ReviewForm submitLabel="Gửi đánh giá" onCancel={() => setOpen(null)} onSubmit={async body => { await accountService.createReview({ ...body, order_item_id: item.order_item_id }); onChanged() }} />}
    </li>)}
  </ul>
}

function Mine({ version, onChanged }) {
  const { data, loading } = useAsync(() => accountService.myReviews(), [version])
  const [editing, setEditing] = useState(null)
  const reviews = data?.data ?? []
  if (loading && !data) return <p className="text-[#666]" role="status">Đang tải...</p>
  if (!reviews.length) return <p className="rounded-xl bg-[#f4f4f4] p-6 text-[#555]">Bạn chưa viết đánh giá nào.</p>
  return <ul className="flex flex-col gap-4">
    {reviews.map(review => <li key={review.id} className="rounded-xl border border-[#f1f1f1] p-5">
      <div className="flex flex-wrap items-center gap-3"><Link to={`/products/${review.product.slug}`} className="font-medium hover:underline">{review.product.name}</Link><Stars value={review.rating} /><span className="text-sm text-[#888]">{formatDate(review.created_at)}</span></div>
      {editing === review.id
        ? <ReviewForm initial={review} submitLabel="Lưu thay đổi" onCancel={() => setEditing(null)} onSubmit={async body => { await accountService.updateReview(review.id, body); setEditing(null); onChanged() }} />
        : <>
          {review.comment && <p className="mt-2 leading-[1.6]">{review.comment}</p>}
          {review.admin_reply && <p className="mt-3 rounded-lg bg-[#f4f4f4] p-3 text-sm"><strong>Phản hồi từ cửa hàng:</strong> {review.admin_reply}</p>}
          <div className="mt-3 flex gap-4 text-sm">
            <button type="button" className="underline underline-offset-4" onClick={() => setEditing(review.id)}>Sửa</button>
            <button type="button" className="text-red-700 underline underline-offset-4" onClick={async () => { if (window.confirm('Xóa đánh giá này?')) { await accountService.deleteReview(review.id); onChanged() } }}>Xóa</button>
          </div>
        </>}
    </li>)}
  </ul>
}

export default function ReviewsPage() {
  const [tab, setTab] = useState('pending')
  const [version, setVersion] = useState(0)
  const changed = () => setVersion(value => value + 1)
  return <div className="flex flex-col gap-8">
    <PageTitle title="Đánh giá sản phẩm" description="Chia sẻ trải nghiệm của bạn với những sản phẩm đã nhận." />
    <div className="flex gap-2" role="tablist" aria-label="Đánh giá">
      {[['pending', 'Chờ đánh giá'], ['mine', 'Đánh giá của tôi']].map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`rounded-full border px-5 py-2 text-sm ${tab === key ? 'border-black bg-black text-white' : 'border-[#ddd] hover:bg-[#f4f4f4]'}`}>{label}</button>)}
    </div>
    {tab === 'pending' ? <Pending key={version} onChanged={changed} /> : <Mine version={version} onChanged={changed} />}
  </div>
}
