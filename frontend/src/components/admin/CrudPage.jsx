import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { useAsync } from '../../hooks/useAsync'
import { adminService } from '../../services/adminService'
import { toDateInput } from '../../utils/format'
import Pagination from '../user/shopping/Pagination'
import { Button, CheckField, DataTable, Modal, Notice, PageHeader, SelectField, TextAreaField, TextField, inputClass } from './ui'
import { useAdminList, useNotice } from './useAdminList'

const emptyValue = field => field.type === 'checkbox' ? Boolean(field.default) : (field.default ?? '')

function toForm(fields, row) {
  return Object.fromEntries(fields.map(field => {
    const value = row?.[field.name]
    if (!row) return [field.name, emptyValue(field)]
    if (field.type === 'checkbox') return [field.name, Boolean(value)]
    if (field.type === 'date') return [field.name, toDateInput(value)]
    if (field.type === 'number') return [field.name, value === null || value === undefined || value === '' ? '' : Number(value)]
    return [field.name, value ?? '']
  }))
}

/** Chuyển giá trị biểu mẫu thành dữ liệu gửi API: chuỗi rỗng thành null, ô số thành number. */
function toPayload(fields, form) {
  return Object.fromEntries(fields.map(field => {
    const value = form[field.name]
    if (field.type === 'checkbox') return [field.name, value]
    if (value === '' || value === undefined) return [field.name, field.required ? value : null]
    return [field.name, field.type === 'number' ? Number(value) : value]
  }))
}

function FieldInput({ field, form, setForm, errors, context }) {
  const common = { label: field.label, help: field.help, error: errors[field.name], className: field.wide ? 'tablet:col-span-2' : '' }
  const set = value => setForm(previous => ({ ...previous, [field.name]: value }))
  if (field.type === 'checkbox') return <div className={field.wide ? 'tablet:col-span-2' : ''}><CheckField label={field.label} checked={form[field.name]} onChange={event => set(event.target.checked)} /></div>
  if (field.type === 'textarea') return <TextAreaField {...common} value={form[field.name]} onChange={event => set(event.target.value)} placeholder={field.placeholder} rows={field.rows} />
  if (field.type === 'select') {
    const options = typeof field.options === 'function' ? field.options(context) : field.options
    return <SelectField {...common} value={form[field.name]} onChange={event => set(event.target.value)} options={options} placeholder={field.placeholder ?? ''} />
  }
  return <TextField {...common} type={field.type ?? 'text'} value={form[field.name]} onChange={event => set(event.target.value)} placeholder={field.placeholder} step={field.step} min={field.min} required={field.required} />
}

/**
 * Trang quản trị CRUD theo cấu hình: danh sách có tìm kiếm/lọc/phân trang, biểu mẫu thêm sửa, xóa và tải ảnh.
 * Dùng cho danh mục, thương hiệu, banner và mã giảm giá.
 */
export default function CrudPage({ resource, title, description, singular, columns, fields, filters = [], searchPlaceholder = 'Tìm kiếm...', imageUpload = false, loadContext, extraActions, formColumns = 2, allowCreate = true, allowEdit = true }) {
  const list = useAdminList(resource)
  const { data: contextData } = useAsync(() => loadContext ? loadContext() : Promise.resolve(null), [])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const { notice, success, fail, clear } = useNotice()
  const isNew = editing === 'new'
  const current = editing && !isNew ? editing : null

  const openForm = row => { clear(); setErrors({}); setForm(toForm(fields, row)); setEditing(row ?? 'new') }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setErrors({})
    try {
      const body = toPayload(fields, form)
      const response = isNew ? await adminService.create(resource, body) : await adminService.update(resource, current.id, body)
      list.reload()
      if (isNew && imageUpload) { setEditing(response.data); success(`Đã tạo ${singular}. Bạn có thể tải ảnh bên dưới.`) } else { setEditing(null); success(isNew ? `Đã tạo ${singular}.` : `Đã cập nhật ${singular}.`) }
    } catch (error) {
      setErrors(Object.fromEntries(Object.keys(error.errors ?? {}).map(name => [name, error.field(name)])))
      fail(error)
    } finally {
      setBusy(false)
    }
  }

  async function remove(row) {
    if (!window.confirm(`Xóa ${singular} này?`)) return
    clear()
    try { await adminService.remove(resource, row.id); success(`Đã xóa ${singular}.`); list.reload() } catch (error) { fail(error) }
  }

  async function upload(event) {
    const file = event.target.files[0]
    if (!file) return
    try {
      const response = await adminService.upload(resource, current.id, 'image', file)
      setEditing(response.data)
      list.reload()
      success('Đã tải ảnh lên.')
    } catch (error) { fail(error) }
    event.target.value = ''
  }

  const allColumns = [...columns, { header: 'Thao tác', className: 'text-right', render: row => <div className="flex justify-end gap-2">
    {extraActions?.(row, list.reload, { success, fail })}
    {allowEdit && <Button small onClick={() => openForm(row)}>Sửa</Button>}
    <Button small tone="danger" onClick={() => remove(row)}>Xóa</Button>
  </div> }]

  return <div>
    <PageHeader title={title} description={description} actions={allowCreate && <Button tone="primary" onClick={() => openForm(null)}>Thêm {singular}</Button>} />
    <Notice notice={notice} />
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="relative min-w-[220px] flex-1"><MagnifyingGlass size={16} aria-hidden="true" className="absolute top-1/2 left-3 -translate-y-1/2 text-[#999]" /><input type="search" aria-label={searchPlaceholder} placeholder={searchPlaceholder} value={list.params.q ?? ''} onChange={event => list.setParam('q', event.target.value)} className={`${inputClass} pl-9`} /></div>
      {filters.map(filter => <select key={filter.key} aria-label={filter.label} value={list.params[filter.key] ?? ''} onChange={event => list.setParam(filter.key, event.target.value)} className={`${inputClass} w-auto`}><option value="">{filter.label}</option>{filter.options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select>)}
    </div>
    {list.error && <Notice notice={{ type: 'error', text: list.error.message }} />}
    <DataTable columns={allColumns} rows={list.rows} loading={list.loading} />
    <div className="mt-5"><Pagination page={list.meta?.current_page ?? 1} pageCount={list.meta?.last_page ?? 1} onChange={list.setPage} /></div>

    <Modal open={editing !== null} title={isNew ? `Thêm ${singular}` : `Sửa ${singular}`} onClose={() => setEditing(null)} wide>
      <form onSubmit={save} noValidate className="flex flex-col gap-5">
        <div className={`grid gap-4 ${formColumns === 2 ? 'tablet:grid-cols-2' : ''}`}>
          {fields.map(field => <FieldInput key={field.name} field={field} form={form} setForm={setForm} errors={errors} context={contextData} />)}
        </div>
        {imageUpload && current && <div className="flex items-center gap-4 rounded-lg bg-[#f6f6f6] p-4">
          {current.image_url ? <img src={current.image_url} alt="" className="size-20 rounded-lg object-cover" /> : <span className="flex size-20 items-center justify-center rounded-lg bg-white text-xs text-[#999]">Chưa có ảnh</span>}
          <label className="text-sm"><span className="mb-1.5 block font-medium">Ảnh {singular}</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} className="text-xs" /></label>
        </div>}
        <div className="flex justify-end gap-3"><Button onClick={() => setEditing(null)}>Đóng</Button><Button type="submit" tone="dark" disabled={busy}>{busy ? 'Đang lưu...' : 'Lưu'}</Button></div>
      </form>
    </Modal>
  </div>
}
