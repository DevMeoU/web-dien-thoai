// Vòng đời đơn hàng dùng chung cho trang khách và trang quản trị (khớp enum OrderStatus ở backend).
export const ORDER_FLOW = [['pending', 'Chờ xác nhận'], ['confirmed', 'Đã xác nhận'], ['shipping', 'Đang giao'], ['completed', 'Hoàn tất']]
export const ORDER_STATUSES = [...ORDER_FLOW, ['cancelled', 'Đã hủy']]

export const statusLabel = status => ORDER_STATUSES.find(([value]) => value === status)?.[1] ?? status

export const statusStyle = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipping: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
}

export const PAYMENT_METHODS = { cod: 'Thanh toán khi nhận hàng (COD)' }
export const PAYMENT_STATUS = { unpaid: 'Chưa thanh toán', paid: 'Đã thanh toán' }

/** Trạng thái tiếp theo mà quản trị viên có thể chuyển tới (khớp quy trình ở backend). */
export const NEXT_STATUSES = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}
