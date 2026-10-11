import { apiRequest } from './api'

/** API cần đăng nhập: hồ sơ, địa chỉ, giỏ hàng, yêu thích, đơn hàng, đánh giá. */
export const accountService = {
  updateProfile: body => apiRequest('/profile', { method: 'PUT', body }),
  changePassword: body => apiRequest('/profile/password', { method: 'PUT', body }),
  uploadAvatar: file => { const form = new FormData(); form.append('image', file); return apiRequest('/profile/avatar', { method: 'POST', body: form }) },

  addresses: () => apiRequest('/addresses'),
  createAddress: body => apiRequest('/addresses', { method: 'POST', body }),
  updateAddress: (id, body) => apiRequest(`/addresses/${id}`, { method: 'PUT', body }),
  setDefaultAddress: id => apiRequest(`/addresses/${id}/default`, { method: 'PATCH' }),
  deleteAddress: id => apiRequest(`/addresses/${id}`, { method: 'DELETE' }),

  cart: () => apiRequest('/cart'),
  addCartItem: (variantId, quantity) => apiRequest('/cart/items', { method: 'POST', body: { product_variant_id: variantId, quantity } }),
  updateCartItem: (id, quantity) => apiRequest(`/cart/items/${id}`, { method: 'PUT', body: { quantity } }),
  removeCartItem: id => apiRequest(`/cart/items/${id}`, { method: 'DELETE' }),

  wishlist: () => apiRequest('/wishlist'),
  addWishlist: productId => apiRequest('/wishlist', { method: 'POST', body: { product_id: productId } }),
  removeWishlist: productId => apiRequest(`/wishlist/${productId}`, { method: 'DELETE' }),

  checkoutPreview: couponCode => apiRequest('/checkout/preview', { method: 'POST', body: { coupon_code: couponCode || null } }),
  placeOrder: body => apiRequest('/orders', { method: 'POST', body }),
  orders: params => apiRequest('/orders', { params }),
  order: code => apiRequest(`/orders/${encodeURIComponent(code)}`),
  cancelOrder: (code, reason) => apiRequest(`/orders/${encodeURIComponent(code)}/cancel`, { method: 'POST', body: { reason } }),

  eligibleReviews: () => apiRequest('/reviews/eligible'),
  myReviews: () => apiRequest('/reviews/mine'),
  createReview: body => apiRequest('/reviews', { method: 'POST', body }),
  updateReview: (id, body) => apiRequest(`/reviews/${id}`, { method: 'PUT', body }),
  deleteReview: id => apiRequest(`/reviews/${id}`, { method: 'DELETE' }),
}
