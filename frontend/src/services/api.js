const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/[/]$/, '')
const TOKEN_KEY = 'mela-token'

/** Sự kiện phát ra khi máy chủ báo token hết hạn để AuthContext đưa người dùng về trạng thái chưa đăng nhập. */
export const UNAUTHORIZED_EVENT = 'mela:unauthorized'

export const tokenStore = {
  get() { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } },
  set(token) { try { localStorage.setItem(TOKEN_KEY, token) } catch { /* trình duyệt chặn lưu trữ */ } },
  clear() { try { localStorage.removeItem(TOKEN_KEY) } catch { /* trình duyệt chặn lưu trữ */ } },
}

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.status = status
    this.errors = errors ?? {}
  }

  /** Lỗi đầu tiên của một trường (nếu có). */
  field(name) { return this.errors?.[name]?.[0] }
}

export function buildQuery(params = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  }
  const text = query.toString()
  return text ? `?${text}` : ''
}

function parse(text) {
  try { return JSON.parse(text) } catch { return null }
}

function authHeaders() {
  const token = tokenStore.get()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function handleFailure(response, data, hadToken) {
  if (response.status === 401 && hadToken) {
    tokenStore.clear()
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }
  throw new ApiError(data?.message || 'Không thể thực hiện yêu cầu.', response.status, data?.errors)
}

export async function apiRequest(path, { method = 'GET', body, params, headers } = {}) {
  const isForm = body instanceof FormData
  const response = await fetch(apiBaseUrl + path + buildQuery(params), {
    method,
    headers: { Accept: 'application/json', ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}), ...authHeaders(), ...headers },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  })
  const text = await response.text()
  const data = text ? parse(text) : null
  if (!response.ok) handleFailure(response, data, Boolean(tokenStore.get()))
  return data
}

/** Tải tệp (CSV) kèm token và lưu xuống máy. */
export async function apiDownload(path, params, fallbackName = 'bao-cao.csv') {
  const response = await fetch(apiBaseUrl + path + buildQuery(params), { headers: { Accept: 'text/csv', ...authHeaders() } })
  if (!response.ok) handleFailure(response, parse(await response.text()), Boolean(tokenStore.get()))
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const name = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition)?.[1] ?? fallbackName
  const url = URL.createObjectURL(await response.blob())
  const link = Object.assign(document.createElement('a'), { href: url, download: decodeURIComponent(name) })
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
