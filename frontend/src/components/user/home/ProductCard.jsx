import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import WishlistButton from '../WishlistButton'

export default function ProductCard({ product, delay = 0, compact = false }) {
  return <Reveal className="relative" delay={delay}>
    <Link to={`/products/${product.id}`} className="group flex flex-col gap-2.5" aria-label={`${product.name}, ${product.price}`}>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f4f4f4]">
        <img className="block h-full w-full rounded-lg object-cover transition-transform duration-500 ease-[ease] group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none" src={product.image} alt={product.name} width="1254" height="1254" loading="lazy" />
        {product.onSale && <span className="absolute top-3 left-3 rounded-full bg-black px-2.5 py-1 text-xs font-medium text-white">−{product.discountPercent}%</span>}
        {product.available === false && <span className="absolute bottom-3 left-3 rounded-full bg-white px-2.5 py-1 text-xs font-medium">Ngừng bán</span>}
        {product.available !== false && !product.inStock && <span className="absolute bottom-3 left-3 rounded-full bg-white px-2.5 py-1 text-xs font-medium">Hết hàng</span>}
        <span className="absolute bottom-0 left-0 w-full translate-y-full rounded-b-lg bg-black py-3 text-center text-white transition-transform duration-300 ease-[ease] group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none" aria-hidden="true">XEM SẢN PHẨM</span>
      </div>
      <div className="flex flex-col gap-1">
        <p className={compact ? 'min-h-[42px] text-sm leading-[1.5] tablet:min-h-0 tablet:text-base tablet:leading-[1.4]' : ''}>{product.name}</p>
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm leading-[1.4]"><span className="font-bold">{product.price}</span>{product.comparePrice && <span className="text-[#999] line-through">{product.comparePrice}</span>}</p>
      </div>
    </Link>
    <WishlistButton product={product} className="absolute top-3 right-3 z-10" />
  </Reveal>
}
