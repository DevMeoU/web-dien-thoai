import { useCallback, useEffect, useState } from 'react'

/** Gọi `loader` khi `deps` đổi; trả về trạng thái tải và hàm `reload` để tải lại. */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let alive = true
    setState(previous => ({ ...previous, loading: true, error: null }))
    loader()
      .then(data => { if (alive) setState({ data, loading: false, error: null }) })
      .catch(error => { if (alive) setState({ data: null, loading: false, error }) })
    return () => { alive = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version])

  const reload = useCallback(() => setVersion(value => value + 1), [])
  return { ...state, reload }
}
