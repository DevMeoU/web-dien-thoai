import { ShoppingBag } from '@phosphor-icons/react'
import { useShop } from '../../../contexts/shopState'
import CartItem from '../../../components/user/cart/CartItem'
import CartSummary from '../../../components/user/cart/CartSummary'
import EmptyState from '../../../components/user/shopping/EmptyState'
import PageTitle from '../../../components/user/shopping/PageTitle'

export default function CartPage() {
  const { cart, loading } = useShop()
  const items = cart?.items ?? []
  if (loading && !cart) return <p className="py-16 text-center text-[#666]" role="status">Đang tải giỏ hàng...</p>
  return <div className="flex flex-col gap-8">
    <PageTitle title="Giỏ hàng" description={items.length ? `Bạn có ${cart.item_count} sản phẩm trong giỏ hàng.` : 'Giỏ hàng của bạn đang trống.'} />
    {items.length === 0
      ? <EmptyState icon={ShoppingBag} title="Chưa có sản phẩm nào" text="Hãy chọn những món đồ bạn yêu thích, chúng sẽ xuất hiện ở đây." />
      : <div className="grid items-start gap-8 tablet:grid-cols-[minmax(0,1fr)_360px] tablet:gap-12">
        <ul aria-label="Sản phẩm trong giỏ hàng">{items.map(item => <CartItem key={item.id} item={item} />)}</ul>
        <CartSummary cart={cart} />
      </div>}
  </div>
}
