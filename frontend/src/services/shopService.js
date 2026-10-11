import { apiRequest } from './api'

/** Dữ liệu công khai: sản phẩm, danh mục, nội dung, liên hệ. */
export const shopService = {
  products: params => apiRequest('/products', { params }),
  product: key => apiRequest(`/products/${encodeURIComponent(key)}`),
  related: key => apiRequest(`/products/${encodeURIComponent(key)}/related`),
  productReviews: (key, params) => apiRequest(`/products/${encodeURIComponent(key)}/reviews`, { params }),
  categories: () => apiRequest('/categories'),
  banners: params => apiRequest('/banners', { params }),
  posts: params => apiRequest('/posts', { params }),
  post: slug => apiRequest(`/posts/${encodeURIComponent(slug)}`),
  featuredReviews: () => apiRequest('/reviews/featured'),
  subscribe: email => apiRequest('/newsletter', { method: 'POST', body: { email } }),
  settings: () => apiRequest('/settings'),
  pages: () => apiRequest('/pages'),
  page: slug => apiRequest(`/pages/${encodeURIComponent(slug)}`),
  sendContact: body => apiRequest('/contact-requests', { method: 'POST', body }),
}
