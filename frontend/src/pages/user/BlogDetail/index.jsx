import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAsync } from '../../../hooks/useAsync'
import { shopService } from '../../../services/shopService'
import { formatDate } from '../../../utils/format'

export default function BlogDetailPage() {
  const { slug } = useParams()
  const { data, loading, error } = useAsync(() => shopService.post(slug), [slug])
  const post = data?.data

  useEffect(() => {
    if (!post) return undefined
    const previousTitle = document.title
    document.title = `${post.title} | Mela`
    return () => { document.title = previousTitle }
  }, [post])

  if (loading) return <p className="py-16 text-center text-[#666]" role="status">Đang tải bài viết...</p>
  if (error || !post) return <div className="flex flex-col items-center gap-4 py-16 text-center" role="alert">
    <p className="text-[#666]">{error?.status === 404 ? 'Không tìm thấy bài viết này.' : 'Không tải được bài viết. Hãy thử lại sau.'}</p>
    <Link to="/blogs" className="underline underline-offset-4">Quay lại tin tức</Link>
  </div>

  return <article className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
    <Link to="/blogs" className="w-max text-sm text-[#666] underline underline-offset-4 hover:text-black">← Tin tức</Link>
    <header className="flex flex-col gap-3">
      <time dateTime={post.published_at} className="text-sm text-[#888]">{formatDate(post.published_at)}</time>
      <h1 className="text-[28px] leading-[1.2] font-medium desktop:text-[40px]">{post.title}</h1>
      {post.excerpt && <p className="text-lg text-[#555]">{post.excerpt}</p>}
    </header>
    {post.image_url && <img src={post.image_url} alt="" className="w-full rounded-xl object-cover" />}
    <div className="flex flex-col gap-4 leading-[1.7]">
      {(post.content ?? '').split(/\n+/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    </div>
  </article>
}
