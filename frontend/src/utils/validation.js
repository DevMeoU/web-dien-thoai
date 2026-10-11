export function validateEmail(value) {
  if (!value.trim()) return 'Vui lòng nhập địa chỉ email.'
  return /^\S+@\S+\.\S+$/.test(value.trim()) ? '' : 'Vui lòng nhập địa chỉ email hợp lệ.'
}
