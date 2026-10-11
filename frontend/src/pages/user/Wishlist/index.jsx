import { Heart } from '@phosphor-icons/react'
import { useShop } from '../../../contexts/shopState'
import ProductCard from '../../../components/user/home/ProductCard'
import EmptyState from '../../../components/user/shopping/EmptyState'
import PageTitle from '../../../components/user/shopping/PageTitle'

export default function WishlistPage() {
  const { wishlist: products, loading } = useShop()
  if (loading && products.length === 0) return <p className="py-16 text-center text-[#666]" role="status">Đang tải danh sách yêu thích...</p>
  const unavailable = products.filter(product => !product.available || !product.inStock).length
  return <div className="flex flex-col gap-8">
    <PageTitle title="Sản phẩm yêu thích" description={products.length ? `Bạn đã lưu ${products.length} sản phẩm vào tài khoản.` : 'Bạn chưa lưu sản phẩm nào.'} />
    {unavailable > 0 && <p className="rounded-[10px] bg-amber-50 p-3 text-sm text-amber-800" role="status">{unavailable} sản phẩm hiện đã hết hàng hoặc ngừng bán.</p>}
    {products.length === 0
      ? <EmptyState icon={Heart} title="Danh sách yêu thích trống" text="Nhấn vào biểu tượng trái tim trên sản phẩm để lưu lại và xem sau." />
      : <ul className="grid grid-cols-2 gap-4 tablet:grid-cols-3 tablet:gap-6 desktop:grid-cols-4">
        {products.map(product => <li key={product.productId}><ProductCard product={product} compact /></li>)}
      </ul>}
  </div>
}
