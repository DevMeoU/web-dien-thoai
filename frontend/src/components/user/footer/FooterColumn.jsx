import Reveal from '../home/Reveal'

export default function FooterColumn({ title, children, delay = 0 }) {
  return <Reveal className="flex flex-col gap-[18px]" delay={delay}>
    <h3 className="text-lg leading-[1.4] font-medium">{title}</h3>
    <div className="flex flex-col gap-3.5">{children}</div>
  </Reveal>
}
