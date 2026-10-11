export default function SectionHeading({ id, title, description, className = '' }) {
  return <div className={`flex flex-col gap-2.5 ${className}`}>
    <h2 id={id} className="text-[28px] leading-[1.2] font-medium desktop:text-[34px]">{title}</h2>
    <p>{description}</p>
  </div>
}
