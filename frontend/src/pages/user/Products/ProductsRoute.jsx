import { lazy, Suspense } from 'react'

const ProductsPage = lazy(() => import('./index'))

export default function ProductsRoute() {
  return <Suspense fallback={<div className="mx-auto min-h-[65vh] max-w-[1440px] px-6 pt-[120px] pb-16" role="status">Đang tải sản phẩm...</div>}><ProductsPage /></Suspense>
}
