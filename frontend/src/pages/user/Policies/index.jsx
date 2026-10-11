import { Link, useSearchParams } from 'react-router-dom'
import ContentPageView from '../../../components/user/shopping/ContentPageView'
import PageTitle from '../../../components/user/shopping/PageTitle'

const TABS = [
  ['guide', 'Hướng dẫn mua hàng', 'shopping-guide'],
  ['shipping', 'Giao hàng', 'shipping-policy'],
  ['warranty', 'Bảo hành', 'warranty-policy'],
  ['returns', 'Đổi trả và hoàn tiền', 'return-policy'],
  ['privacy', 'Bảo mật', 'privacy-policy'],
]

export default function PoliciesPage() {
  const [params] = useSearchParams()
  const active = TABS.find(([key]) => key === params.get('tab')) ?? TABS[0]
  return <div className="flex flex-col gap-8">
    <PageTitle title="Chính sách" description="Hướng dẫn mua hàng, giao hàng, bảo hành, đổi trả và bảo mật thông tin." />
    <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 tablet:mx-0 tablet:flex-wrap tablet:px-0" aria-label="Danh mục chính sách">
      {TABS.map(([key, label]) => <Link key={key} to={`/policies?tab=${key}`} replace aria-current={active[0] === key ? 'page' : undefined} className={`shrink-0 rounded-full border px-4 py-2 text-sm ${active[0] === key ? 'border-black bg-black text-white' : 'border-[#ddd] hover:bg-[#f4f4f4]'}`}>{label}</Link>)}
    </nav>
    <ContentPageView key={active[2]} slug={active[2]} fallbackTitle={active[1]} />
  </div>
}
