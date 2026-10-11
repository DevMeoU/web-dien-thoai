const options = (configuration, color) => [configuration, color].filter(Boolean).join(' / ') || 'Mặc định'

/** Chuẩn hóa dòng đơn hàng từ API cho `OrderItemsList`. */
export const orderLineItems = order => order.items.map(item => ({
  key: item.id, name: item.product_name, image: item.image_url, quantity: item.quantity, lineTotal: item.line_total,
  meta: options(item.configuration, item.color), to: `/products/${item.product_id}`,
}))

/** Chuẩn hóa dòng giỏ hàng từ API cho `OrderItemsList`. */
export const cartLineItems = cart => cart.items.map(item => ({
  key: item.id, name: item.product.name, image: item.product.thumbnail_url, quantity: item.quantity, lineTotal: item.line_total,
  meta: options(item.variant.configuration, item.variant.color), to: `/products/${item.product.slug}`,
}))
