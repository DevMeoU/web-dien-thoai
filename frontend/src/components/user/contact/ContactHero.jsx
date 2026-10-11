import Reveal from '../home/Reveal'

export default function ContactHero() {
  return <section className="relative flex h-[300px] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#f1f0ee_0%,#d9d7d3_45%,#efeeec_100%)] px-4 pt-[72px] tablet:h-[380px] tablet:px-6" aria-labelledby="contact-title">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(255,255,255,0.75),transparent_55%),radial-gradient(ellipse_at_85%_75%,rgba(255,255,255,0.55),transparent_50%)]" aria-hidden="true" />
    <Reveal className="relative flex max-w-[900px] flex-col items-center gap-3 text-center">
      <h1 id="contact-title" className="text-4xl leading-[1.2] font-bold tablet:text-[54px]">Chọn đúng thiết bị cho bạn</h1>
      <p>Cần tư vấn chọn máy, hỗ trợ đơn hàng hay bảo hành? Hãy nhắn cho chúng tôi.</p>
    </Reveal>
  </section>
}
