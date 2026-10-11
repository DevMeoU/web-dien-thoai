const buttonClass = 'flex size-10 items-center justify-center rounded-full border border-[#ddd] text-sm transition-colors duration-200 ease-[ease] hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent motion-reduce:transition-none'

export default function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null
  return <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Phân trang">
    <button type="button" className={buttonClass} aria-label="Trang trước" disabled={page <= 1} onClick={() => onChange(page - 1)}>‹</button>
    {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} type="button" className={`${buttonClass} ${number === page ? 'border-black bg-black text-white hover:bg-black' : ''}`} aria-label={`Trang ${number}`} aria-current={number === page ? 'page' : undefined} onClick={() => onChange(number)}>{number}</button>)}
    <button type="button" className={buttonClass} aria-label="Trang sau" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>›</button>
  </nav>
}
