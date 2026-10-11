import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CatalogHeader from '../../../components/user/products/CatalogHeader'
import ProductFilters from '../../../components/user/products/ProductFilters'
import CatalogToolbar from '../../../components/user/products/CatalogToolbar'
import ActiveFilters from '../../../components/user/products/ActiveFilters'
import EmptyProducts from '../../../components/user/products/EmptyProducts'
import MobileFilterDialog from '../../../components/user/products/MobileFilterDialog'
import ProductCard from '../../../components/user/home/ProductCard'
import Pagination from '../../../components/user/shopping/Pagination'
import { buildCategoryOptions, collections, colorOptions, priceRanges, selectProducts, configurationOptions, sortOptions } from '../../../components/user/products/catalog'
import { useCatalog, useCategories } from '../../../hooks/useStoreData'

const PAGE_SIZE = 12

export default function ProductsPage() {
  const [params, setParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
  const { products: allProducts, loading, error } = useCatalog()
  const tree = useCategories()
  const { options: categories, groups } = useMemo(() => buildCategoryOptions(tree), [tree])
  const colors = useMemo(() => colorOptions(allProducts), [allProducts])
  const configs = useMemo(() => configurationOptions(allProducts).map(value => ({ value })), [allProducts])
  const selected = (key, options) => options.some(item => item.value === params.get(key)) ? params.get(key) : ''
  const filters = {
    q: params.get('q') ?? '', collection: selected('collection', collections),
    category: selected('category', categories), price: selected('price', priceRanges),
    color: selected('color', colors), config: selected('config', configs), sort: selected('sort', sortOptions),
  }
  const products = selectProducts(allProducts, filters, groups)
  const collectionProducts = allProducts.filter(product => !filters.collection || product.collections.includes(filters.collection))
  const activeCount = ['category', 'price', 'config', 'color'].filter(key => filters[key]).length
  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE))
  const page = Math.min(pageCount, Math.max(1, Number(params.get('page')) || 1))
  const visible = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Sản phẩm | Mela'
    return () => { document.title = previousTitle }
  }, [])

  function changeFilter(key, value) {
    setParams(previous => {
      const next = new URLSearchParams(previous)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      return next
    }, { replace: key === 'q' })
  }

  function changePage(value) {
    setParams(previous => {
      const next = new URLSearchParams(previous)
      if (value > 1) next.set('page', String(value))
      else next.delete('page')
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetFilters() {
    setParams(previous => {
      const next = new URLSearchParams(previous)
      for (const key of ['q', 'collection', 'category', 'price', 'config', 'color', 'page']) next.delete(key)
      return next
    })
  }

  const filterProps = { filters, products: collectionProducts, onChange: changeFilter, onReset: resetFilters }

  return <div className="mx-auto w-full max-w-[1488px] px-4 pt-[104px] pb-16 tablet:px-6 tablet:pt-[120px] tablet:pb-[100px]">
    <CatalogHeader collection={filters.collection} onCollectionChange={value => changeFilter('collection', value)} />
    <div className="grid min-w-0 gap-8 tablet:grid-cols-[210px_minmax(0,1fr)] desktop:grid-cols-[224px_minmax(0,1fr)] desktop:gap-12">
      <aside className="hidden tablet:block" aria-label="Bộ lọc sản phẩm">
        <div className="sticky top-[96px]"><ProductFilters {...filterProps} /></div>
      </aside>
      <section aria-label="Danh sách sản phẩm" className="min-w-0">
        <CatalogToolbar filters={filters} count={products.length} onChange={changeFilter} onOpenFilters={() => setFilterOpen(true)} activeCount={activeCount} />
        <ActiveFilters filters={filters} onChange={changeFilter} onReset={resetFilters} />
        {loading && <p className="py-16 text-center text-[#666]" role="status">Đang tải sản phẩm...</p>}
        {error && <p className="py-16 text-center text-red-700" role="alert">Không tải được sản phẩm. Hãy kiểm tra máy chủ API rồi thử lại.</p>}
        {!loading && !error && (visible.length ? <>
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 tablet:gap-x-5 tablet:gap-y-8 desktop:grid-cols-3">
            {visible.map(product => <ProductCard key={product.id} product={product} compact />)}
          </div>
          <div className="mt-10"><Pagination page={page} pageCount={pageCount} onChange={changePage} /></div>
        </> : <EmptyProducts onReset={resetFilters} />)}
      </section>
    </div>
    <MobileFilterDialog open={filterOpen} onClose={() => setFilterOpen(false)} count={products.length} {...filterProps} />
  </div>
}
