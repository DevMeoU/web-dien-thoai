import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { formatCurrency } from '../../utils/format'
import { Badge, Button, CheckField, Modal, Notice, Panel, SelectField, TextAreaField, TextField } from './ui'
import { useNotice } from './useAdminList'

const COLLECTIONS = [['work', 'Làm việc'], ['student', 'Học tập'], ['creative', 'Sáng tạo']]
const STATUSES = [['active', 'Đang bán'], ['hidden', 'Tạm ẩn'], ['discontinued', 'Ngừng bán']]
const EMPTY = { name: '', code: '', category_id: '', brand_id: '', price: '', compare_at_price: '', status: 'active', is_new: false, is_featured: false, collections: [], tagline: '', option_label: 'Dung lượng', in_the_box: '', warranty: '', highlights: '', specs: [], description: '' }

const fromProduct = product => ({
  name: product.name, code: product.code ?? '', category_id: product.category?.id ?? '', brand_id: product.brand?.id ?? '',
  price: Number(product.price), compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : '', status: product.status, is_new: product.is_new, is_featured: product.is_featured,
  collections: product.collections ?? [], tagline: product.tagline ?? '', option_label: product.option_label || 'Dung lượng', in_the_box: product.in_the_box ?? '', warranty: product.warranty ?? '', highlights: (product.highlights ?? []).join('\n'), specs: product.specs ?? [], description: product.description ?? '',
})

const toBody = form => ({
  ...form,
  code: form.code || null, category_id: form.category_id || null, brand_id: form.brand_id || null,
  price: Number(form.price), compare_at_price: form.compare_at_price === '' ? null : Number(form.compare_at_price),
  tagline: form.tagline || null, description: form.description || null, warranty: form.warranty || null, in_the_box: form.in_the_box || null,
  highlights: form.highlights.split('\n').map(value => value.trim()).filter(Boolean),
  specs: form.specs.filter(spec => spec.label.trim() || spec.value.trim()),
})

const emptyVariant = () => ({ sku: '', configuration: '', color: '', color_hex: '', price: '', stock: 0 })

function VariantsSection({ product, reload, notice }) {
  const [draft, setDraft] = useState(emptyVariant())
  const [stocks, setStocks] = useState({})
  const [error, setError] = useState(null)

  async function run(action, message) {
    setError(null)
    try { await action(); notice.success(message); await reload() } catch (failure) { setError(failure) }
  }

  const add = () => run(async () => {
    await adminService.variants.create(product.id, { ...draft, configuration: draft.configuration || null, color: draft.color || null, color_hex: draft.color_hex || null, price: draft.price === '' ? null : Number(draft.price), stock: Number(draft.stock) })
    setDraft(emptyVariant())
  }, 'Đã thêm lựa chọn sản phẩm.')

  return <Panel title="Lựa chọn cấu hình / màu và tồn kho">
    {error && <Notice notice={{ type: 'error', text: error.message }} />}
    <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm">
      <thead className="text-xs text-[#666] uppercase"><tr><th className="py-2 pr-3 font-medium">SKU</th><th className="pr-3 font-medium">Cấu hình</th><th className="pr-3 font-medium">Màu</th><th className="pr-3 font-medium">Giá riêng</th><th className="pr-3 font-medium">Tồn kho</th><th className="pr-3 font-medium">Bán</th><th /></tr></thead>
      <tbody>{product.variants.map(variant => <tr key={variant.id} className="border-t border-[#f1f1f1]">
        <td className="py-2 pr-3 font-mono text-xs">{variant.sku}</td><td className="pr-3">{variant.configuration ?? '—'}</td>
        <td className="pr-3">{variant.color ? <span className="flex items-center gap-2">{variant.color_hex && <span className="size-3.5 rounded-full border border-black/10" style={{ backgroundColor: variant.color_hex }} />}{variant.color}</span> : '—'}</td>
        <td className="pr-3">{variant.own_price ? formatCurrency(variant.own_price) : '—'}</td>
        <td className="pr-3"><input type="number" min="0" aria-label={`Tồn kho ${variant.sku}`} value={stocks[variant.id] ?? variant.stock} onChange={event => setStocks({ ...stocks, [variant.id]: event.target.value })} className="w-20 rounded-lg border border-[#ddd] px-2 py-1" /></td>
        <td className="pr-3"><input type="checkbox" aria-label={`Bán ${variant.sku}`} checked={variant.is_active} onChange={event => run(() => adminService.variants.update(variant.id, { is_active: event.target.checked }), 'Đã cập nhật lựa chọn.')} className="size-4 accent-black" /></td>
        <td className="py-2"><div className="flex justify-end gap-2">
          {stocks[variant.id] !== undefined && Number(stocks[variant.id]) !== variant.stock && <Button small tone="dark" onClick={() => run(async () => { await adminService.setStock(variant.id, Number(stocks[variant.id])); setStocks({ ...stocks, [variant.id]: undefined }) }, 'Đã cập nhật tồn kho.')}>Lưu kho</Button>}
          <Button small tone="danger" onClick={() => { if (window.confirm(`Xóa lựa chọn ${variant.sku}?`)) run(() => adminService.variants.remove(variant.id), 'Đã xóa lựa chọn.') }}>Xóa</Button>
        </div></td>
      </tr>)}</tbody>
    </table></div>
    {product.variants.length === 0 && <p className="py-3 text-sm text-[#888]">Chưa có lựa chọn nào. Sản phẩm cần ít nhất một lựa chọn để khách có thể mua.</p>}
    <div className="mt-4 grid gap-3 border-t border-[#eee] pt-4 sm:grid-cols-3 lg:grid-cols-6">
      <TextField label="SKU" value={draft.sku} onChange={event => setDraft({ ...draft, sku: event.target.value })} placeholder="IP17-256-BLK" />
      <TextField label="Cấu hình" value={draft.configuration} onChange={event => setDraft({ ...draft, configuration: event.target.value })} placeholder="256GB" />
      <TextField label="Màu" value={draft.color} onChange={event => setDraft({ ...draft, color: event.target.value })} placeholder="Đen" />
      <TextField label="Mã màu" value={draft.color_hex} onChange={event => setDraft({ ...draft, color_hex: event.target.value })} placeholder="#a5a3a0" />
      <TextField label="Giá riêng" type="number" min="0" value={draft.price} onChange={event => setDraft({ ...draft, price: event.target.value })} />
      <TextField label="Tồn kho" type="number" min="0" value={draft.stock} onChange={event => setDraft({ ...draft, stock: event.target.value })} />
    </div>
    <div className="mt-3 flex justify-end"><Button tone="primary" onClick={add} disabled={!draft.sku}>Thêm lựa chọn</Button></div>
  </Panel>
}

function ImagesSection({ product, reload, notice }) {
  async function run(action, message) {
    try { await action(); notice.success(message); await reload() } catch (error) { notice.fail(error) }
  }
  const pick = action => event => { const file = event.target.files[0]; if (file) run(() => action(file), 'Đã tải ảnh lên.'); event.target.value = '' }
  return <Panel title="Hình ảnh">
    <div className="flex flex-wrap gap-6">
      <div><p className="mb-2 text-sm font-medium">Ảnh đại diện</p>
        {product.thumbnail_url ? <img src={product.thumbnail_url} alt="" className="size-28 rounded-lg object-cover" /> : <span className="flex size-28 items-center justify-center rounded-lg bg-[#f1f1f1] text-xs text-[#999]">Chưa có ảnh</span>}
        <input type="file" accept="image/png,image/jpeg,image/webp" aria-label="Tải ảnh đại diện" onChange={pick(file => adminService.upload('products', product.id, 'thumbnail', file))} className="mt-2 w-40 text-xs" /></div>
      <div className="min-w-0 flex-1"><p className="mb-2 text-sm font-medium">Ảnh chi tiết</p>
        <div className="flex flex-wrap gap-3">{product.images.map(image => <div key={image.id} className="relative"><img src={image.url} alt="" className="size-20 rounded-lg object-cover" /><button type="button" aria-label="Xóa ảnh" onClick={() => run(() => adminService.removeProductImage(product.id, image.id), 'Đã xóa ảnh.')} className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-black text-xs text-white">×</button></div>)}</div>
        <input type="file" accept="image/png,image/jpeg,image/webp" aria-label="Thêm ảnh chi tiết" onChange={pick(file => adminService.upload('products', product.id, 'images', file))} className="mt-3 text-xs" /></div>
    </div>
  </Panel>
}

/** Biểu mẫu thêm/sửa sản phẩm; khi đã có sản phẩm còn quản lý được ảnh và các lựa chọn cấu hình/màu. */
export default function ProductEditor({ target, categories, brands, onClose, onChanged, onMessage }) {
  const isNew = target === 'new'
  const [product, setProduct] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [variants, setVariants] = useState([])
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const notice = useNotice()

  useEffect(() => {
    notice.clear()
    setErrors({})
    setProduct(null)
    if (isNew) { setForm(EMPTY); setVariants([{ ...emptyVariant() }]); return undefined }
    if (!target) return undefined
    let alive = true
    adminService.get('products', target.id).then(response => { if (alive) { setProduct(response.data); setForm(fromProduct(response.data)) } })
    return () => { alive = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  const reload = async () => { const response = await adminService.get('products', product.id); setProduct(response.data); onChanged() }
  const set = name => event => setForm({ ...form, [name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value })

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setErrors({})
    notice.clear()
    try {
      const body = toBody(form)
      if (isNew) {
        const usable = variants.filter(variant => variant.sku)
        body.variants = usable.map(variant => ({ ...variant, configuration: variant.configuration || null, color: variant.color || null, color_hex: variant.color_hex || null, price: variant.price === '' ? null : Number(variant.price), stock: Number(variant.stock) }))
        if (!body.variants.length) delete body.variants
        const response = await adminService.create('products', body)
        onChanged()
        onMessage('Đã tạo sản phẩm. Hãy bổ sung ảnh nếu cần.')
        setProduct(response.data)
        setForm(fromProduct(response.data))
      } else {
        const response = await adminService.update('products', product.id, body)
        setProduct(response.data)
        onChanged()
        notice.success('Đã lưu sản phẩm.')
      }
    } catch (error) {
      setErrors(Object.fromEntries(Object.keys(error.errors ?? {}).map(name => [name, error.field(name)])))
      notice.fail(error)
    } finally {
      setBusy(false)
    }
  }

  const created = Boolean(product)
  const title = isNew && !created ? 'Thêm sản phẩm' : `Sản phẩm: ${product?.name ?? target?.name ?? ''}`

  return <Modal open={Boolean(target)} title={title} onClose={onClose} wide>
    {!isNew && !product ? <p className="py-8 text-center text-[#888]" role="status">Đang tải sản phẩm...</p> : <div className="flex flex-col gap-5">
      <Notice notice={notice.notice} />
      <form onSubmit={save} noValidate className="flex flex-col gap-4">
        <div className="grid gap-4 tablet:grid-cols-2">
          <TextField label="Tên sản phẩm" value={form.name} onChange={set('name')} error={errors.name} required />
          <TextField label="Mã sản phẩm" value={form.code} onChange={set('code')} error={errors.code} help="Để trống để hệ thống tự tạo (SP00001...)." />
          <SelectField label="Danh mục" value={form.category_id} onChange={set('category_id')} error={errors.category_id} placeholder="— Chưa phân loại —" options={categories.map(category => [category.id, category.parent ? `— ${category.name}` : category.name])} />
          <SelectField label="Thương hiệu" value={form.brand_id} onChange={set('brand_id')} error={errors.brand_id} placeholder="— Không có —" options={brands.map(brand => [brand.id, brand.name])} />
          <TextField label="Giá bán (₫)" type="number" min="0" value={form.price} onChange={set('price')} error={errors.price} required />
          <TextField label="Giá trước giảm (₫)" type="number" min="0" value={form.compare_at_price} onChange={set('compare_at_price')} error={errors.compare_at_price} help="Nhập giá cao hơn giá bán để hiển thị nhãn giảm giá." />
          <SelectField label="Trạng thái" value={form.status} onChange={set('status')} error={errors.status} options={STATUSES} />
          <TextField label="Câu giới thiệu" value={form.tagline} onChange={set('tagline')} error={errors.tagline} />
          <TextField label="Tên tùy chọn cấu hình" value={form.option_label} onChange={set('option_label')} error={errors.option_label} help="Ví dụ: Dung lượng, Cấu hình, Kích thước vỏ." />
          <TextField label="Bảo hành" value={form.warranty} onChange={set('warranty')} error={errors.warranty} />
        </div>
        <fieldset className="flex flex-wrap items-center gap-x-6 gap-y-2"><legend className="mb-2 text-sm font-medium">Nhóm hiển thị & nhãn</legend>
          {COLLECTIONS.map(([value, label]) => <CheckField key={value} label={label} checked={form.collections.includes(value)} onChange={event => setForm({ ...form, collections: event.target.checked ? [...form.collections, value] : form.collections.filter(item => item !== value) })} />)}
          <CheckField label="Sản phẩm mới" checked={form.is_new} onChange={set('is_new')} /><CheckField label="Nổi bật" checked={form.is_featured} onChange={set('is_featured')} />
        </fieldset>
        <TextAreaField label="Mô tả" rows={3} value={form.description} onChange={set('description')} error={errors.description} />
        <div className="grid gap-4 tablet:grid-cols-2">
          <TextAreaField label="Điểm nổi bật (mỗi dòng một ý)" value={form.highlights} onChange={set('highlights')} error={errors.highlights} />
          <TextAreaField label="Nội dung trong hộp" value={form.in_the_box} onChange={set('in_the_box')} error={errors.in_the_box} />
        </div>
        <Panel title="Thông số kỹ thuật">
          {form.specs.map((spec, index) => <div key={index} className="mb-3 grid items-end gap-3 tablet:grid-cols-[1fr_2fr_auto]">
            <TextField label="Tên thông số" value={spec.label} error={errors[`specs.${index}.label`]} onChange={event => setForm({ ...form, specs: form.specs.map((item, position) => position === index ? { ...item, label: event.target.value } : item) })} />
            <TextField label="Giá trị" value={spec.value} error={errors[`specs.${index}.value`]} onChange={event => setForm({ ...form, specs: form.specs.map((item, position) => position === index ? { ...item, value: event.target.value } : item) })} />
            <Button small onClick={() => setForm({ ...form, specs: form.specs.filter((_, position) => position !== index) })}>Xóa dòng</Button>
          </div>)}
          <Button small onClick={() => setForm({ ...form, specs: [...form.specs, { label: '', value: '' }] })}>+ Thêm thông số</Button>
        </Panel>

        {isNew && !created && <Panel title="Lựa chọn ban đầu (không bắt buộc)">
          {variants.map((variant, index) => <div key={index} className="mb-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[['sku', 'SKU', 'IP17-256-BLK'], ['configuration', 'Cấu hình', '256GB'], ['color', 'Màu', 'Đen'], ['color_hex', 'Mã màu', '#a5a3a0'], ['price', 'Giá riêng', ''], ['stock', 'Tồn kho', '']].map(([key, label, placeholder]) =>
              <TextField key={key} label={label} placeholder={placeholder} type={['price', 'stock'].includes(key) ? 'number' : 'text'} min="0" value={variant[key]} error={errors[`variants.${index}.${key}`]} onChange={event => setVariants(variants.map((item, position) => position === index ? { ...item, [key]: event.target.value } : item))} />)}
          </div>)}
          <Button small onClick={() => setVariants([...variants, emptyVariant()])}>+ Thêm dòng</Button>
        </Panel>}

        <div className="flex items-center justify-between gap-3">
          {created ? <Badge tone="green">Mã: {product.code}</Badge> : <span />}
          <div className="flex gap-3"><Button onClick={onClose}>Đóng</Button><Button type="submit" tone="dark" disabled={busy}>{busy ? 'Đang lưu...' : created ? 'Lưu thay đổi' : 'Tạo sản phẩm'}</Button></div>
        </div>
      </form>
      {created && <><ImagesSection product={product} reload={reload} notice={notice} /><VariantsSection product={product} reload={reload} notice={notice} /></>}
    </div>}
  </Modal>
}
