/** Biểu đồ cột đơn giản bằng SVG (không dùng thư viện ngoài). `data` là mảng { label, value }. */
export function BarChart({ data, format = value => value, label, color = '#0071e3' }) {
  const max = Math.max(1, ...data.map(item => item.value))
  const width = 720
  const height = 180
  const barWidth = width / Math.max(1, data.length)
  const every = Math.ceil(data.length / 8)
  return <figure className="m-0">
    <svg viewBox={`0 0 ${width} ${height + 24}`} role="img" aria-label={label} className="h-auto w-full">
      {[0.25, 0.5, 0.75, 1].map(step => <line key={step} x1="0" x2={width} y1={height - height * step} y2={height - height * step} stroke="#eee" />)}
      {data.map((item, index) => {
        const barHeight = (item.value / max) * height
        return <g key={item.label}>
          <rect x={index * barWidth + barWidth * 0.15} y={height - barHeight} width={barWidth * 0.7} height={Math.max(barHeight, item.value > 0 ? 2 : 0)} rx="2" fill={color}><title>{`${item.label}: ${format(item.value)}`}</title></rect>
          {index % every === 0 && <text x={index * barWidth + barWidth / 2} y={height + 16} textAnchor="middle" fontSize="10" fill="#888">{item.label}</text>}
        </g>
      })}
    </svg>
    <figcaption className="sr-only">{label}. Giá trị lớn nhất {format(max)}.</figcaption>
  </figure>
}

export function HorizontalBars({ data, color = '#0071e3' }) {
  const max = Math.max(1, ...data.map(item => item.value))
  return <ul className="flex flex-col gap-3">
    {data.map(item => <li key={item.label} className="text-sm">
      <div className="mb-1 flex justify-between gap-3"><span>{item.label}</span><span className="font-medium">{item.value}</span></div>
      <div className="h-2 rounded-full bg-[#f1f1f1]"><div className="h-2 rounded-full" style={{ width: `${(item.value / max) * 100}%`, backgroundColor: color }} /></div>
    </li>)}
  </ul>
}
