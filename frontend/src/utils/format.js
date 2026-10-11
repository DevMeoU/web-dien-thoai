const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })

export const formatCurrency = value => currency.format(Number(value) || 0)

export const formatDateTime = iso => iso ? new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—'

export const formatDate = iso => iso ? new Date(iso).toLocaleDateString('vi-VN') : '—'

/** Chuyển ngày ISO sang giá trị cho input type="date" (yyyy-mm-dd). */
export const toDateInput = iso => iso ? iso.slice(0, 10) : ''
