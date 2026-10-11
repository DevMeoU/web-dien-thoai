const socials = [['facebook', 'https://www.facebook.com'], ['instagram', 'https://www.instagram.com'], ['twitter', 'https://www.x.com']]

export default function SocialLinks() {
  return <div className="flex gap-3">
    {socials.map(([name, url]) => <a className="size-8 rounded-full bg-[#f4f4f4] p-1 transition-opacity duration-200 ease-[ease] motion-reduce:transition-none" key={name} href={url} target="_blank" rel="noreferrer" aria-label={name}>
      <img src={`/brand/${name}.svg`} width="24" height="24" alt="" loading="lazy" />
    </a>)}
  </div>
}
