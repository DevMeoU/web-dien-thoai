export default function PagePlaceholder({ title, description }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
      <p className="mb-2 text-sm text-slate-500">Trang khung</p>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-3 max-w-2xl text-slate-600">{description}</p>
      <p className="mt-5 text-sm text-slate-500">Chức năng này sẽ được triển khai ở bước tiếp theo.</p>
    </section>
  )
}

