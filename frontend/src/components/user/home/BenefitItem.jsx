import Reveal from './Reveal'

export default function BenefitItem({ icon: Icon, title, text, delay = 0 }) {
  return <Reveal className="flex flex-col items-start gap-4 py-4 desktop:flex-row desktop:border-r desktop:border-[#f4f4f4] desktop:p-8 desktop:last:border-r-0" delay={delay}>
    <Icon size={32} className="h-6 w-6 shrink-0 desktop:h-8 desktop:w-8" aria-hidden="true" />
    <div><h3 className="mb-1.5 text-lg leading-[1.4] font-medium">{title}</h3><p>{text}</p></div>
  </Reveal>
}
