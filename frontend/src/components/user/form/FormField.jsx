import { useId, useState } from 'react'
import { Eye, EyeSlash } from '@phosphor-icons/react'
import { fieldClass, labelClass } from './formStyles'

export default function FormField({ label, error, type = 'text', ...props }) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'
  return <div className={labelClass}>
    <label htmlFor={id}>{label}</label>
    <div className="relative">
      <input id={id} type={isPassword && visible ? 'text' : type} className={`${fieldClass} ${isPassword ? 'pr-11' : ''} ${error ? 'border-red-600' : ''}`} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {isPassword && <button type="button" className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-[#555] hover:text-black" aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={visible} onClick={() => setVisible(!visible)}>
        {visible ? <EyeSlash size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
      </button>}
    </div>
    {error && <span id={`${id}-error`} role="alert" className="text-[13px] text-red-700">{error}</span>}
  </div>
}
