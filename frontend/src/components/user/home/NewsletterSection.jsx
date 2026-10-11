import { useState } from 'react'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import { shopService } from '../../../services/shopService'

export default function NewsletterSection() {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    setBusy(true)
    setStatus('')
    try {
      const response = await shopService.subscribe(new FormData(form).get('email').trim())
      form.reset()
      setStatus(response.message || 'Cảm ơn bạn đã đăng ký nhận tin.')
    } catch (error) {
      setStatus(error.field?.('email') ?? error.message)
    } finally {
      setBusy(false)
    }
  }
  return <section id="newsletter" data-home-section="newsletter" className="scroll-mt-[72px] px-4 tablet:px-6" aria-labelledby="newsletter-title">
    <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 overflow-hidden rounded-xl bg-[#f4f4f4] tablet:h-[320px] tablet:grid-cols-2 desktop:h-[480px]">
      <Reveal className="flex items-center p-4 tablet:p-8 desktop:p-[62px]">
        <div className="relative flex w-full max-w-[460px] flex-col gap-6">
          <SectionHeading id="newsletter-title" title="Đăng ký nhận tin và ưu đãi." description="Cập nhật thiết bị mới và ưu đãi dành cho bạn." />
          <form onSubmit={submit} className="flex h-10 gap-5">
            <input className="w-0 min-w-0 flex-1 rounded border-0 bg-[#efefef] p-3 font-form text-base leading-[1.2] text-black placeholder:text-[#666]" type="email" name="email" aria-label="Địa chỉ email" placeholder="Email của bạn" required onInvalid={event => event.target.setCustomValidity(event.target.validity.valueMissing ? 'Vui lòng nhập địa chỉ email.' : 'Vui lòng nhập địa chỉ email hợp lệ.')} onChange={event => { event.target.setCustomValidity(''); setStatus('') }} />
            <button className="rounded-md border-0 bg-black px-6 py-2.5 text-sm leading-[1.4] font-normal text-white transition-colors duration-200 ease-[ease] hover:bg-[#333] motion-reduce:transition-none" type="submit" disabled={busy}>{busy ? 'Đang gửi...' : 'Đăng ký'}</button>
          </form>
          {status && <p className="text-[13px] tablet:absolute tablet:top-[calc(100%+12px)]" role="status">{status}</p>}
        </div>
      </Reveal>
      <Reveal className="h-[320px] tablet:h-full"><img className="block h-full w-full object-cover" src="/images/home/newsletter.png" alt="Apple Watch trên nền xám" width="1254" height="1254" loading="lazy" /></Reveal>
    </div>
  </section>
}
