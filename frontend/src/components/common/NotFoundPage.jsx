import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return <main className="mx-auto max-w-3xl p-8">
    <h1 className="text-2xl font-semibold">Không tìm thấy trang</h1>
    <Link to="/" className="mt-4 inline-block text-blue-700 underline">Về trang chủ</Link>
  </main>
}

