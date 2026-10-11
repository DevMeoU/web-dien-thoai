import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { useCatalog } from '../../../hooks/useStoreData'
import { normalizeSearch } from '../../../utils/search'

export default function ProductSearchDialog({ open, onClose, onNavigate, returnFocusRef }) {
  const { products } = useCatalog()
  const [query, setQuery] = useState('')
  const dialog = useRef(null)
  const searchInput = useRef(null)

  useEffect(() => {
    const element = dialog.current
    const returnFocusElement = returnFocusRef.current
    if (open) {
      element.showModal()
      searchInput.current.focus()
    }
    return () => {
      if (element.open) {
        element.close()
        returnFocusElement?.focus()
      }
    }
  }, [open, returnFocusRef])

  const close = () => { setQuery(''); onClose() }
  const navigate = () => { setQuery(''); onNavigate() }
  const results = query.trim() ? products.filter(product => normalizeSearch(product.name).includes(normalizeSearch(query))) : []

  return <dialog ref={dialog} className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-auto border-0 bg-transparent p-0 text-black backdrop:bg-black/80 tablet:p-6" aria-label="Tìm kiếm sản phẩm" onCancel={event => { event.preventDefault(); close() }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); close() } }} onClick={event => { if (event.target === event.currentTarget) close() }}>
    <div className="mx-auto max-w-[960px] overflow-hidden bg-white tablet:rounded-lg" data-lenis-prevent>
      <div className="flex h-14 items-center gap-3 px-4 py-2">
        <MagnifyingGlass size={20} className="shrink-0 text-[#999]" aria-hidden="true" />
        <input className="w-0 min-w-0 flex-1 border-0 font-[inherit] outline-none" ref={searchInput} value={query} onChange={event => setQuery(event.target.value)} aria-label="Tìm kiếm sản phẩm" placeholder="Nhập tên sản phẩm..." type="search" />
        <button className="flex size-8 items-center justify-center border-0 bg-transparent p-0 text-[#888]" aria-label="Đóng tìm kiếm" onClick={close}><X size={20} /></button>
      </div>
      {query.trim() && <div className="max-h-[65vh] overflow-auto px-4 pb-4" aria-live="polite">
        {results.length ? results.map(product => <Link className="flex items-center gap-4 py-3 hover:bg-[#f4f4f4]" key={product.id} to={`/products/${product.id}`} onClick={navigate}>
          <img className="size-16 rounded object-cover" src={product.image} alt="" width="64" height="64" />
          <span>{product.name}<small className="mt-1 block font-bold">{product.price}</small></span>
        </Link>) : <p>Không tìm thấy sản phẩm.</p>}
      </div>}
    </div>
  </dialog>
}
