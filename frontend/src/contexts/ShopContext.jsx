import { useCallback, useEffect, useMemo, useState } from 'react'
import { accountService } from '../services/accountService'
import { mapProduct } from '../utils/product'
import { useAuth } from './authState'
import { ShopContext } from './shopState'

const EMPTY = { userId: null, cart: null, wishlist: [] }

async function loadShopData() {
  const [cart, wishlist] = await Promise.all([accountService.cart(), accountService.wishlist()])
  return { cart: cart.data, wishlist: wishlist.data.map(mapProduct) }
}

/** Giỏ hàng và danh sách yêu thích của tài khoản đang đăng nhập, đồng bộ với máy chủ. */
export function ShopProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id
  const [state, setState] = useState(EMPTY)
  // Dữ liệu chỉ có hiệu lực cho đúng tài khoản đã tải; đổi tài khoản thì coi như chưa có.
  const current = state.userId === userId ? state : EMPTY
  const loading = Boolean(userId) && state.userId !== userId

  useEffect(() => {
    if (!userId) return undefined
    let alive = true
    loadShopData()
      .then(data => { if (alive) setState({ userId, ...data }) })
      .catch(() => { if (alive) setState({ ...EMPTY, userId }) })
    return () => { alive = false }
  }, [userId])

  const refresh = useCallback(async () => setState({ userId, ...await loadShopData() }), [userId])

  const run = useCallback(async request => {
    const response = await request
    setState(previous => ({ ...previous, userId, cart: response.data }))
    return response.data
  }, [userId])
  const addToCart = useCallback((variantId, quantity) => run(accountService.addCartItem(variantId, quantity)), [run])
  const updateCartItem = useCallback((itemId, quantity) => run(accountService.updateCartItem(itemId, quantity)), [run])
  const removeCartItem = useCallback(itemId => run(accountService.removeCartItem(itemId)), [run])

  const toggleWishlist = useCallback(async product => {
    const saved = current.wishlist.some(item => item.productId === product.productId)
    if (saved) {
      await accountService.removeWishlist(product.productId)
      setState(previous => ({ ...previous, wishlist: previous.wishlist.filter(item => item.productId !== product.productId) }))
    } else {
      const response = await accountService.addWishlist(product.productId)
      setState(previous => ({ ...previous, wishlist: response.data.map(mapProduct) }))
    }
  }, [current.wishlist])

  const value = useMemo(() => ({
    cart: current.cart, cartCount: current.cart?.item_count ?? 0, wishlist: current.wishlist, wishlistCount: current.wishlist.length, loading,
    isWishlisted: productId => current.wishlist.some(item => item.productId === productId),
    refresh, addToCart, updateCartItem, removeCartItem, toggleWishlist,
  }), [current, loading, refresh, addToCart, updateCartItem, removeCartItem, toggleWishlist])
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}
