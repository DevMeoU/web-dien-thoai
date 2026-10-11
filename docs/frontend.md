# Frontend Mela

React 19 + Vite + Tailwind CSS 4, gọi Laravel API qua `/api` (Vite proxy trong dev).

## Kiến trúc

| Thư mục | Vai trò |
|---|---|
| `src/services/` | Một lớp mỏng gọi API: `api.js` (token Bearer, lỗi, tải CSV), `authService`, `shopService` (công khai), `accountService` (cần đăng nhập), `adminService` |
| `src/contexts/` | `AuthContext` (phiên đăng nhập), `ShopContext` (giỏ hàng và yêu thích đồng bộ với máy chủ); hook `useAuth`, `useShop` nằm trong `authState.js`, `shopState.js` |
| `src/hooks/` | `useAsync` (tải dữ liệu), `useStoreData` (sản phẩm, danh mục, banner, cấu hình có cache 60 giây và dùng chung request) |
| `src/routes/router.jsx` | Router; `RequireAuth` bảo vệ trang khách, `RequireAdmin` bảo vệ `/admin` (trang admin được lazy-load) |
| `src/pages/user`, `src/pages/admin` | Các trang |
| `src/components/admin/` | Bộ thành phần quản trị dùng chung: `ui.jsx`, `CrudPage.jsx` (CRUD theo cấu hình), `ProductEditor.jsx`, `Charts.jsx`, `useAdminList.js` |

## Đăng nhập và phân quyền

- Token Sanctum lưu trong `localStorage` (`mela-token`), gửi qua header `Authorization`. Mở lại trang sẽ tự khôi phục phiên bằng `GET /profile`.
- Nhận 401 từ API thì token bị xóa và người dùng về trạng thái chưa đăng nhập.
- Chưa đăng nhập mà vào trang cần quyền sẽ được chuyển tới `/login` rồi quay lại trang cũ; tài khoản khách vào `/admin` thấy trang 403. Máy chủ vẫn kiểm tra lại quyền ở mọi API.

## Trang khách hàng

`/`, `/products`, `/products/:slug`, `/about`, `/contact`, `/policies?tab=guide|shipping|warranty|returns|privacy`, `/blogs`, `/blogs/:slug`, `/login`, `/register`, `/forgot-password`, `/reset-password`; cần đăng nhập: `/cart`, `/checkout`, `/checkout/success`, `/orders`, `/orders/:code`, `/wishlist`, `/reviews`, `/profile`, `/addresses`.

- Danh sách sản phẩm tải tối đa 100 sản phẩm đang bán một lần, lọc/sắp xếp/tìm kiếm trên trình duyệt (không dấu cũng tìm được) và phân trang 12 sản phẩm mỗi trang. API vẫn hỗ trợ lọc và phân trang phía máy chủ.
- Trang chi tiết: chọn màu (ảnh đổi theo màu), dung lượng/cấu hình (hiển thị giá từng phiên bản), số lượng ngay trên trang; tồn kho hiển thị theo phiên bản và không cho mua vượt tồn. Bên dưới có mô tả, bảng thông số kỹ thuật, nội dung hộp và bảo hành lấy từ API.
- Bộ lọc danh sách: dòng sản phẩm, khoảng giá (theo triệu đồng), dung lượng/cấu hình (`?config=`), màu, nhu cầu (`?collection=work|student|creative`).

## Trang quản trị

`/admin` (dashboard), `/admin/reports`, `/admin/orders`, `/admin/coupons`, `/admin/reviews`, `/admin/contacts`, `/admin/products`, `/admin/inventory`, `/admin/categories`, `/admin/brands`, `/admin/users`, `/admin/content` (banner và trang nội dung), `/admin/settings`.

Trang sửa sản phẩm (`ProductEditor.jsx`) có các trường riêng cho sản phẩm Apple: câu giới thiệu, tên tùy chọn cấu hình, điểm nổi bật, bảng thông số kỹ thuật (thêm/xóa từng dòng), nội dung trong hộp, bảo hành và ảnh từng phiên bản.

Danh mục, thương hiệu, banner và mã giảm giá dùng chung `CrudPage` nên chỉ cần khai báo cột và trường biểu mẫu.

## Thiết kế giao diện

Giữ phong cách UI Nuvola: nền trắng và xám trung tính, chữ đen, font Inter tự lưu trong `public/fonts`, thẻ ảnh bo góc và nút dạng viên thuốc. Khung nội dung tối đa 1440px, breakpoint tablet 810px và desktop 1440px. Hiệu ứng xuất hiện dùng Motion; cuộn mượt dùng Lenis, có hỗ trợ giảm chuyển động. Trang chủ gồm banner thiết bị, danh mục, sản phẩm mới, nhóm nhu cầu sử dụng, sản phẩm nổi bật/bán chạy/ưu đãi, đánh giá và đăng ký nhận tin. Trang chi tiết giữ bố cục ảnh bên trái, thông tin và nút mua bên phải; bên dưới có mô tả và bảng thông số. Nội dung hoàn toàn bằng tiếng Việt.

Các dòng iPhone, MacBook, iPad, Apple Watch, AirPods Pro 3 và banner dùng ảnh PNG chân thực tạo bằng công cụ AI tích hợp, lưu trong `frontend/public/images`; AirPods 4, AirPods Max và phụ kiện khác giữ bộ SVG cũ. Prompt nằm trong `docs/product-photo-prompts.json` và `docs/airpods-photo-prompt.json`. Quản trị viên có thể tải ảnh chụp sản phẩm lên. Chạy `php scripts/use-product-photos.php` từ thư mục gốc để đổi riêng đường dẫn ảnh mẫu đã có PNG, giữ nguyên dữ liệu khác.

Banner chính trải rộng theo màn hình, dùng ảnh nền toàn khung trên desktop và xếp nội dung trên ảnh ở mobile. Header desktop đặt logo bên trái, menu ở giữa và nút tìm kiếm cùng các tiện ích bên phải. Ảnh và nội dung banner vẫn lấy từ API; prompt banner nằm trong `docs/hero-wide-prompt.json`.

## Chạy và kiểm tra

```powershell
npm run dev      # http://localhost:5173
npm run lint
npm run build
```

Cần chạy backend (`php artisan serve --host=127.0.0.1 --port=8000`) để các trang có dữ liệu.
