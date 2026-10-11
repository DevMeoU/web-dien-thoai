import { Link } from 'react-router-dom'
import Reveal from './Reveal'

// Thẻ đầu tiên là thẻ lớn bên trái, hai thẻ sau xếp chồng bên phải.
const styles = [
  { card: 'h-full justify-between gap-0 rounded-2xl', image: 'aspect-[1.19729]' },
  { card: 'gap-2.5', title: 'w-[300px] max-w-full tablet:w-auto', image: 'h-[197px] tablet:h-auto tablet:aspect-[2.06111] desktop:aspect-[2.25517]' },
  { card: 'gap-2.5', image: 'aspect-[1.57488] tablet:aspect-[2.06111] desktop:aspect-[2.25517]' },
]

export default function CollectionCard({ banner, slot }) {
  const style = styles[slot]
  return <Reveal>
    <Link to={banner.link || '/products'} className={`flex flex-col overflow-hidden rounded-xl bg-[#f4f4f4] ${style.card}`}>
      <div className="shrink-0 p-6">
        <h3 className={`text-[28px] leading-[1.2] font-medium desktop:text-[34px] ${style.title ?? ''}`}>{banner.title}</h3>
        {banner.subtitle && <p className="mt-2 text-sm text-[#666]">{banner.subtitle}</p>}
      </div>
      {banner.image_url && <img className={`block w-full object-cover ${style.image}`} src={banner.image_url} alt={banner.subtitle || banner.title} loading="lazy" />}
    </Link>
  </Reveal>
}
