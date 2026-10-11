import { Link } from 'react-router-dom'
import { CaretRight } from '@phosphor-icons/react'
import Reveal from '../home/Reveal'
import { collections } from './catalog'

export default function CatalogHeader({ collection, onCollectionChange }) {
  return <header className="pb-8 tablet:pb-12">
    <nav aria-label="Đường dẫn trang" className="mb-8 flex items-center gap-2 text-sm text-[#777] tablet:mb-10">
      <Link to="/" className="transition-colors hover:text-black motion-reduce:transition-none">Trang chủ</Link>
      <CaretRight size={12} aria-hidden="true" /><span aria-current="page" className="text-black">Sản phẩm</span>
    </nav>
    <Reveal>
      <h1 className="max-w-[1000px] text-[36px] leading-[1.15] font-medium tracking-[-0.04em] tablet:text-[52px] desktop:text-[64px]">Sản phẩm Apple chính hãng.</h1>
      <p className="mt-4 max-w-[540px] leading-[1.6] text-[#666]">iPhone, MacBook, iPad, Apple Watch, AirPods và phụ kiện. Lọc theo dòng máy, dung lượng, màu sắc và mức giá để tìm đúng thiết bị cho bạn.</p>
    </Reveal>
    <div className="mt-8 flex gap-7 border-b border-[#e8e8e8] tablet:mt-10 tablet:gap-10" role="group" aria-label="Nhu cầu sử dụng">
      {collections.map(item => <button key={item.value} type="button" aria-pressed={collection === item.value} onClick={() => onCollectionChange(item.value)} className={`relative pb-4 text-sm font-medium transition-colors tablet:text-base motion-reduce:transition-none ${collection === item.value ? 'text-black after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-black' : 'text-[#777] hover:text-black'}`}>{item.label}</button>)}
    </div>
  </header>
}
