/**
 * Sinh ảnh minh họa SVG cho sản phẩm Apple (iPhone, MacBook, iPad, Apple Watch, AirPods, phụ kiện)
 * và các ảnh trang chủ. Ảnh vẽ bằng hình khối vector nên không dùng ảnh bản quyền của bên thứ ba;
 * quản trị viên có thể thay bằng ảnh thật qua chức năng tải ảnh trong trang quản trị.
 *
 * Chạy:  node scripts/generate-product-art.mjs
 * Đầu vào:  backend/database/seeders/data/catalog.json
 * Đầu ra:   frontend/public/images/products/*.svg và frontend/public/images/home/*.svg
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const catalog = JSON.parse(readFileSync(join(root, 'backend/database/seeders/data/catalog.json'), 'utf8'))
const productsDir = join(root, 'frontend/public/images/products')
const homeDir = join(root, 'frontend/public/images/home')

/* ---------- Màu sắc ---------- */
const clamp = value => Math.max(0, Math.min(255, Math.round(value)))
const toRgb = hex => [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16))
const toHex = rgb => `#${rgb.map(value => clamp(value).toString(16).padStart(2, '0')).join('')}`
const mix = (a, b, t) => { const [x, y] = [toRgb(a), toRgb(b)]; return toHex(x.map((value, index) => value + (y[index] - value) * t)) }
const lighten = (hex, t) => mix(hex, '#ffffff', t)
const darken = (hex, t) => mix(hex, '#000000', t)
const luminance = hex => { const [r, g, b] = toRgb(hex); return (0.299 * r + 0.587 * g + 0.114 * b) / 255 }

/* ---------- Khung cảnh chung ---------- */
let uid = 0
const id = name => `${name}${++uid}`

function linear(name, stops, x1 = 0, y1 = 0, x2 = 1, y2 = 1) {
  return `<linearGradient id="${name}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([offset, color, opacity = 1]) => `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`).join('')}</linearGradient>`
}

function radial(name, stops, cx = 0.5, cy = 0.5, r = 0.5) {
  return `<radialGradient id="${name}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([offset, color, opacity = 1]) => `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`).join('')}</radialGradient>`
}

const metal = (name, color) => linear(name, [[0, lighten(color, 0.35)], [0.45, color], [1, darken(color, 0.22)]])

/** Nền xám trung tính theo phong cách Nuvola; màu nhấn đến từ chính thiết bị. */
function scene({ width = 1200, height = 1200, tint = '#cfc6b5', defs = '', body, label, shadow = { cx: 600, cy: 1020, rx: 300, ry: 26 }, arch = false }) {
  const bg = id('bg')
  const blur = id('blur')
  const top = '#f4f4f4'
  const bottom = '#eeeeee'
  const archX = width / 2
  const archRadius = Math.min(width * 0.27, height * 0.3)
  const archTop = height * 0.1
  const archBase = archTop + archRadius
  const archPath = (r, inset = 0) => `M${archX - r} ${height} V${archBase} A${r} ${r} 0 0 1 ${archX + r} ${archBase} V${height}`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${label}">
<defs>${linear(bg, [[0, top], [1, bottom]], 0, 0, 0, 1)}<filter id="${blur}" x="-30%" y="-300%" width="160%" height="700%"><feGaussianBlur stdDeviation="22"/></filter>${Array.isArray(defs) ? defs.join('') : defs}</defs>
<rect width="${width}" height="${height}" fill="url(#${bg})"/>
${arch ? `<path d="${archPath(archRadius)} Z" fill="#ffffff" fill-opacity="0.42"/><path d="${archPath(archRadius + 26)}" fill="none" stroke="${darken(tint, 0.25)}" stroke-opacity="0.35" stroke-width="1.5"/>` : ''}
<ellipse cx="${shadow.cx}" cy="${shadow.cy}" rx="${shadow.rx}" ry="${shadow.ry}" fill="#111111" fill-opacity="0.18" filter="url(#${blur})"/>
${body}
</svg>
`
}

const place = (content, x, y, scale = 1, rotate = 0) => `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})">${content}</g>`

/* ---------- Hình dựng thiết bị (gốc tọa độ ở tâm) ---------- */
const FONT = `font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`

function lens(x, y, r, defs) {
  const g = id('lens')
  defs.push(radial(g, [[0, '#2c3346'], [0.7, '#0c0e15'], [1, '#04050a']], 0.4, 0.38, 0.65))
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#1a1b1f" stroke="#9a9ca3" stroke-width="${r * 0.14}"/><circle cx="${x}" cy="${y}" r="${r * 0.72}" fill="url(#${g})"/><circle cx="${x - r * 0.28}" cy="${y - r * 0.3}" r="${r * 0.16}" fill="#8fa8ff" fill-opacity="0.55"/><circle cx="${x + r * 0.22}" cy="${y + r * 0.24}" r="${r * 0.06}" fill="#ffffff" fill-opacity="0.7"/>`
}

function phoneBack(variant, color, defs) {
  const body = id('pb')
  const sheen = id('sh')
  const plate = id('pl')
  defs.push(linear(body, [[0, lighten(color, 0.2)], [0.55, color], [1, darken(color, 0.16)]]))
  defs.push(linear(sheen, [[0, '#ffffff', 0.34], [0.5, '#ffffff', 0.04], [1, '#ffffff', 0]]))
  defs.push(linear(plate, [[0, lighten(color, 0.1)], [1, darken(color, 0.1)]]))
  const dark = darken(color, 0.28)
  const parts = [
    `<rect x="-181" y="-371" width="362" height="742" rx="72" fill="url(#${body})"/>`,
    `<rect x="-181" y="-371" width="362" height="742" rx="72" fill="url(#${sheen})"/>`,
    `<rect x="-179" y="-369" width="358" height="738" rx="70" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2.5"/>`,
    `<rect x="-188" y="-250" width="8" height="46" rx="3" fill="${dark}"/><rect x="-188" y="-170" width="8" height="74" rx="3" fill="${dark}"/><rect x="-188" y="-80" width="8" height="74" rx="3" fill="${dark}"/><rect x="180" y="-150" width="8" height="110" rx="3" fill="${dark}"/>`,
  ]
  if (variant === 'pro') {
    parts.push(`<rect x="-181" y="-371" width="362" height="248" rx="72" fill="url(#${plate})"/><path d="M-181 -170 A72 72 0 0 0 -109 -123 H109 A72 72 0 0 0 181 -170" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="2"/>`)
    parts.push(lens(-100, -290, 42, defs), lens(-100, -190, 42, defs), lens(-8, -240, 42, defs))
    parts.push(`<circle cx="104" cy="-300" r="15" fill="#fff6dc" stroke="#aaa" stroke-width="2"/><circle cx="104" cy="-196" r="21" fill="#18191d"/><circle cx="104" cy="-248" r="6" fill="#18191d"/>`)
  } else if (variant === 'bar') {
    parts.push(`<rect x="-181" y="-371" width="362" height="168" rx="62" fill="url(#${plate})"/>`)
    parts.push(lens(-100, -290, 44, defs), lens(10, -290, 44, defs))
    parts.push(`<circle cx="104" cy="-318" r="14" fill="#fff6dc" stroke="#aaa" stroke-width="2"/><circle cx="104" cy="-270" r="6" fill="#18191d"/>`)
  } else if (variant === 'air') {
    parts.push(`<rect x="-181" y="-371" width="362" height="118" rx="52" fill="url(#${plate})"/>`)
    parts.push(lens(-102, -312, 40, defs))
    parts.push(`<circle cx="100" cy="-322" r="13" fill="#fff6dc" stroke="#aaa" stroke-width="2"/><circle cx="100" cy="-290" r="5" fill="#18191d"/>`)
  } else {
    parts.push(`<rect x="-150" y="-340" width="122" height="206" rx="61" fill="url(#${plate})"/>`)
    parts.push(lens(-89, -279, 38, defs), lens(-89, -195, 38, defs))
    parts.push(`<circle cx="12" cy="-300" r="14" fill="#fff6dc" stroke="#aaa" stroke-width="2"/>`)
  }
  parts.push(`<circle cx="0" cy="40" r="84" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="2"/>`)
  return parts.join('')
}

/** Màu nền màn hình: pha màu sản phẩm với xanh đêm để chữ trắng luôn đọc được. */
const wallpaper = color => [mix(color, '#7b8cc4', 0.5), mix(color, '#3a4a86', 0.6), mix(color, '#10152b', 0.75)]

function phoneFront(color, defs) {
  const [w1, w2, w3] = wallpaper(color)
  const wall = id('wp')
  const frame = id('fr')
  const glow = id('gl')
  defs.push(linear(wall, [[0, w1], [0.5, w2], [1, w3]], 0.2, 0, 0.8, 1))
  defs.push(linear(frame, [[0, lighten(color, 0.3)], [1, darken(color, 0.2)]]))
  defs.push(radial(glow, [[0, '#ffffff', 0.45], [1, '#ffffff', 0]], 0.3, 0.2, 0.7))
  return `<rect x="-181" y="-371" width="362" height="742" rx="72" fill="url(#${frame})"/>
<rect x="-173" y="-363" width="346" height="726" rx="64" fill="#0a0a0c"/>
<rect x="-165" y="-355" width="330" height="710" rx="57" fill="url(#${wall})"/>
<rect x="-165" y="-355" width="330" height="710" rx="57" fill="url(#${glow})"/>
<rect x="-52" y="-338" width="104" height="31" rx="15.5" fill="#050506"/>
<text x="-118" y="-312" ${FONT} font-size="20" font-weight="600" fill="#ffffff" text-anchor="middle">9:41</text>
<rect x="96" y="-324" width="30" height="14" rx="4" fill="none" stroke="#ffffff" stroke-opacity="0.8" stroke-width="1.6"/><rect x="99" y="-321" width="20" height="8" rx="2" fill="#ffffff"/>
<text x="0" y="-210" ${FONT} font-size="26" font-weight="500" fill="#ffffff" fill-opacity="0.85" text-anchor="middle">Thứ Năm, 9 tháng 10</text>
<text x="0" y="-110" ${FONT} font-size="124" font-weight="300" fill="#ffffff" text-anchor="middle">9:41</text>
<rect x="-132" y="20" width="126" height="84" rx="22" fill="#ffffff" fill-opacity="0.2"/><rect x="6" y="20" width="126" height="84" rx="22" fill="#ffffff" fill-opacity="0.2"/>
<rect x="-132" y="116" width="264" height="84" rx="22" fill="#ffffff" fill-opacity="0.2"/>
<circle cx="-104" cy="304" r="32" fill="#000000" fill-opacity="0.36"/><circle cx="104" cy="304" r="32" fill="#000000" fill-opacity="0.36"/>
<rect x="-70" y="344" width="140" height="5" rx="2.5" fill="#ffffff" fill-opacity="0.85"/>`
}

function laptop(color, defs) {
  const [w1, w2, w3] = wallpaper(color)
  const wall = id('mw')
  const clip = id('mc')
  const shell = id('ms')
  const base = id('mb')
  defs.push(linear(wall, [[0, w1], [0.55, w2], [1, w3]], 0, 0, 1, 1))
  defs.push(`<clipPath id="${clip}"><rect x="-322" y="-300" width="644" height="400" rx="8"/></clipPath>`)
  defs.push(linear(shell, [[0, lighten(color, 0.25)], [1, darken(color, 0.12)]], 0, 0, 0, 1))
  defs.push(linear(base, [[0, lighten(color, 0.4)], [0.5, color], [1, darken(color, 0.25)]], 0, 0, 0, 1))
  const dock = ['#ff6a55', '#ffb03a', '#4cc36a', '#3b8cff', '#a56bff', '#ff5f9e', '#ffffff'].map((fill, index) => `<rect x="${-96 + index * 28}" y="62" width="22" height="22" rx="6" fill="${fill}" fill-opacity="0.92"/>`).join('')
  return `<rect x="-350" y="-330" width="700" height="450" rx="28" fill="url(#${shell})"/>
<rect x="-340" y="-320" width="680" height="430" rx="20" fill="#0b0b0d"/>
<g clip-path="url(#${clip})"><rect x="-322" y="-300" width="644" height="400" fill="url(#${wall})"/>
<ellipse cx="-160" cy="-120" rx="260" ry="170" fill="#ffffff" fill-opacity="0.16"/><ellipse cx="200" cy="40" rx="280" ry="150" fill="${lighten(color, 0.1)}" fill-opacity="0.22"/>
<rect x="-322" y="-300" width="644" height="22" fill="#ffffff" fill-opacity="0.2"/><circle cx="-306" cy="-289" r="5" fill="#ffffff" fill-opacity="0.9"/><rect x="-288" y="-293" width="60" height="8" rx="4" fill="#ffffff" fill-opacity="0.8"/><rect x="220" y="-293" width="90" height="8" rx="4" fill="#ffffff" fill-opacity="0.8"/>
<rect x="-210" y="-210" width="330" height="200" rx="14" fill="#ffffff" fill-opacity="0.82"/><rect x="-210" y="-210" width="330" height="30" rx="14" fill="#ffffff" fill-opacity="0.9"/><circle cx="-192" cy="-195" r="5" fill="#ff6a55"/><circle cx="-176" cy="-195" r="5" fill="#ffb03a"/><circle cx="-160" cy="-195" r="5" fill="#4cc36a"/>
<rect x="-188" y="-160" width="180" height="10" rx="5" fill="#9aa3b8"/><rect x="-188" y="-136" width="260" height="10" rx="5" fill="#c4cad8"/><rect x="-188" y="-112" width="220" height="10" rx="5" fill="#c4cad8"/><rect x="-188" y="-80" width="120" height="44" rx="10" fill="${mix(color, '#3a4a86', 0.5)}"/>
<rect x="-110" y="52" width="220" height="44" rx="16" fill="#ffffff" fill-opacity="0.26"/>${dock}</g>
<path d="M-48 -320 H48 V-308 A12 12 0 0 1 36 -296 H-36 A12 12 0 0 1 -48 -308 Z" fill="#0b0b0d"/>
<path d="M-352 120 H352 L392 130 A12 12 0 0 1 380 148 H-380 A12 12 0 0 1 -392 130 Z" fill="url(#${base})"/>
<path d="M-60 120 H60 L56 128 H-56 Z" fill="${darken(color, 0.3)}" fill-opacity="0.55"/><rect x="-352" y="118" width="704" height="3" fill="#000000" fill-opacity="0.28"/>`
}

function tablet(color, defs) {
  const [w1, w2, w3] = wallpaper(color)
  const wall = id('tw')
  const frame = id('tf')
  defs.push(linear(wall, [[0, w1], [0.5, w2], [1, w3]], 0.1, 0, 0.9, 1))
  defs.push(linear(frame, [[0, lighten(color, 0.35)], [1, darken(color, 0.15)]]))
  const dock = ['#ff6a55', '#ffb03a', '#4cc36a', '#3b8cff', '#a56bff'].map((fill, index) => `<rect x="${-96 + index * 40}" y="316" width="32" height="32" rx="9" fill="${fill}" fill-opacity="0.92"/>`).join('')
  return `<rect x="-290" y="-390" width="580" height="780" rx="52" fill="url(#${frame})"/>
<rect x="-282" y="-382" width="564" height="764" rx="46" fill="#0b0b0d"/>
<rect x="-262" y="-362" width="524" height="724" rx="30" fill="url(#${wall})"/>
<circle cx="0" cy="-372" r="4" fill="#26262b"/>
<text x="-236" y="-326" ${FONT} font-size="18" font-weight="600" fill="#ffffff">9:41  Thứ Năm 9 thg 10</text>
<rect x="-232" y="-290" width="210" height="210" rx="28" fill="#ffffff" fill-opacity="0.22"/><circle cx="-127" cy="-185" r="74" fill="#ffffff" fill-opacity="0.85"/><path d="M-127 -185 V-240 M-127 -185 L-90 -160" stroke="#2a2a2f" stroke-width="6" stroke-linecap="round"/>
<rect x="-6" y="-290" width="238" height="210" rx="28" fill="#ffffff" fill-opacity="0.22"/><text x="112" y="-190" ${FONT} font-size="76" font-weight="300" fill="#ffffff" text-anchor="middle">9</text><text x="112" y="-130" ${FONT} font-size="22" fill="#ffffff" fill-opacity="0.85" text-anchor="middle">THG 10</text>
<rect x="-232" y="-56" width="464" height="190" rx="28" fill="#ffffff" fill-opacity="0.18"/><rect x="-204" y="-24" width="260" height="12" rx="6" fill="#ffffff" fill-opacity="0.8"/><rect x="-204" y="6" width="380" height="10" rx="5" fill="#ffffff" fill-opacity="0.5"/><rect x="-204" y="32" width="320" height="10" rx="5" fill="#ffffff" fill-opacity="0.5"/>
<rect x="-132" y="304" width="264" height="56" rx="20" fill="#ffffff" fill-opacity="0.28"/>${dock}`
}

function watch(color, defs, bandColor) {
  const body = id('wb')
  const band = id('wd')
  defs.push(linear(body, [[0, lighten(color, 0.3)], [1, darken(color, 0.2)]]))
  defs.push(linear(band, [[0, lighten(bandColor, 0.2)], [1, darken(bandColor, 0.12)]], 0, 0, 1, 0))
  const holes = Array.from({ length: 6 }, (_, index) => `<circle cx="0" cy="${-150 - index * 24}" r="4" fill="${darken(bandColor, 0.3)}" fill-opacity="0.55"/>`).join('')
  const holesBottom = Array.from({ length: 6 }, (_, index) => `<circle cx="0" cy="${150 + index * 24}" r="4" fill="${darken(bandColor, 0.3)}" fill-opacity="0.55"/>`).join('')
  const ticks = Array.from({ length: 12 }, (_, index) => {
    const angle = (index * Math.PI) / 6
    const [x1, y1, x2, y2] = [Math.sin(angle) * 118, -Math.cos(angle) * 118, Math.sin(angle) * (index % 3 === 0 ? 100 : 108), -Math.cos(angle) * (index % 3 === 0 ? 100 : 108)]
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#ffffff" stroke-opacity="${index % 3 === 0 ? 1 : 0.55}" stroke-width="${index % 3 === 0 ? 5 : 3}" stroke-linecap="round"/>`
  }).join('')
  return `<rect x="-96" y="-370" width="192" height="260" rx="44" fill="url(#${band})"/><g transform="translate(0 -20)">${holes}</g>
<rect x="-96" y="110" width="192" height="260" rx="44" fill="url(#${band})"/><g transform="translate(0 20)">${holesBottom}</g>
<rect x="150" y="-48" width="22" height="64" rx="10" fill="${darken(color, 0.18)}"/><rect x="152" y="46" width="14" height="52" rx="7" fill="${darken(color, 0.25)}"/>
<rect x="-158" y="-190" width="316" height="380" rx="96" fill="url(#${body})"/>
<rect x="-144" y="-176" width="288" height="352" rx="84" fill="#050506"/>
<g transform="translate(0 0)">${ticks}<line x1="0" y1="0" x2="-44" y2="-36" stroke="#ffffff" stroke-width="9" stroke-linecap="round"/><line x1="0" y1="0" x2="30" y2="-76" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/><line x1="0" y1="14" x2="-18" y2="-92" stroke="#ff8a3d" stroke-width="3" stroke-linecap="round"/><circle cx="0" cy="0" r="9" fill="#ff8a3d"/><circle cx="0" cy="0" r="3" fill="#050506"/></g>
<text x="0" y="150" ${FONT} font-size="20" font-weight="500" fill="#ffffff" fill-opacity="0.85" text-anchor="middle">T5 · 9</text>`
}

function earbud(color, withTip, defs, flip = 1) {
  const g = id('eb')
  defs.push(radial(g, [[0, '#ffffff'], [0.7, '#f0f0ec'], [1, '#d6d6d1']], 0.35, 0.3, 0.8))
  const tip = withTip ? '<ellipse cx="-58" cy="-40" rx="30" ry="46" fill="#e3e3de" stroke="#cfcfca" stroke-width="2"/>' : ''
  return `<g transform="scale(${flip} 1)"><rect x="-21" y="-10" width="42" height="168" rx="21" fill="url(#${g})" stroke="#d2d2cd" stroke-width="1.5"/>${tip}<ellipse cx="0" cy="-34" rx="72" ry="64" fill="url(#${g})" stroke="#d2d2cd" stroke-width="1.5"/><circle cx="14" cy="-46" r="8" fill="#d8d8d3"/><circle cx="-10" cy="-18" r="4" fill="#cfcfca"/></g>`
}

function airpodsCase(w, h, rx, defs) {
  const g = id('ac')
  defs.push(linear(g, [[0, '#ffffff'], [0.6, '#f1f1ed'], [1, '#d9d9d4']], 0, 0, 0, 1))
  return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${rx}" fill="url(#${g})" stroke="#d0d0cb" stroke-width="2"/><path d="M${-w / 2 + 6} ${-h * 0.14} Q0 ${-h * 0.14 + 14} ${w / 2 - 6} ${-h * 0.14}" fill="none" stroke="#cfcfca" stroke-width="3"/><circle cx="0" cy="${h * 0.18}" r="7" fill="#c9c9c4"/><rect x="${-w / 2 + 40}" y="${-h / 2 + 10}" width="${w - 80}" height="18" rx="9" fill="#ffffff" fill-opacity="0.8"/>`
}

function airpodsPro(defs) {
  return `${place(airpodsCase(440, 320, 130, defs), 0, -30)}${place(earbud('#fff', true, defs, 1), -265, 110, 1, 8)}${place(earbud('#fff', true, defs, -1), 265, 110, 1, -8)}`
}

function airpods4(defs) {
  return `${place(airpodsCase(340, 290, 112, defs), 0, -30)}${place(earbud('#fff', false, defs, 1), -240, 100, 1, 8)}${place(earbud('#fff', false, defs, -1), 240, 100, 1, -8)}`
}

function airpodsMax(color, defs) {
  const shell = id('xm')
  const band = id('xb')
  defs.push(linear(shell, [[0, lighten(color, 0.3)], [0.5, color], [1, darken(color, 0.25)]]))
  defs.push(linear(band, [[0, lighten(color, 0.5)], [0.5, mix(color, '#b9bcc2', 0.5)], [1, darken(color, 0.1)]], 0, 0, 1, 0))
  const cup = side => `<g transform="scale(${side} 1)">
<rect x="198" y="-26" width="20" height="96" rx="10" fill="#b9bcc2" stroke="#8d9097" stroke-width="2"/>
<ellipse cx="256" cy="146" rx="112" ry="176" fill="url(#${shell})"/>
<ellipse cx="226" cy="150" rx="92" ry="150" fill="#1f2024"/><ellipse cx="220" cy="152" rx="66" ry="120" fill="#2c2d33"/>
<ellipse cx="220" cy="152" rx="40" ry="84" fill="#3a3b42" fill-opacity="0.7"/>
<ellipse cx="302" cy="60" rx="30" ry="64" fill="#ffffff" fill-opacity="0.22"/></g>`
  return `<path d="M-212 40 C-212 -330 212 -330 212 40" fill="none" stroke="url(#${band})" stroke-width="30" stroke-linecap="round"/>
<path d="M-176 40 C-176 -250 176 -250 176 40" fill="none" stroke="#2a2b30" stroke-width="16" stroke-linecap="round" stroke-opacity="0.9"/>
${cup(-1)}${cup(1)}<circle cx="318" cy="-14" r="16" fill="#b9bcc2" stroke="#8d9097" stroke-width="2"/>`
}

function magsafe(defs) {
  const puck = id('mp')
  defs.push(radial(puck, [[0, '#ffffff'], [0.75, '#f1f1ed'], [1, '#d6d6d1']], 0.4, 0.35, 0.75))
  return `<path d="M0 160 C0 330 140 380 360 346" fill="none" stroke="#cfcfca" stroke-width="30" stroke-linecap="round"/><path d="M0 160 C0 330 140 380 360 346" fill="none" stroke="#fbfbf9" stroke-width="25" stroke-linecap="round"/>
<rect x="340" y="320" width="72" height="52" rx="12" fill="#e9e9e5" stroke="#c2c2bd" stroke-width="2"/>
<circle cx="0" cy="0" r="176" fill="url(#${puck})" stroke="#cbcbc6" stroke-width="2"/><circle cx="0" cy="0" r="128" fill="none" stroke="#d6d6d1" stroke-width="3"/><circle cx="0" cy="0" r="62" fill="#ededea" stroke="#d0d0cb" stroke-width="2"/>`
}

function airtag(defs) {
  const face = id('at')
  const steel = id('as')
  defs.push(radial(face, [[0, '#ffffff'], [0.8, '#f2f2ee'], [1, '#d9d9d4']], 0.38, 0.32, 0.75))
  defs.push(radial(steel, [[0, '#f3f4f6'], [0.6, '#b9bcc2'], [1, '#8d9097']], 0.4, 0.35, 0.8))
  return `<circle cx="40" cy="44" r="186" fill="url(#${steel})"/><circle cx="0" cy="0" r="186" fill="url(#${face})" stroke="#cfcfca" stroke-width="2"/><circle cx="0" cy="0" r="168" fill="none" stroke="#e1e1dc" stroke-width="2"/><circle cx="0" cy="0" r="30" fill="#f6f6f3" stroke="#d3d3ce" stroke-width="2"/><circle cx="0" cy="0" r="9" fill="#c9c9c4"/>`
}

function pencil(defs) {
  const g = id('pc')
  defs.push(linear(g, [[0, '#d9d9d4'], [0.3, '#ffffff'], [0.7, '#f4f4f1'], [1, '#cfcfca']], 0, 0, 1, 0))
  return `<g transform="rotate(-38)"><rect x="-24" y="-440" width="48" height="760" rx="24" fill="url(#${g})" stroke="#d0d0cb" stroke-width="2"/>
<path d="M-24 306 L0 420 L24 306 Z" fill="#f4f4f1" stroke="#d0d0cb" stroke-width="2" stroke-linejoin="round"/><path d="M-6 394 L0 420 L6 394 Z" fill="#3a3a3d"/>
<rect x="-24" y="230" width="48" height="2" fill="#cfcfca"/><rect x="-8" y="-380" width="3" height="560" rx="1.5" fill="#d9d9d4"/></g>`
}

function adapter(defs) {
  const g = id('ad')
  const prong = id('ap')
  defs.push(linear(g, [[0, '#ffffff'], [1, '#e1e1dc']], 0, 0, 0, 1))
  defs.push(linear(prong, [[0, '#f3f4f6'], [0.5, '#b9bcc2'], [1, '#9a9da4']], 0, 0, 1, 0))
  return `<rect x="-52" y="130" width="28" height="86" rx="6" fill="url(#${prong})"/><rect x="24" y="130" width="28" height="86" rx="6" fill="url(#${prong})"/>
<rect x="-140" y="-150" width="280" height="300" rx="56" fill="url(#${g})" stroke="#cfcfca" stroke-width="2"/><rect x="-46" y="-118" width="92" height="26" rx="13" fill="#3a3a3d"/><rect x="-36" y="-110" width="72" height="10" rx="5" fill="#16161a"/>
<rect x="-90" y="-20" width="180" height="6" rx="3" fill="#e4e4df"/><rect x="-60" y="14" width="120" height="6" rx="3" fill="#e4e4df"/>`
}

/* ---------- Ảnh sản phẩm ---------- */
const sceneFor = {
  'iphone-pro': (color, defs) => ({ body: place(phoneBack('pro', color, defs), 600, 590, 1.05, -7), shadow: { cx: 610, cy: 1030, rx: 190, ry: 24 } }),
  'iphone-bar': (color, defs) => ({ body: place(phoneBack('bar', color, defs), 600, 590, 1.05, -7), shadow: { cx: 610, cy: 1030, rx: 190, ry: 24 } }),
  'iphone-air': (color, defs) => ({ body: place(phoneBack('air', color, defs), 600, 590, 1.05, -7), shadow: { cx: 610, cy: 1030, rx: 190, ry: 24 } }),
  iphone: (color, defs) => ({ body: place(phoneBack('plain', color, defs), 600, 590, 1.05, -7), shadow: { cx: 610, cy: 1030, rx: 190, ry: 24 } }),
  macbook: (color, defs) => ({ body: place(laptop(color, defs), 600, 640, 1.38), shadow: { cx: 600, cy: 878, rx: 480, ry: 26 } }),
  ipad: (color, defs) => ({ body: place(tablet(color, defs), 600, 590, 1.0, -4), shadow: { cx: 606, cy: 1010, rx: 270, ry: 24 } }),
  watch: (color, defs) => ({ body: place(watch(color, defs, lighten(color, 0.3)), 600, 600, 1.12), shadow: { cx: 600, cy: 1070, rx: 190, ry: 20 } }),
  'airpods-pro': (_, defs) => ({ body: place(airpodsPro(defs), 600, 590, 1.28), shadow: { cx: 600, cy: 830, rx: 420, ry: 24 } }),
  'airpods-4': (_, defs) => ({ body: place(airpods4(defs), 600, 590, 1.4), shadow: { cx: 600, cy: 820, rx: 400, ry: 24 } }),
  'airpods-max': (color, defs) => ({ body: place(airpodsMax(color, defs), 600, 520, 1.25), shadow: { cx: 600, cy: 1060, rx: 330, ry: 22 } }),
  magsafe: (_, defs) => ({ body: place(magsafe(defs), 560, 520, 1.3), shadow: { cx: 580, cy: 960, rx: 400, ry: 22 } }),
  airtag: (_, defs) => ({ body: place(airtag(defs), 580, 560, 1.4), shadow: { cx: 600, cy: 900, rx: 320, ry: 22 } }),
  pencil: (_, defs) => ({ body: place(pencil(defs), 600, 580, 1.2), shadow: { cx: 600, cy: 1000, rx: 320, ry: 20 } }),
  adapter: (_, defs) => ({ body: place(adapter(defs), 600, 560, 1.7), shadow: { cx: 600, cy: 1010, rx: 270, ry: 22 } }),
}

function productImage(product, color) {
  const defs = []
  const built = sceneFor[product.kind](color.hex, defs)
  return scene({ tint: color.hex, defs, label: `${product.name} màu ${color.name}`, body: built.body, shadow: built.shadow })
}

/** Ảnh chi tiết thứ hai: mặt trước thiết bị khi có, ngược lại là cận cảnh lệch góc. */
function detailImage(product, color) {
  const defs = []
  const front = {
    'iphone-pro': () => `${place(phoneFront(color.hex, defs), 420, 600, 0.98, -6)}${place(phoneBack('pro', color.hex, defs), 790, 600, 0.98, 7)}`,
    'iphone-bar': () => `${place(phoneFront(color.hex, defs), 420, 600, 0.98, -6)}${place(phoneBack('bar', color.hex, defs), 790, 600, 0.98, 7)}`,
    'iphone-air': () => `${place(phoneFront(color.hex, defs), 420, 600, 0.98, -6)}${place(phoneBack('air', color.hex, defs), 790, 600, 0.98, 7)}`,
    iphone: () => `${place(phoneFront(color.hex, defs), 420, 600, 0.98, -6)}${place(phoneBack('plain', color.hex, defs), 790, 600, 0.98, 7)}`,
    macbook: () => place(laptop(color.hex, defs), 600, 620, 1.5),
    ipad: () => `${place(tablet(color.hex, defs), 600, 600, 1.0, 0)}`,
    watch: () => `${place(watch(color.hex, defs, lighten(color.hex, 0.3)), 380, 600, 0.95, -6)}${place(watch(color.hex, defs, darken(color.hex, 0.35)), 820, 600, 0.95, 6)}`,
  }[product.kind]
  const body = front ? front() : sceneFor[product.kind](color.hex, defs).body.replace('scale(', 'scale(')
  const zoom = !front
  return scene({
    tint: color.hex, defs, label: `${product.name}, góc nhìn thứ hai`, arch: false,
    body: zoom ? `<g transform="translate(600 600) scale(1.12) translate(-600 -600) rotate(5 600 600)">${body}</g>` : body,
    shadow: { cx: 600, cy: product.kind === 'macbook' ? 900 : 1040, rx: product.kind === 'macbook' ? 520 : 460, ry: 24 },
  })
}

/* ---------- Ảnh trang chủ ---------- */
const orange = catalog.products[0].colors[0].hex
const proBlue = catalog.products[0].colors[1].hex

function heroImage() {
  const defs = []
  const body = `${place(phoneFront(orange, defs), 470, 760, 1.12, -10)}${place(phoneBack('pro', orange, defs), 770, 700, 1.2, 8)}`
  return scene({ width: 1200, height: 1500, tint: orange, defs, label: 'iPhone 17 Pro Max màu Cam Vũ Trụ', body, shadow: { cx: 620, cy: 1330, rx: 380, ry: 30 } })
}

function collectionImage(kind) {
  const defs = []
  let body
  let tint
  if (kind === 'work') {
    const color = '#c9ccd2'
    tint = '#8a93a6'
    body = `${place(laptop(color, defs), 800, 480, 1.28)}${place(phoneBack('pro', proBlue, defs), 260, 520, 0.68, -8)}`
  } else if (kind === 'student') {
    tint = '#a99dcb'
    body = `${place(tablet('#a99dcb', defs), 760, 470, 0.84, 6)}${place(pencil(defs), 300, 480, 0.75)}`
  } else {
    tint = '#b8a8d4'
    body = `${place(airpodsMax('#b8a8d4', defs), 800, 440, 1.0)}${place(airpodsPro(defs), 280, 560, 0.62)}`
  }
  return scene({ width: 1600, height: 900, tint, defs, label: `Bộ sưu tập ${kind}`, body, shadow: { cx: 800, cy: 850, rx: 520, ry: 20 }, arch: false })
}

function newsletterImage() {
  const defs = []
  const body = `${place(watch('#e4bfae', defs, '#efe3d6'), 400, 560, 0.95, -6)}${place(airpodsPro(defs), 790, 620, 0.9)}`
  return scene({ tint: '#e4bfae', defs, label: 'Apple Watch và AirPods', body, shadow: { cx: 600, cy: 960, rx: 430, ry: 22 } })
}

const postImages = {
  'post-iphone': () => { const defs = []; return scene({ width: 1600, height: 1000, tint: '#9db6cf', defs, arch: false, label: 'iPhone', body: `${place(phoneFront('#9db6cf', defs), 560, 520, 0.98, -8)}${place(phoneBack('bar', '#9db6cf', defs), 1010, 500, 0.98, 8)}`, shadow: { cx: 800, cy: 930, rx: 600, ry: 20 } }).replace('<defs>', '<defs>') },
  'post-macbook': () => { const defs = []; return scene({ width: 1600, height: 1000, tint: '#b7cbdf', arch: false, defs, label: 'MacBook', body: place(laptop('#b7cbdf', defs), 800, 450, 1.35), shadow: { cx: 800, cy: 810, rx: 560, ry: 22 } }) },
  'post-airpods': () => { const defs = []; return scene({ width: 1600, height: 1000, tint: '#d8d8d3', arch: false, defs, label: 'AirPods', body: place(airpodsPro(defs), 800, 470, 1.35), shadow: { cx: 800, cy: 820, rx: 500, ry: 22 } }) },
  'post-ipad': () => { const defs = []; return scene({ width: 1600, height: 1000, tint: '#8196b6', arch: false, defs, label: 'iPad', body: `${place(tablet('#8196b6', defs), 800, 500, 0.92, 0)}${place(pencil(defs), 1180, 520, 0.7)}`, shadow: { cx: 800, cy: 930, rx: 420, ry: 20 } }) },
  'post-watch': () => { const defs = []; return scene({ width: 1600, height: 1000, tint: '#e4bfae', arch: false, defs, label: 'Apple Watch', body: `${place(watch('#2a2a2d', defs, '#3a3a3f'), 600, 480, 0.9, -5)}${place(watch('#e4bfae', defs, '#efe3d6'), 1020, 500, 0.9, 5)}`, shadow: { cx: 800, cy: 930, rx: 640, ry: 18 } }) },
}

/* ---------- Ghi tệp ---------- */
mkdirSync(productsDir, { recursive: true })
mkdirSync(homeDir, { recursive: true })
let count = 0
const write = (dir, name, svg) => { writeFileSync(join(dir, name), svg); count += 1 }

for (const product of catalog.products) {
  for (const color of product.colors) {
    uid = 0
    write(productsDir, `${product.slug}-${color.key.toLowerCase()}.svg`, productImage(product, color))
  }
  uid = 0
  write(productsDir, `${product.slug}-detail.svg`, detailImage(product, product.colors[0]))
}
uid = 0
write(homeDir, 'hero.svg', heroImage())
for (const kind of ['work', 'student', 'creative']) { uid = 0; write(homeDir, `collection-${kind}.svg`, collectionImage(kind)) }
uid = 0
write(homeDir, 'newsletter.svg', newsletterImage())
for (const [name, build] of Object.entries(postImages)) { uid = 0; write(homeDir, `${name}.svg`, build()) }
console.log(`Đã tạo ${count} ảnh SVG.`)
