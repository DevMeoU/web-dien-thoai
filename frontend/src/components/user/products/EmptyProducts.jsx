import { MagnifyingGlass } from '@phosphor-icons/react'

export default function EmptyProducts({ onReset }) {
  return <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl bg-[#f4f4f4] px-6 py-12 text-center">
    <MagnifyingGlass size={32} className="mb-5 text-[#999]" aria-hidden="true" />
    <h2 className="text-xl font-medium">Chưa tìm thấy sản phẩm phù hợp</h2>
    <p className="mt-3 max-w-[340px] text-sm leading-relaxed text-[#777]">Thử từ khóa khác hoặc thay đổi bộ lọc để khám phá thêm sản phẩm.</p>
    <button type="button" onClick={onReset} className="mt-6 rounded-full bg-black px-6 py-3 text-sm text-white transition-colors hover:bg-[#333] motion-reduce:transition-none">Xem tất cả sản phẩm</button>
  </div>
}
