import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageTitle from '../../../components/user/shopping/PageTitle'
import Pagination from '../../../components/user/shopping/Pagination'
import EmptyState from '../../../components/user/shopping/EmptyState'
import { Article } from '@phosphor-icons/react'
import { useAsync } from '../../../hooks/useAsync'
import { shopService } from '../../../services/shopService'
import { formatDate } from '../../../utils/format'

const PER_PAGE = 9

export default function BlogsPage() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1)
  const { data, loading, error } = useAsync(() => shopService.posts({ page, per_page: PER_PAGE }), [page])
  const posts = data?.data ?? []

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Tư vấn & tin tức | Mela'
    return () => { document.title = previousTitle }
  }, [])

  function changePage(value) {
    setParams(value > 1 ? { page: String(value) } : {})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return <div className="flex flex-col gap-8">
    <PageTitle title="Tư vấn & tin tức" description="Hướng dẫn chọn máy, mẹo sử dụng và cập nhật sản phẩm Apple mới từ Mela." />
    {loading && <p className="py-16 text-center text-[#666]" role="status">Đang tải bài viết...</p>}
    {error && <p className="py-16 text-center text-red-700" role="alert">Không tải được bài viết. Hãy thử lại sau.</p>}
    {!loading && !error && (posts.length === 0
      ? <EmptyState icon={Article} title="Chưa có bài viết" text="Các bài viết mới sẽ xuất hiện tại đây." />
      : <>
        <ul className="grid grid-cols-1 gap-x-5 gap-y-8 tablet:grid-cols-2 desktop:grid-cols-3">
          {posts.map(post => <li key={post.id}>
            <Link to={`/blogs/${post.slug}`} className="group flex flex-col gap-4">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[#f4f4f4]">
                {post.image_url && <img src={post.image_url} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none" />}
              </div>
              <div className="flex flex-col gap-2">
                <time dateTime={post.published_at} className="text-xs text-[#888]">{formatDate(post.published_at)}</time>
                <h2 className="text-xl leading-[1.3] font-medium">{post.title}</h2>
                {post.excerpt && <p className="line-clamp-2 text-sm text-[#666]">{post.excerpt}</p>}
              </div>
            </Link>
          </li>)}
        </ul>
        <Pagination page={data?.meta?.current_page ?? 1} pageCount={data?.meta?.last_page ?? 1} onChange={changePage} />
      </>)}
  </div>
}
