export default function PageTitle({ title, description, className = '' }) {
  return <div className={`flex flex-col gap-2.5 ${className}`}>
    <h1 className="text-[28px] leading-[1.2] font-medium desktop:text-[34px]">{title}</h1>
    {description && <p>{description}</p>}
  </div>
}
