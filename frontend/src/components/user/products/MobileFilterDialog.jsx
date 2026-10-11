import { useEffect, useRef } from 'react'
import { X } from '@phosphor-icons/react'
import ProductFilters from './ProductFilters'

export default function MobileFilterDialog({ open, onClose, count, ...filterProps }) {
  const dialog = useRef(null)
  useEffect(() => {
    const element = dialog.current
    const returnFocusElement = document.activeElement
    if (open) element.showModal()
    return () => {
      if (element.open) {
        element.close()
        returnFocusElement?.focus()
      }
    }
  }, [open])
  return <dialog ref={dialog} aria-labelledby="mobile-filter-title" className="fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[440px] overflow-auto rounded-xl border-0 bg-white p-5 text-black backdrop:bg-black/50" onCancel={event => { event.preventDefault(); onClose() }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); onClose() } }} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="mb-6 flex items-center justify-between">
      <h2 id="mobile-filter-title" className="text-xl font-medium">Lọc sản phẩm</h2>
      <button type="button" aria-label="Đóng bộ lọc" onClick={onClose} className="flex size-9 items-center justify-center rounded-full bg-[#f4f4f4]"><X size={18} /></button>
    </div>
    <ProductFilters {...filterProps} />
    <button type="button" onClick={onClose} className="mt-7 min-h-12 w-full rounded-full bg-black px-5 text-sm text-white">Xem {count} sản phẩm</button>
  </dialog>
}
