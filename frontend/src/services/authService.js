import { apiRequest } from './api'

export const authService = {
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
  register: body => apiRequest('/auth/register', { method: 'POST', body }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  forgotPassword: email => apiRequest('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: body => apiRequest('/auth/reset-password', { method: 'POST', body }),
  profile: () => apiRequest('/profile'),
}
