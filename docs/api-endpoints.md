# Danh sách API

Tổng cộng **120** endpoint được ghi lại.

Tự sinh bởi `scripts/generate_api_docs.py`. Mọi phản hồi là JSON; lỗi có dạng `{"message": "...", "data": null}` (422 kèm `errors`).

Xác thực: **Bearer token** (Laravel Sanctum) — cột *Quyền*: `Công khai`, `Khách` (đã đăng nhập), `Admin`.

## 1. Hệ thống

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/health` | Công khai | Kiểm tra API. Kiểm tra máy chủ đang hoạt động. |

## 2. Xác thực

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/api/auth/register` | Công khai | Đăng ký. Tạo tài khoản khách hàng, trả về token. |
| `POST` | `/api/auth/login` | Công khai | Đăng nhập (khách). Đăng nhập, lưu token vào biến {{token}}. |
| `POST` | `/api/auth/login` | Công khai | Đăng nhập (quản trị). Đăng nhập quản trị, lưu token vào biến {{adminToken}}. |
| `POST` | `/api/auth/logout` | Khách | Đăng xuất. Thu hồi token hiện tại. |
| `POST` | `/api/auth/forgot-password` | Công khai | Quên mật khẩu. Gửi liên kết đặt lại mật khẩu qua email (luôn trả cùng một thông báo). |
| `POST` | `/api/auth/reset-password` | Công khai | Đặt lại mật khẩu. Đặt mật khẩu mới bằng token trong email. |

## 3. Công khai: sản phẩm và nội dung

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/products` | Công khai | Danh sách sản phẩm. Tìm theo tên, lọc theo danh mục, thương hiệu, khoảng giá, dung lượng/cấu hình, màu; sắp xếp (newest, price_asc, price_desc, name, rating); phân trang. |
| `GET` | `/api/products/iphone-17-pro-max` | Công khai | Chi tiết sản phẩm. Tìm theo id hoặc slug; kèm ảnh, thông số kỹ thuật, điểm nổi bật và các phiên bản (cấu hình × màu) với giá, tồn kho. |
| `GET` | `/api/products/iphone-17-pro-max/related` | Công khai | Sản phẩm liên quan. Sản phẩm cùng danh mục. |
| `GET` | `/api/products/iphone-17-pro-max/reviews` | Công khai | Đánh giá của sản phẩm. Điểm trung bình, phân bố số sao và danh sách đánh giá công khai. |
| `GET` | `/api/categories` | Công khai | Cây danh mục. Danh mục cha kèm danh mục con đang hiển thị. |
| `GET` | `/api/brands` | Công khai | Thương hiệu. Thương hiệu đang hiển thị. |
| `GET` | `/api/banners` | Công khai | Banner trang chủ. Banner đang bật theo thứ tự; position=hero (đầu trang) hoặc collection (thẻ bộ sưu tập). |
| `GET` | `/api/posts` | Công khai | Danh sách tin tức. Bài viết đã xuất bản, mới nhất trước, có phân trang. |
| `GET` | `/api/posts/tu-do-toi-gian-10-mon-nen-co` | Công khai | Chi tiết bài viết. Bài chưa xuất bản trả về 404. |
| `GET` | `/api/reviews/featured` | Công khai | Nhận xét nổi bật. Đánh giá từ 4 sao, có nội dung, đang công khai (trang chủ). |
| `POST` | `/api/newsletter` | Công khai | Đăng ký nhận tin. Email đã đăng ký không báo lỗi trùng. |
| `GET` | `/api/settings` | Công khai | Thông tin cửa hàng. Thông tin liên hệ, giới thiệu, phí giao hàng và ngưỡng miễn phí. |
| `GET` | `/api/pages` | Công khai | Danh sách trang nội dung. Các trang đã xuất bản. |
| `GET` | `/api/pages/shipping-policy` | Công khai | Chi tiết trang nội dung. Slug: about, shopping-guide, shipping-policy, return-policy, privacy-policy. |
| `POST` | `/api/contact-requests` | Công khai | Gửi yêu cầu liên hệ. Khách gửi yêu cầu hỗ trợ (không cần đăng nhập). |

## 4. Hồ sơ cá nhân

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/profile` | Khách | Xem hồ sơ. Thông tin người dùng đang đăng nhập. |
| `PUT` | `/api/profile` | Khách | Cập nhật hồ sơ. Đổi họ tên và số điện thoại. |
| `PUT` | `/api/profile/password` | Khách | Đổi mật khẩu. Cần mật khẩu hiện tại; đăng xuất các thiết bị khác. |
| `POST` | `/api/profile/avatar` | Khách | Tải ảnh đại diện. Tệp ảnh jpg/png/webp tối đa 4MB. |

## 5. Sổ địa chỉ

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/addresses` | Khách | Danh sách địa chỉ. Địa chỉ mặc định nằm đầu. |
| `POST` | `/api/addresses` | Khách | Thêm địa chỉ. Địa chỉ đầu tiên tự là mặc định. |
| `GET` | `/api/addresses/{{addressId}}` | Khách | Xem địa chỉ. Chỉ xem được địa chỉ của chính mình. |
| `PUT` | `/api/addresses/{{addressId}}` | Khách | Sửa địa chỉ. Không ảnh hưởng đơn hàng đã đặt. |
| `PATCH` | `/api/addresses/{{addressId}}/default` | Khách | Đặt làm mặc định. Chỉ có một địa chỉ mặc định. |
| `DELETE` | `/api/addresses/{{addressId}}` | Khách | Xóa địa chỉ. Xóa mặc định thì địa chỉ khác được đặt làm mặc định. |

## 6. Giỏ hàng

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/cart` | Khách | Xem giỏ hàng. Kèm tạm tính, cảnh báo tồn kho từng dòng. |
| `POST` | `/api/cart/items` | Khách | Thêm vào giỏ. Cộng dồn nếu đã có; không vượt tồn kho. |
| `PUT` | `/api/cart/items/{{itemId}}` | Khách | Đổi số lượng. Kiểm tra lại tồn kho. |
| `DELETE` | `/api/cart/items/{{itemId}}` | Khách | Xóa dòng khỏi giỏ.  |
| `DELETE` | `/api/cart` | Khách | Xóa toàn bộ giỏ.  |

## 7. Yêu thích

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/wishlist` | Khách | Danh sách yêu thích. Giữ cả sản phẩm đã ngừng bán để báo trạng thái. |
| `POST` | `/api/wishlist` | Khách | Thêm yêu thích.  |
| `DELETE` | `/api/wishlist/{{productId}}` | Khách | Bỏ yêu thích.  |

## 8. Thanh toán và đơn hàng

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/api/coupons/validate` | Khách | Kiểm tra mã giảm giá. Trả về số tiền giảm hoặc lý do không hợp lệ. |
| `POST` | `/api/checkout/preview` | Khách | Tính trước tổng tiền. Tạm tính, giảm giá, phí giao hàng và tổng từ giỏ hàng. |
| `POST` | `/api/orders` | Khách | Đặt hàng (COD). Kiểm tra tồn kho, trừ kho, áp mã, tạo mã đơn và xóa giỏ trong một transaction. |
| `GET` | `/api/orders` | Khách | Lịch sử đơn hàng. Tìm theo mã, lọc theo trạng thái, phân trang. |
| `GET` | `/api/orders/{{orderCode}}` | Khách | Chi tiết đơn hàng. Kèm lịch sử cập nhật trạng thái. |
| `POST` | `/api/orders/{{orderCode}}/cancel` | Khách | Hủy đơn. Chỉ khi đang chờ xác nhận; bắt buộc có lý do; hoàn tồn kho. |

## 9. Đánh giá của khách

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/reviews/eligible` | Khách | Sản phẩm có thể đánh giá. Dòng đơn hàng đã hoàn tất và chưa đánh giá. |
| `GET` | `/api/reviews/mine` | Khách | Đánh giá của tôi.  |
| `POST` | `/api/reviews` | Khách | Viết đánh giá. Mỗi sản phẩm trong một đơn một đánh giá. |
| `PUT` | `/api/reviews/{{reviewId}}` | Khách | Sửa đánh giá.  |
| `DELETE` | `/api/reviews/{{reviewId}}` | Khách | Xóa đánh giá.  |

## 10. Quản trị: tổng quan và báo cáo

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin | Dashboard. Số khách, sản phẩm, đơn mới, đơn chờ, doanh thu, biểu đồ theo ngày, đơn gần nhất, hàng sắp hết. |
| `GET` | `/api/admin/reports` | Admin | Báo cáo thống kê. Doanh thu, đơn theo trạng thái, sản phẩm bán chạy, khách mua nhiều, tồn kho. |
| `GET` | `/api/admin/reports/export` | Admin | Xuất CSV. type: orders, products, customers, revenue. |

## 11. Quản trị: sản phẩm và tồn kho

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/admin/products` | Admin | Danh sách sản phẩm. Gồm sản phẩm ẩn và ngừng bán. |
| `POST` | `/api/admin/products` | Admin | Tạo sản phẩm. Có thể tạo kèm thông số kỹ thuật (specs), điểm nổi bật (highlights) và các phiên bản (cấu hình × màu). |
| `GET` | `/api/admin/products/{{adminProductId}}` | Admin | Chi tiết sản phẩm.  |
| `PUT` | `/api/admin/products/{{adminProductId}}` | Admin | Cập nhật sản phẩm.  |
| `PATCH` | `/api/admin/products/{{adminProductId}}/status` | Admin | Đổi trạng thái. active, hidden, discontinued. |
| `POST` | `/api/admin/products/{{adminProductId}}/thumbnail` | Admin | Tải ảnh đại diện.  |
| `POST` | `/api/admin/products/{{adminProductId}}/images` | Admin | Thêm ảnh chi tiết.  |
| `DELETE` | `/api/admin/products/{{adminProductId}}/images/1` | Admin | Xóa ảnh chi tiết.  |
| `DELETE` | `/api/admin/products/{{adminProductId}}` | Admin | Xóa sản phẩm. Từ chối (409) nếu sản phẩm đã có trong đơn hàng. |
| `POST` | `/api/admin/products/{{adminProductId}}/variants` | Admin | Thêm phiên bản (cấu hình × màu).  |
| `PUT` | `/api/admin/variants/{{variantAdminId}}` | Admin | Sửa phiên bản.  |
| `POST` | `/api/admin/variants/{{variantAdminId}}/image` | Admin | Tải ảnh phiên bản.  |
| `DELETE` | `/api/admin/variants/{{variantAdminId}}` | Admin | Xóa phiên bản. Từ chối (409) nếu đã có trong đơn hàng. |
| `GET` | `/api/admin/inventory` | Admin | Tồn kho. stock_status: low hoặc out. |
| `PATCH` | `/api/admin/inventory/{{variantAdminId}}` | Admin | Cập nhật tồn kho. Tồn kho không được âm. |

## 12. Quản trị: danh mục, thương hiệu, nội dung

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/admin/categories` | Admin | Danh sách danh mục.  |
| `POST` | `/api/admin/categories` | Admin | Tạo danh mục. Chỉ hai cấp cha - con. |
| `GET` | `/api/admin/categories/{{categoryId}}` | Admin | Chi tiết danh mục.  |
| `PUT` | `/api/admin/categories/{{categoryId}}` | Admin | Sửa danh mục.  |
| `POST` | `/api/admin/categories/{{categoryId}}/image` | Admin | Tải ảnh danh mục.  |
| `DELETE` | `/api/admin/categories/{{categoryId}}` | Admin | Xóa danh mục. Từ chối (409) nếu còn sản phẩm hoặc danh mục con. |
| `GET` | `/api/admin/brands` | Admin | Danh sách thương hiệu.  |
| `POST` | `/api/admin/brands` | Admin | Tạo thương hiệu.  |
| `GET` | `/api/admin/brands/{{brandId}}` | Admin | Chi tiết thương hiệu.  |
| `PUT` | `/api/admin/brands/{{brandId}}` | Admin | Sửa thương hiệu.  |
| `POST` | `/api/admin/brands/{{brandId}}/image` | Admin | Tải ảnh thương hiệu.  |
| `DELETE` | `/api/admin/brands/{{brandId}}` | Admin | Xóa thương hiệu. Từ chối (409) nếu còn sản phẩm. |
| `GET` | `/api/admin/banners` | Admin | Danh sách banner.  |
| `POST` | `/api/admin/banners` | Admin | Tạo banner.  |
| `GET` | `/api/admin/banners/{{bannerId}}` | Admin | Chi tiết banner.  |
| `PUT` | `/api/admin/banners/{{bannerId}}` | Admin | Sửa banner.  |
| `POST` | `/api/admin/banners/{{bannerId}}/image` | Admin | Tải ảnh banner.  |
| `DELETE` | `/api/admin/banners/{{bannerId}}` | Admin | Xóa banner.  |
| `GET` | `/api/admin/posts` | Admin | Danh sách bài viết.  |
| `POST` | `/api/admin/posts` | Admin | Tạo bài viết. Bỏ trống slug thì tự tạo từ tiêu đề. |
| `GET` | `/api/admin/posts/{{postId}}` | Admin | Chi tiết bài viết.  |
| `PUT` | `/api/admin/posts/{{postId}}` | Admin | Sửa bài viết.  |
| `POST` | `/api/admin/posts/{{postId}}/image` | Admin | Tải ảnh bài viết.  |
| `DELETE` | `/api/admin/posts/{{postId}}` | Admin | Xóa bài viết.  |
| `GET` | `/api/admin/newsletter-subscribers` | Admin | Danh sách đăng ký nhận tin.  |
| `DELETE` | `/api/admin/newsletter-subscribers/1` | Admin | Xóa email nhận tin.  |
| `GET` | `/api/admin/settings` | Admin | Xem cấu hình cửa hàng.  |
| `PUT` | `/api/admin/settings` | Admin | Cập nhật cấu hình. Liên hệ, giới thiệu, phí giao hàng, ngưỡng miễn phí, ngưỡng cảnh báo tồn kho. |
| `GET` | `/api/admin/pages` | Admin | Danh sách trang nội dung.  |
| `GET` | `/api/admin/pages/shipping-policy` | Admin | Xem trang nội dung.  |
| `PUT` | `/api/admin/pages/shipping-policy` | Admin | Cập nhật trang nội dung.  |

## 13. Quản trị: đơn hàng

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/admin/orders` | Admin | Danh sách đơn. Tìm theo mã, khách; lọc theo ngày và trạng thái. |
| `GET` | `/api/admin/orders/{{orderId}}` | Admin | Chi tiết đơn. Kèm khách hàng, lịch sử và ghi chú nội bộ. |
| `PATCH` | `/api/admin/orders/{{orderId}}/status` | Admin | Đổi trạng thái đơn. pending → confirmed → shipping → completed; hủy cần lý do và hoàn tồn. |
| `PATCH` | `/api/admin/orders/{{orderId}}/note` | Admin | Ghi chú nội bộ.  |
| `PATCH` | `/api/admin/orders/{{orderId}}/payment` | Admin | Ghi nhận đã thu tiền COD. Khi đơn đang giao hoặc hoàn tất. |

## 14. Quản trị: khách hàng, đánh giá, khuyến mãi, liên hệ

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/admin/users` | Admin | Danh sách tài khoản. Tìm theo tên, email, số điện thoại. |
| `GET` | `/api/admin/users/{{userId}}` | Admin | Hồ sơ khách và lịch sử mua.  |
| `PATCH` | `/api/admin/users/{{userId}}/status` | Admin | Khóa / mở khóa tài khoản. Khóa sẽ thu hồi mọi token. |
| `PATCH` | `/api/admin/users/{{userId}}/role` | Admin | Đổi vai trò. user hoặc admin. |
| `GET` | `/api/admin/reviews` | Admin | Danh sách đánh giá.  |
| `PATCH` | `/api/admin/reviews/{{reviewAdminId}}/visibility` | Admin | Ẩn / hiện đánh giá.  |
| `POST` | `/api/admin/reviews/{{reviewAdminId}}/reply` | Admin | Trả lời đánh giá.  |
| `GET` | `/api/admin/coupons` | Admin | Danh sách mã giảm giá.  |
| `POST` | `/api/admin/coupons` | Admin | Tạo mã giảm giá. type: percent hoặc fixed. |
| `GET` | `/api/admin/coupons/{{couponId}}` | Admin | Chi tiết mã giảm giá.  |
| `PUT` | `/api/admin/coupons/{{couponId}}` | Admin | Sửa / bật tắt mã.  |
| `DELETE` | `/api/admin/coupons/{{couponId}}` | Admin | Xóa mã giảm giá. Từ chối (409) nếu đã được dùng. |
| `GET` | `/api/admin/contact-requests` | Admin | Danh sách yêu cầu liên hệ.  |
| `GET` | `/api/admin/contact-requests/{{contactId}}` | Admin | Chi tiết yêu cầu liên hệ.  |
| `PATCH` | `/api/admin/contact-requests/{{contactId}}` | Admin | Cập nhật yêu cầu liên hệ. status: new, processing, resolved. |

