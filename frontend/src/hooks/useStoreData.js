import { useEffect, useState } from 'react'
import { shopService } from '../services/shopService'
import { mapProduct } from '../utils/product'

const TTL = 60_000
const caches = {}
const inflight = {}

/** Tải một lần rồi dùng lại trong TTL để các trang không gọi API lặp lại. */
function useCached(key, load, initial) {
  const fresh = () => caches[key] && Date.now() - caches[key].at < TTL
  const [state, setState] = useState(() => ({ data: fresh() ? caches[key].data : initial, loading: !fresh(), error: null }))
  useEffect(() => {
    if (fresh()) return undefined
    let alive = true
    // Các component cùng cần một dữ liệu sẽ dùng chung một lượt gọi API.
    inflight[key] ??= load().then(data => { caches[key] = { data, at: Date.now() }; return data }).finally(() => { delete inflight[key] })
    inflight[key].then(data => { if (alive) setState({ data, loading: false, error: null }) })
      .catch(error => { if (alive) setState({ data: initial, loading: false, error }) })
    return () => { alive = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return state
}

export function invalidateStoreData() {
  for (const key of Object.keys(caches)) delete caches[key]
}

/** Toàn bộ sản phẩm đang bán (tối đa 100) để lọc, tìm và sắp xếp ngay trên trình duyệt. */
export function useCatalog() {
  const { data, loading, error } = useCached('catalog', async () => (await shopService.products({ per_page: 100 })).data.map(mapProduct), [])
  return { products: data, loading, error }
}

/** Sản phẩm bán chạy nhất (theo số lượng trong các đơn chưa hủy), lấy từ API vì cần dữ liệu bán hàng. */
export function useBestSellers() {
  return useCached('best-sellers', async () => (await shopService.products({ sort: 'best_selling', per_page: 6 })).data.map(mapProduct), []).data
}

export function useCategories() {
  return useCached('categories', async () => (await shopService.categories()).data, []).data
}

/** Banner đang hiển thị: `hero` ở đầu trang chủ, `collection` là các thẻ bộ sưu tập. */
export function useBanners(position = 'hero') {
  return useCached(`banners-${position}`, async () => (await shopService.banners({ position })).data, []).data
}

/** Nhận xét tốt của khách hàng để giới thiệu ở trang chủ. */
export function useFeaturedReviews() {
  return useCached('featured-reviews', async () => (await shopService.featuredReviews()).data, []).data
}

const DEFAULT_SETTINGS = {
  store_name: 'Mela', contact_email: '', contact_phone: '', contact_address: '', about_content: '',
  shipping_fee: '30000', free_shipping_threshold: '2000000',
}

export function useStoreSettings() {
  return useCached('settings', async () => ({ ...DEFAULT_SETTINGS, ...(await shopService.settings()).data }), DEFAULT_SETTINGS).data
}

/** Phí giao hàng theo cấu hình cửa hàng: miễn phí khi tạm tính đạt ngưỡng. */
export function shippingFor(subtotal, settings) {
  const threshold = Number(settings.free_shipping_threshold)
  return subtotal <= 0 || (threshold > 0 && subtotal >= threshold) ? 0 : Number(settings.shipping_fee)
}
