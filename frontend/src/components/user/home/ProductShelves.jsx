import { useCatalog, useBestSellers } from '../../../hooks/useStoreData'
import ProductShelf from './ProductShelf'

const SHELF_SIZE = 4

/** Các hàng sản phẩm nổi bật, bán chạy và đang giảm giá. */
export default function ProductShelves() {
  const { products } = useCatalog()
  const bestSellers = useBestSellers()
  const featured = products.filter(product => product.isFeatured).sort((a, b) => Number(b.category.startsWith('iphone')) - Number(a.category.startsWith('iphone')))
  return <>
    <ProductShelf id="featured" title="Sản phẩm nổi bật" description="Những thiết bị đáng khám phá cho công việc và cuộc sống." products={featured.slice(0, SHELF_SIZE)} />
    <ProductShelf id="best-sellers" title="Bán chạy nhất" description="Những thiết bị được khách hàng lựa chọn nhiều nhất." products={bestSellers.slice(0, SHELF_SIZE)} />
    <ProductShelf id="on-sale" title="Đang giảm giá" description="Chọn thiết bị yêu thích với mức giá tốt hơn." products={products.filter(product => product.onSale).slice(0, SHELF_SIZE)} />
  </>
}
