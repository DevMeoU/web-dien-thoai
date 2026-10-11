import { apiRequest } from './api'

export const productService = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString()
    return apiRequest('/products' + (query ? '?' + query : ''))
  },
  detail(id) { return apiRequest('/products/' + encodeURIComponent(id)) },
}

