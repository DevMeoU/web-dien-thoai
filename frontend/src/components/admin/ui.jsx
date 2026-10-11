import { useEffect, useId, useRef } from 'react'
import { X } from '@phosphor-icons/react'

export const inputClass = 'w-full rounded-lg border border-[#ddd] bg-white px-3 py-2 text-sm text-black placeholder:text-[#aaa] focus:border-black focus:outline-none'

const buttonTones = {
  primary: 'bg-[#0071e3] text-white hover:bg-[#0077ed]',
  dark: 'bg-black text-white hover:bg-[#333]',
  secondary: 'border border-[#ccc] bg-white text-black hover:bg-[#f4f4f4]',
  danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
  ghost: 'text-[#555] hover:bg-[#f4f4f4]',
}

export function Button({ tone = 'secondary', small = false, className = '', ...props }) {
  return <button type="button" {...props} className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${small ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} ${buttonTones[tone]} ${className}`} />
}

const badgeTones = {
  green: 'bg-green-100 text-green-800', amber: 'bg-amber-100 text-amber-800', red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-800', gray: 'bg-[#eee] text-[#555]', indigo: 'bg-indigo-100 text-indigo-800',
}

export const Badge = ({ tone = 'gray', children }) => <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeTones[tone]}`}>{children}</span>

export function PageHeader({ title, description, actions }) {
  return <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
    <div><h1 className="text-2xl font-semibold">{title}</h1>{description && <p className="mt-1 text-sm text-[#666]">{description}</p>}</div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </header>
}

export const Panel = ({ title, children, className = '', actions }) => <section className={`rounded-xl border border-[#e6e6e6] bg-white p-5 ${className}`}>
  {(title || actions) && <div className="mb-4 flex items-center justify-between gap-3">{title && <h2 className="font-semibold">{title}</h2>}{actions}</div>}
  {children}
</section>

/** Trường biểu mẫu có nhãn và thông báo lỗi. `control` nhận các thuộc tính id/aria để gắn vào ô nhập. */
export function Field({ label, error, help, children, className = '' }) {
  const id = useId()
  return <div className={`flex flex-col gap-1.5 ${className}`}>
    <label htmlFor={id} className="text-sm font-medium">{label}</label>
    {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': error ? `${id}-error` : undefined, className: `${inputClass} ${error ? 'border-red-500' : ''}` })}
    {help && !error && <p className="text-xs text-[#888]">{help}</p>}
    {error && <p id={`${id}-error`} role="alert" className="text-xs text-red-700">{error}</p>}
  </div>
}

export const TextField = ({ label, error, help, className, ...props }) => <Field label={label} error={error} help={help} className={className}>{aria => <input {...aria} {...props} />}</Field>
export const TextAreaField = ({ label, error, help, className, rows = 3, ...props }) => <Field label={label} error={error} help={help} className={className}>{aria => <textarea rows={rows} {...aria} {...props} />}</Field>
export const SelectField = ({ label, error, help, className, options, placeholder, ...props }) => <Field label={label} error={error} help={help} className={className}>
  {aria => <select {...aria} {...props}>{placeholder !== undefined && <option value="">{placeholder}</option>}{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select>}
</Field>
export const CheckField = ({ label, ...props }) => <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-black" {...props} />{label}</label>

/** Hộp thoại (dialog) có nút đóng và đóng bằng phím Esc. */
export function Modal({ open, title, onClose, children, wide = false }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  return <dialog ref={ref} onClose={onClose} onCancel={onClose} aria-label={title} className={`fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] overflow-auto rounded-xl border-0 bg-white p-0 text-black backdrop:bg-black/50 ${wide ? 'max-w-[900px]' : 'max-w-[560px]'}`}>
    {open && <>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#eee] bg-white px-5 py-4"><h2 className="text-lg font-semibold">{title}</h2><button type="button" aria-label="Đóng" onClick={onClose} className="rounded p-1 hover:bg-[#f4f4f4]"><X size={20} /></button></div>
      <div className="p-5">{children}</div>
    </>}
  </dialog>
}

export function DataTable({ columns, rows, loading, empty = 'Không có dữ liệu.', rowKey = row => row.id }) {
  return <div className="overflow-x-auto rounded-xl border border-[#e6e6e6] bg-white">
    <table className="w-full min-w-[640px] text-left text-sm">
      <thead className="border-b border-[#e6e6e6] bg-[#fafafa] text-xs text-[#666] uppercase"><tr>{columns.map(column => <th key={column.header} scope="col" className={`px-4 py-3 font-medium ${column.className ?? ''}`}>{column.header}</th>)}</tr></thead>
      <tbody>
        {loading && rows.length === 0 && <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-[#888]">Đang tải...</td></tr>}
        {!loading && rows.length === 0 && <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-[#888]">{empty}</td></tr>}
        {rows.map(row => <tr key={rowKey(row)} className="border-b border-[#f1f1f1] last:border-0 hover:bg-[#fcfcfc]">{columns.map(column => <td key={column.header} className={`px-4 py-3 align-middle ${column.className ?? ''}`}>{column.render(row)}</td>)}</tr>)}
      </tbody>
    </table>
  </div>
}

export function Notice({ notice }) {
  if (!notice) return null
  return <p role={notice.type === 'error' ? 'alert' : 'status'} className={`mb-4 rounded-lg px-4 py-3 text-sm ${notice.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'}`}>{notice.text}</p>
}

export const StatCard = ({ label, value, hint }) => <div className="rounded-xl border border-[#e6e6e6] bg-white p-5"><p className="text-sm text-[#666]">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p>{hint && <p className="mt-1 text-xs text-[#888]">{hint}</p>}</div>
