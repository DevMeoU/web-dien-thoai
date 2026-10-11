import { Link } from 'react-router-dom'
import { useCategories } from '../../../hooks/useStoreData'
import Reveal from './Reveal'

/** Liên kết nhanh tới các dòng thiết bị và phụ kiện (danh mục cấp cha). */
export default function CategoryLinks() {
  const categories = useCategories()
  if (categories.length === 0) return null
  return <section data-home-section="categories" className="px-4 pt-8 tablet:px-6 tablet:pt-[60px]" aria-label="Mua sắm theo danh mục">
    <Reveal className="mx-auto flex w-full max-w-[1440px] flex-wrap justify-center gap-3">
      {categories.map(category => <Link key={category.id} to={`/products?category=${encodeURIComponent(category.slug)}`} className="rounded-full border border-[#e5e5e5] px-6 py-3 text-sm font-medium transition-colors hover:border-black hover:bg-black hover:text-white motion-reduce:transition-none">{category.name}</Link>)}
    </Reveal>
  </section>
}
