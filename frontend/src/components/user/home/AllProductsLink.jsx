import { Link } from 'react-router-dom'

export default function AllProductsLink({ className = '' }) {
  return <Link to="/products" className={`relative shrink-0 pb-[3px] text-lg leading-[1.4] font-medium after:absolute after:right-0 after:bottom-0 after:h-px after:w-10 after:bg-current after:transition-[width] after:duration-300 after:ease-[ease] hover:after:w-full focus-visible:after:w-full motion-reduce:after:transition-none ${className}`}>Tất cả sản phẩm</Link>
}
