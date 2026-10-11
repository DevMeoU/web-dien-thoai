import { useAsync } from '../../../hooks/useAsync'
import { shopService } from '../../../services/shopService'

/** Hiển thị một trang nội dung tĩnh (do quản trị viên chỉnh sửa) theo slug. */
export default function ContentPageView({ slug, fallbackTitle }) {
  const { data, loading, error } = useAsync(() => shopService.page(slug), [slug])
  if (loading) return <p className="py-10 text-[#666]" role="status">Đang tải nội dung...</p>
  if (error) return <p className="py-10 text-[#666]" role="status">{fallbackTitle ? `${fallbackTitle}: ` : ''}nội dung đang được cập nhật.</p>
  const page = data.data
  return <article className="max-w-[760px]">
    <h2 className="mb-4 text-2xl font-medium">{page.title}</h2>
    <div className="leading-[1.8] whitespace-pre-line text-[#444]">{page.content}</div>
  </article>
}
