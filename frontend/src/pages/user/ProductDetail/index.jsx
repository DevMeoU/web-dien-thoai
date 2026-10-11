import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CaretRight } from '@phosphor-icons/react'
import { shopService } from '../../../services/shopService'
import { useStoreSettings } from '../../../hooks/useStoreData'
import { mapProduct } from '../../../utils/product'
import ProductGallery from '../../../components/user/product-detail/ProductGallery'
import ProductInformation from '../../../components/user/product-detail/ProductInformation'
import ProductReviews from '../../../components/user/product-detail/ProductReviews'
import ProductStory from '../../../components/user/product-detail/ProductStory'
import RelatedProducts from '../../../components/user/product-detail/RelatedProducts'
import BenefitsSection from '../../../components/user/home/BenefitsSection'

const shell = 'mx-auto min-h-[65vh] max-w-[1440px] px-4 pt-[140px] pb-20 tablet:px-6'

export default function ProductDetailPage() {
  const { id } = useParams()
  const settings = useStoreSettings()
  const [state, setState] = useState({ key: null, detail: null, status: 'loading' })
  const [variantImage, setVariantImage] = useState(null)

  useEffect(() => {
    let alive = true
    shopService.product(id)
      .then(response => { if (alive) setState({ key: id, detail: response.data, status: 'ready' }) })
      .catch(error => { if (alive) setState({ key: id, detail: null, status: error.status === 404 ? 'missing' : 'error' }) })
    return () => { alive = false }
  }, [id])

  const ready = state.key === id && state.status === 'ready'
  const detail = ready ? state.detail : null
  useEffect(() => {
    const previousTitle = document.title
    document.title = `${detail?.name ?? 'Sản phẩm'} | ${settings.store_name}`
    return () => { document.title = previousTitle }
  }, [detail, settings.store_name])

  if (state.key !== id || state.status === 'loading') return <section className={shell} role="status">Đang tải chi tiết sản phẩm...</section>
  if (state.status !== 'ready') return <section className={shell}>
    <h1 className="mb-4 text-[32px] font-medium">{state.status === 'missing' ? 'Không tìm thấy sản phẩm' : 'Không tải được sản phẩm'}</h1>
    <p className="mb-8 text-[#666]">{state.status === 'missing' ? 'Sản phẩm này không còn được bán hoặc không tồn tại.' : 'Hãy kiểm tra máy chủ API rồi thử lại.'}</p>
    <Link to="/products" className="inline-flex rounded-full bg-black px-6 py-3 text-white">Xem tất cả sản phẩm</Link>
  </section>

  const product = mapProduct(detail)
  const gallery = [variantImage, product.image, ...(detail.images ?? []).map(image => image.url)].filter((url, index, all) => url && all.indexOf(url) === index)
  return <>
    <section className="mx-auto max-w-[1488px] px-4 pt-[104px] pb-12 tablet:px-6 tablet:pt-[120px] tablet:pb-[60px]" aria-label="Chi tiết sản phẩm">
      <nav aria-label="Đường dẫn" className="mb-7 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm tablet:mb-8 tablet:text-base">
        <Link to="/" className="hover:underline">Trang chủ</Link><CaretRight aria-hidden="true" size={12} className="text-[#999]" />
        <Link to="/products" className="hover:underline">Sản phẩm</Link><CaretRight aria-hidden="true" size={12} className="text-[#999]" />
        <span aria-current="page" className="text-[#777]">{product.name}</span>
      </nav>
      <div className="grid items-start gap-8 tablet:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] tablet:gap-10 desktop:gap-20">
        <ProductGallery key={`gallery-${id}-${variantImage}`} product={product} images={gallery.length ? gallery : ['/images/home/hero.png']} />
        <ProductInformation key={`information-${id}`} product={product} detail={detail} onVariantImageChange={setVariantImage} />
      </div>
    </section>
    <ProductStory product={product} detail={detail} storeName={settings.store_name} />
    <ProductReviews key={`reviews-${id}`} productKey={id} />
    <RelatedProducts productKey={id} />
    <BenefitsSection />
  </>
}
