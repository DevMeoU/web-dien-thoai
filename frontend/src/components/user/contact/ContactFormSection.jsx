import { useState } from 'react'
import { useAuth } from '../../../contexts/authState'
import { shopService } from '../../../services/shopService'
import { validateEmail } from '../../../utils/validation'
import FormField from '../form/FormField'
import { fieldClass, labelClass, submitClass } from '../form/formStyles'
import Reveal from '../home/Reveal'
import SectionHeading from '../home/SectionHeading'

function validate(data) {
  const phone = data.get('phone').replace(/\s/g, '')
  return {
    name: data.get('name').trim() ? '' : 'Vui lòng nhập họ tên.',
    email: validateEmail(data.get('email')),
    phone: !phone || /^(0|\+84)\d{9}$/.test(phone) ? '' : 'Số điện thoại không hợp lệ.',
    message: data.get('message').trim().length >= 5 ? '' : 'Vui lòng nhập nội dung tin nhắn (ít nhất 5 ký tự).',
  }
}

export default function ContactFormSection() {
  const { user } = useAuth()
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const next = validate(data)
    setErrors(next)
    setStatus('')
    setFailure('')
    if (Object.values(next).some(Boolean)) return
    setBusy(true)
    try {
      const response = await shopService.sendContact({
        name: data.get('name').trim(), email: data.get('email').trim(), phone: data.get('phone').trim() || null,
        order_code: data.get('order_code').trim() || null, message: data.get('message').trim(),
      })
      setStatus(response.message)
      form.elements.message.value = ''
      form.elements.order_code.value = ''
    } catch (error) {
      setErrors(Object.fromEntries(Object.keys(error.errors).map(field => [field, error.field(field)])))
      setFailure(Object.keys(error.errors).length ? '' : error.message)
    } finally {
      setBusy(false)
    }
  }

  const clear = () => { setStatus(''); setFailure('') }
  return <section className="bg-[#f4f4f4] px-4 py-12 tablet:px-6 tablet:py-20" aria-labelledby="contact-form-title">
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-8">
      <Reveal>
        <SectionHeading id="contact-form-title" className="items-center text-center" title="Liên hệ với chúng tôi" description="Chúng tôi luôn muốn lắng nghe khách hàng, hãy thoải mái gửi góp ý hoặc câu hỏi cho chúng tôi." />
      </Reveal>
      <div className="grid grid-cols-1 gap-8 tablet:grid-cols-2">
        <Reveal>
          <form onSubmit={submit} noValidate className="flex flex-col gap-5">
            <FormField label="Họ tên" name="name" autoComplete="name" placeholder="Nguyễn Văn A" defaultValue={user?.name ?? ''} error={errors.name} onChange={clear} />
            <FormField label="Email" name="email" type="email" autoComplete="email" placeholder="example@gmail.com" defaultValue={user?.email ?? ''} error={errors.email} onChange={clear} />
            <div className="grid gap-5 tablet:grid-cols-2">
              <FormField label="Số điện thoại" name="phone" type="tel" autoComplete="tel" placeholder="0901234567" defaultValue={user?.phone ?? ''} error={errors.phone} onChange={clear} />
              <FormField label="Mã đơn hàng (nếu có)" name="order_code" placeholder="MELA261009-ABCDE" error={errors.order_code} onChange={clear} />
            </div>
            <label className={labelClass}>Nội dung tin nhắn
              <textarea className={`${fieldClass} h-[100px] resize-y py-3 ${errors.message ? 'border-red-600' : ''}`} name="message" placeholder="Viết tại đây..." aria-invalid={Boolean(errors.message)} onChange={clear} />
              {errors.message && <span role="alert" className="text-[13px] text-red-700">{errors.message}</span>}
            </label>
            <button className={`${submitClass} disabled:opacity-60`} type="submit" disabled={busy}>{busy ? 'Đang gửi...' : 'Gửi'}</button>
            {status && <p className="text-[13px] text-green-700" role="status">{status}</p>}
            {failure && <p className="text-[13px] text-red-700" role="alert">{failure}</p>}
          </form>
        </Reveal>
        <Reveal className="relative h-[320px] overflow-hidden rounded-[10px] tablet:h-auto" delay={0.1}>
          <img className="block h-full w-full object-cover tablet:absolute tablet:inset-0" src="/images/home/newsletter.png" alt="Apple Watch trên nền xám" width="1254" height="1254" loading="lazy" />
        </Reveal>
      </div>
    </div>
  </section>
}
