import { formatCurrency } from './format'

/** Chuyển sản phẩm từ API sang dạng mà các component giao diện đang dùng. `id` là slug dùng trên URL. */
export function mapProduct(product) {
  return {
    id: product.slug,
    productId: product.id,
    code: product.code,
    name: product.name,
    amount: Number(product.price),
    price: formatCurrency(product.price),
    compareAt: product.compare_at_price ? Number(product.compare_at_price) : null,
    comparePrice: product.compare_at_price ? formatCurrency(product.compare_at_price) : null,
    onSale: product.is_on_sale,
    discountPercent: product.discount_percent,
    image: product.thumbnail_url,
    category: product.category?.slug ?? '',
    categoryName: product.category?.name ?? '',
    color: product.colors?.[0]?.value ?? '',
    colors: product.colors ?? [],
    configurations: product.configurations ?? [],
    tagline: product.tagline ?? '',
    collections: product.collections ?? [],
    rating: product.rating_avg ?? 0,
    ratingCount: product.rating_count ?? 0,
    inStock: product.in_stock,
    status: product.status,
    isNew: product.is_new,
    isFeatured: product.is_featured,
    available: product.status === 'active',
  }
}
