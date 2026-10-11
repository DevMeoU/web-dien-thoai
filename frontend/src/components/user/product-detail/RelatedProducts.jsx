import { useEffect, useState } from 'react'
import { shopService } from '../../../services/shopService'
import { mapProduct } from '../../../utils/product'
import ProductCard from '../home/ProductCard'
import AllProductsLink from '../home/AllProductsLink'
import Reveal from '../home/Reveal'

export default function RelatedProducts({ productKey }) {
  const [related, setRelated] = useState([])
  useEffect(() => {
    let alive = true
    shopService.related(productKey).then(response => { if (alive) setRelated(response.data.map(mapProduct)) }).catch(() => {})
    return () => { alive = false }
  }, [productKey])
  if (!related.length) return null
  return <section className="mx-auto max-w-[1488px] px-4 py-12 tablet:px-6 tablet:py-20" aria-labelledby="related-products-title">
    <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-5 tablet:mb-12"><h2 id="related-products-title" className="text-[28px] leading-[1.2] font-medium desktop:text-[34px]">Có thể bạn cũng thích</h2><AllProductsLink /></Reveal>
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 tablet:grid-cols-3 tablet:gap-5">{related.map((item, index) => <ProductCard key={item.id} product={item} delay={index * 0.08} compact />)}</div>
  </section>
}
