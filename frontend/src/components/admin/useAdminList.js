import { useCallback, useEffect, useRef, useState } from 'react'
import { adminService } from '../../services/adminService'

/**
 * Tải danh sách quản trị có tìm kiếm, bộ lọc và phân trang.
 * Ô tìm kiếm `q` được trì hoãn 350ms để không gọi API sau mỗi phím gõ.
 */
export function useAdminList(resource, initial = {}, perPage = 15) {
  const [params, setParams] = useState({ page: 1, ...initial })
  const [debounced, setDebounced] = useState(params)
  const [state, setState] = useState({ rows: [], meta: null, loading: true, error: null })
  const [version, setVersion] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setDebounced(params), params.q === debounced.q ? 0 : 350)
    return () => clearTimeout(timer.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  useEffect(() => {
    let alive = true
    setState(previous => ({ ...previous, loading: true, error: null }))
    adminService.list(resource, { per_page: perPage, ...debounced })
      .then(response => { if (alive) setState({ rows: response.data, meta: response.meta, loading: false, error: null }) })
      .catch(error => { if (alive) setState(previous => ({ ...previous, loading: false, error })) })
    return () => { alive = false }
  }, [resource, perPage, debounced, version])

  const setParam = useCallback((key, value) => setParams(previous => ({ ...previous, [key]: value, page: key === 'page' ? value : 1 })), [])
  const reload = useCallback(() => setVersion(value => value + 1), [])
  return { ...state, params, setParam, setPage: page => setParam('page', page), reload }
}

/** Thông báo thành công/lỗi hiển thị trên đầu trang. */
export function useNotice() {
  const [notice, setNotice] = useState(null)
  return {
    notice,
    success: text => setNotice({ type: 'success', text }),
    fail: error => setNotice({ type: 'error', text: error?.message ?? String(error) }),
    clear: () => setNotice(null),
  }
}
