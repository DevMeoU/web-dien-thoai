import { lazy, Suspense } from 'react'

const ProductDetailPage = lazy(() => import('./index'))

export default function ProductDetailRoute() {
  return <Suspense fallback={<div className="min-h-[65vh] px-6 pt-[120px]" role="status">Đang tải chi tiết sản phẩm...</div>}><ProductDetailPage /></Suspense>
}
