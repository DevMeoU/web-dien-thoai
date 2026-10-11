import { apiDownload, apiRequest } from './api'

/** API quản trị. Mỗi tài nguyên có cùng các thao tác danh sách, chi tiết, tạo, sửa, xóa. */
export const adminService = {
  dashboard: params => apiRequest('/admin/dashboard', { params }),
  report: params => apiRequest('/admin/reports', { params }),
  exportReport: params => apiDownload('/admin/reports/export', params),

  list: (resource, params) => apiRequest(`/admin/${resource}`, { params }),
  get: (resource, id) => apiRequest(`/admin/${resource}/${id}`),
  create: (resource, body) => apiRequest(`/admin/${resource}`, { method: 'POST', body }),
  update: (resource, id, body) => apiRequest(`/admin/${resource}/${id}`, { method: 'PUT', body }),
  remove: (resource, id) => apiRequest(`/admin/${resource}/${id}`, { method: 'DELETE' }),
  patchItem: (resource, id, body) => apiRequest(`/admin/${resource}/${id}`, { method: 'PATCH', body }),
  patch: (resource, id, action, body) => apiRequest(`/admin/${resource}/${id}/${action}`, { method: 'PATCH', body }),
  post: (resource, id, action, body) => apiRequest(`/admin/${resource}/${id}/${action}`, { method: 'POST', body }),
  upload: (resource, id, action, file) => { const form = new FormData(); form.append('image', file); return apiRequest(`/admin/${resource}/${id}/${action}`, { method: 'POST', body: form }) },

  variants: {
    create: (productId, body) => apiRequest(`/admin/products/${productId}/variants`, { method: 'POST', body }),
    update: (id, body) => apiRequest(`/admin/variants/${id}`, { method: 'PUT', body }),
    remove: id => apiRequest(`/admin/variants/${id}`, { method: 'DELETE' }),
  },
  removeProductImage: (productId, imageId) => apiRequest(`/admin/products/${productId}/images/${imageId}`, { method: 'DELETE' }),
  setStock: (variantId, stock) => apiRequest(`/admin/inventory/${variantId}`, { method: 'PATCH', body: { stock } }),

  settings: () => apiRequest('/admin/settings'),
  saveSettings: body => apiRequest('/admin/settings', { method: 'PUT', body }),
  pages: () => apiRequest('/admin/pages'),
  savePage: (slug, body) => apiRequest(`/admin/pages/${slug}`, { method: 'PUT', body }),
}
