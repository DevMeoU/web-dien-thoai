import Reveal from '../home/Reveal'

export default function AuthLayout({ title, description, image, imageAlt, children, footer }) {
  return <div className="mx-auto grid w-full max-w-[1000px] gap-8 tablet:grid-cols-2 tablet:gap-12">
    <Reveal className="flex flex-col justify-center gap-8 tablet:py-6">
      <div className="flex flex-col gap-2.5">
        <h1 className="text-[28px] leading-[1.2] font-medium desktop:text-[34px]">{title}</h1>
        <p>{description}</p>
      </div>
      {children}
      <p className="text-sm">{footer}</p>
    </Reveal>
    <Reveal className="relative hidden min-h-[560px] overflow-hidden rounded-xl bg-[#f4f4f4] tablet:block" delay={0.1}>
      <img className="absolute inset-0 h-full w-full object-cover" src={image} alt={imageAlt} width="1254" height="1254" />
    </Reveal>
  </div>
}
