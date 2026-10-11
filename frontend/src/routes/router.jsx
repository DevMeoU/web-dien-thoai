import { createBrowserRouter } from 'react-router-dom'
import UserLayout from '../layouts/UserLayout'
import AdminLayout from '../layouts/AdminLayout'
import NotFoundPage from '../components/common/NotFoundPage'
import RequireAuth from '../components/common/RequireAuth'
import RequireAdmin from '../components/common/RequireAdmin'
import HomePage from '../pages/user/Home'
import ProductsRoute from '../pages/user/Products/ProductsRoute'
import UserProductDetail from '../pages/user/ProductDetail/ProductDetailRoute'
import UserReviews from '../pages/user/Reviews'
import UserWishlist from '../pages/user/Wishlist'
import UserCart from '../pages/user/Cart'
import UserCheckout from '../pages/user/Checkout'
import UserCheckoutSuccess from '../pages/user/CheckoutSuccess'
import UserOrders from '../pages/user/Orders'
import UserOrderDetail from '../pages/user/OrderDetail'
import UserMyProfile from '../pages/user/MyProfile'
import UserAddresses from '../pages/user/Addresses'
import UserLogin from '../pages/user/Login'
import UserRegister from '../pages/user/Register'
import UserForgotPassword from '../pages/user/ForgotPassword'
import UserResetPassword from '../pages/user/ResetPassword'
import UserContact from '../pages/user/Contact'
import UserPolicies from '../pages/user/Policies'
import UserAbout from '../pages/user/About'
import UserBlogs from '../pages/user/Blogs'
import UserBlogDetail from '../pages/user/BlogDetail'

export const router = createBrowserRouter([
  { path: '/', element: <UserLayout />, children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductsRoute /> },
      { path: "products/:id", element: <UserProductDetail /> },
      { path: "login", element: <UserLogin /> },
      { path: "register", element: <UserRegister /> },
      { path: "forgot-password", element: <UserForgotPassword /> },
      { path: "reset-password", element: <UserResetPassword /> },
      { path: "contact", element: <UserContact /> },
      { path: "policies", element: <UserPolicies /> },
      { path: "about", element: <UserAbout /> },
      { path: "blogs", element: <UserBlogs /> },
      { path: "blogs/:slug", element: <UserBlogDetail /> },
      // Các trang dưới đây yêu cầu đăng nhập.
      { element: <RequireAuth />, children: [
          { path: "wishlist", element: <UserWishlist /> },
          { path: "cart", element: <UserCart /> },
          { path: "checkout", element: <UserCheckout /> },
          { path: "checkout/success", element: <UserCheckoutSuccess /> },
          { path: "orders", element: <UserOrders /> },
          { path: "orders/:id", element: <UserOrderDetail /> },
          { path: "reviews", element: <UserReviews /> },
          { path: "profile", element: <UserMyProfile /> },
          { path: "addresses", element: <UserAddresses /> },
      ] },
  ] },
  // Khu vực quản trị yêu cầu vai trò admin.
  { path: '/admin', element: <RequireAdmin />, children: [
      { element: <AdminLayout />, children: [
          { index: true, lazy: () => import('../pages/admin/Dashboard').then(module => ({ Component: module.default })) },
          { path: "products", lazy: () => import('../pages/admin/Products').then(module => ({ Component: module.default })) },
          { path: "inventory", lazy: () => import('../pages/admin/Inventory').then(module => ({ Component: module.default })) },
          { path: "categories", lazy: () => import('../pages/admin/Categories').then(module => ({ Component: module.default })) },
          { path: "brands", lazy: () => import('../pages/admin/Brands').then(module => ({ Component: module.default })) },
          { path: "orders", lazy: () => import('../pages/admin/Orders').then(module => ({ Component: module.default })) },
          { path: "users", lazy: () => import('../pages/admin/Users').then(module => ({ Component: module.default })) },
          { path: "reviews", lazy: () => import('../pages/admin/Reviews').then(module => ({ Component: module.default })) },
          { path: "coupons", lazy: () => import('../pages/admin/Coupons').then(module => ({ Component: module.default })) },
          { path: "content", lazy: () => import('../pages/admin/Content').then(module => ({ Component: module.default })) },
          { path: "contacts", lazy: () => import('../pages/admin/Contacts').then(module => ({ Component: module.default })) },
          { path: "reports", lazy: () => import('../pages/admin/Reports').then(module => ({ Component: module.default })) },
          { path: "profile", lazy: () => import('../pages/admin/Profile').then(module => ({ Component: module.default })) },
          { path: "posts", lazy: () => import('../pages/admin/Posts').then(module => ({ Component: module.default })) },
          { path: "newsletter", lazy: () => import('../pages/admin/Newsletter').then(module => ({ Component: module.default })) },
          { path: "settings", lazy: () => import('../pages/admin/Settings').then(module => ({ Component: module.default })) },
      ] },
  ] },
  { path: '*', element: <NotFoundPage /> },
])
