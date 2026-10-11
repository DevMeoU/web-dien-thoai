import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ShopProvider } from './contexts/ShopContext'
import { router } from './routes/router.jsx'

export default function App() {
  return <AuthProvider>
    <ShopProvider>
      <RouterProvider router={router} />
    </ShopProvider>
  </AuthProvider>
}
