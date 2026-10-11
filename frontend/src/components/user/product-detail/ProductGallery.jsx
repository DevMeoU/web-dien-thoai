import { useState } from 'react'

export default function ProductGallery({ product, images, focusUrl }) {
  const [picked, setPicked] = useState(null)
  // Đổi màu ở khung thông tin thì ảnh tương ứng được chọn lại.
  const [seenFocus, setSeenFocus] = useState(focusUrl)
  if (focusUrl !== seenFocus) { setSeenFocus(focusUrl); setPicked(null) }
  const focused = focusUrl ? images.indexOf(focusUrl) : -1
  const active = picked ?? (focused >= 0 ? focused : 0)
  const setActive = setPicked
  const current = images[Math.min(active, images.length - 1)]
  return <div className="flex min-w-0 items-start gap-2.5">
    {images.length > 1 && <div className="flex w-[60px] shrink-0 flex-col gap-2.5 desktop:w-[84px]" aria-label="Ảnh sản phẩm">
      {images.map((url, index) => <button type="button" key={url} aria-label={`Ảnh ${index + 1} của ${product.name}`} aria-pressed={active === index} onClick={() => setActive(index)} className={`aspect-square overflow-hidden rounded-md border bg-[#f4f4f4] p-0 ${active === index ? 'border-black' : 'border-transparent opacity-70 hover:opacity-100'}`}>
        <img src={url} alt="" width={1254} height={1254} className="size-full rounded-sm object-cover" />
      </button>)}
    </div>}
    <div className="aspect-square min-w-0 flex-1 overflow-hidden rounded-lg bg-[#f4f4f4]" aria-live="polite">
      <img src={current} alt={product.name} width={1254} height={1254} fetchPriority="high" className="size-full object-cover" />
    </div>
  </div>
}
