import { createContext, useContext } from 'react'

export const ShopContext = createContext(null)

export function useShop() {
  const context = useContext(ShopContext)
  if (!context) throw new Error('useShop phải được dùng bên trong ShopProvider')
  return context
}
