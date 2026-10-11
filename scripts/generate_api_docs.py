"""Sinh Postman collection và tài liệu API từ một danh sách endpoint duy nhất.

Chạy:  python scripts/generate_api_docs.py
Kết quả: docs/postman/MelaStore.postman_collection.json và docs/api-endpoints.md
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LOGIN_TEST = [
    "const json = pm.response.json();",
    "pm.test('Đăng nhập thành công', () => pm.response.to.have.status(200));",
    "pm.collectionVariables.set('%s', json.data.token);",
]

ADDRESS = {"recipient_name": "Nguyễn Lan Anh", "phone": "0912345678", "city": "TP. Hồ Chí Minh",
           "district": "Quận 1", "ward": "Phường Bến Nghé", "line": "12 Lê Lợi"}
IMAGE = {"image": "file"}


def e(method, path, name, desc, auth="none", body=None, test=None, form=None):
    return {"method": method, "path": path, "name": name, "desc": desc, "auth": auth, "body": body, "test": test, "form": form}


def save(var, expr):
    return [f"const json = pm.response.json();", f"if (json.data) pm.collectionVariables.set('{var}', {expr});"]


SPEC = [
    ("1. Hệ thống", [
        e("GET", "/api/health", "Kiểm tra API", "Kiểm tra máy chủ đang hoạt động."),
    ]),
    ("2. Xác thực", [
        e("POST", "/api/auth/register", "Đăng ký", "Tạo tài khoản khách hàng, trả về token.", body={"name": "Nguyễn Lan Anh", "email": "lananh@example.com", "password": "Matkhau@123", "password_confirmation": "Matkhau@123", "phone": "0912345678"}),
        e("POST", "/api/auth/login", "Đăng nhập (khách)", "Đăng nhập, lưu token vào biến {{token}}.", body={"email": "khach1@mela.vn", "password": "Khach@12345"}, test=[l % "token" if "%s" in l else l for l in LOGIN_TEST]),
        e("POST", "/api/auth/login", "Đăng nhập (quản trị)", "Đăng nhập quản trị, lưu token vào biến {{adminToken}}.", body={"email": "admin", "password": "adminadmin"}, test=[l % "adminToken" if "%s" in l else l for l in LOGIN_TEST]),
        e("POST", "/api/auth/logout", "Đăng xuất", "Thu hồi token hiện tại.", auth="user"),
        e("POST", "/api/auth/forgot-password", "Quên mật khẩu", "Gửi liên kết đặt lại mật khẩu qua email (luôn trả cùng một thông báo).", body={"email": "khach1@mela.vn"}),
        e("POST", "/api/auth/reset-password", "Đặt lại mật khẩu", "Đặt mật khẩu mới bằng token trong email.", body={"token": "<token trong email>", "email": "khach1@mela.vn", "password": "Matkhau@456", "password_confirmation": "Matkhau@456"}),
    ]),
    ("3. Công khai: sản phẩm và nội dung", [
        e("GET", "/api/products?q=&category=&brand=&collection=&min_price=&max_price=&configuration=&color=&in_stock=&is_new=&on_sale=&sort=newest&per_page=12&page=1", "Danh sách sản phẩm", "Tìm theo tên, lọc theo danh mục, thương hiệu, khoảng giá, dung lượng/cấu hình, màu; sắp xếp (newest, price_asc, price_desc, name, rating); phân trang."),
        e("GET", "/api/products/iphone-17-pro-max", "Chi tiết sản phẩm", "Tìm theo id hoặc slug; kèm ảnh, thông số kỹ thuật, điểm nổi bật và các phiên bản (cấu hình × màu) với giá, tồn kho.", test=save("variantId", "json.data.variants[0].id") + save("productId", "json.data.id")),
        e("GET", "/api/products/iphone-17-pro-max/related", "Sản phẩm liên quan", "Sản phẩm cùng danh mục."),
        e("GET", "/api/products/iphone-17-pro-max/reviews?rating=&per_page=10", "Đánh giá của sản phẩm", "Điểm trung bình, phân bố số sao và danh sách đánh giá công khai."),
        e("GET", "/api/categories", "Cây danh mục", "Danh mục cha kèm danh mục con đang hiển thị."),
        e("GET", "/api/brands", "Thương hiệu", "Thương hiệu đang hiển thị."),
        e("GET", "/api/banners?position=hero", "Banner trang chủ", "Banner đang bật theo thứ tự; position=hero (đầu trang) hoặc collection (thẻ bộ sưu tập)."),
        e("GET", "/api/posts", "Danh sách tin tức", "Bài viết đã xuất bản, mới nhất trước, có phân trang."),
        e("GET", "/api/posts/tu-do-toi-gian-10-mon-nen-co", "Chi tiết bài viết", "Bài chưa xuất bản trả về 404."),
        e("GET", "/api/reviews/featured", "Nhận xét nổi bật", "Đánh giá từ 4 sao, có nội dung, đang công khai (trang chủ)."),
        e("POST", "/api/newsletter", "Đăng ký nhận tin", "Email đã đăng ký không báo lỗi trùng.", body={"email": "khach@example.com"}),
        e("GET", "/api/settings", "Thông tin cửa hàng", "Thông tin liên hệ, giới thiệu, phí giao hàng và ngưỡng miễn phí."),
        e("GET", "/api/pages", "Danh sách trang nội dung", "Các trang đã xuất bản."),
        e("GET", "/api/pages/shipping-policy", "Chi tiết trang nội dung", "Slug: about, shopping-guide, shipping-policy, return-policy, privacy-policy."),
        e("POST", "/api/contact-requests", "Gửi yêu cầu liên hệ", "Khách gửi yêu cầu hỗ trợ (không cần đăng nhập).", body={"name": "Nguyễn Lan Anh", "email": "lananh@example.com", "phone": "0912345678", "message": "Tôi muốn đổi size áo.", "order_code": ""}),
    ]),
    ("4. Hồ sơ cá nhân", [
        e("GET", "/api/profile", "Xem hồ sơ", "Thông tin người dùng đang đăng nhập.", auth="user"),
        e("PUT", "/api/profile", "Cập nhật hồ sơ", "Đổi họ tên và số điện thoại.", auth="user", body={"name": "Nguyễn Lan Anh", "phone": "0912345678"}),
        e("PUT", "/api/profile/password", "Đổi mật khẩu", "Cần mật khẩu hiện tại; đăng xuất các thiết bị khác.", auth="user", body={"current_password": "Khach@12345", "password": "Khach@67890", "password_confirmation": "Khach@67890"}),
        e("POST", "/api/profile/avatar", "Tải ảnh đại diện", "Tệp ảnh jpg/png/webp tối đa 4MB.", auth="user", form=IMAGE),
    ]),
    ("5. Sổ địa chỉ", [
        e("GET", "/api/addresses", "Danh sách địa chỉ", "Địa chỉ mặc định nằm đầu.", auth="user", test=save("addressId", "json.data[0] && json.data[0].id")),
        e("POST", "/api/addresses", "Thêm địa chỉ", "Địa chỉ đầu tiên tự là mặc định.", auth="user", body=ADDRESS, test=save("addressId", "json.data.id")),
        e("GET", "/api/addresses/{{addressId}}", "Xem địa chỉ", "Chỉ xem được địa chỉ của chính mình.", auth="user"),
        e("PUT", "/api/addresses/{{addressId}}", "Sửa địa chỉ", "Không ảnh hưởng đơn hàng đã đặt.", auth="user", body={"line": "99 Hai Bà Trưng"}),
        e("PATCH", "/api/addresses/{{addressId}}/default", "Đặt làm mặc định", "Chỉ có một địa chỉ mặc định.", auth="user"),
        e("DELETE", "/api/addresses/{{addressId}}", "Xóa địa chỉ", "Xóa mặc định thì địa chỉ khác được đặt làm mặc định.", auth="user"),
    ]),
    ("6. Giỏ hàng", [
        e("GET", "/api/cart", "Xem giỏ hàng", "Kèm tạm tính, cảnh báo tồn kho từng dòng.", auth="user", test=save("itemId", "json.data.items[0] && json.data.items[0].id")),
        e("POST", "/api/cart/items", "Thêm vào giỏ", "Cộng dồn nếu đã có; không vượt tồn kho.", auth="user", body={"product_variant_id": "{{variantId}}", "quantity": 1}, test=save("itemId", "json.data.items[0].id")),
        e("PUT", "/api/cart/items/{{itemId}}", "Đổi số lượng", "Kiểm tra lại tồn kho.", auth="user", body={"quantity": 2}),
        e("DELETE", "/api/cart/items/{{itemId}}", "Xóa dòng khỏi giỏ", "", auth="user"),
        e("DELETE", "/api/cart", "Xóa toàn bộ giỏ", "", auth="user"),
    ]),
    ("7. Yêu thích", [
        e("GET", "/api/wishlist", "Danh sách yêu thích", "Giữ cả sản phẩm đã ngừng bán để báo trạng thái.", auth="user"),
        e("POST", "/api/wishlist", "Thêm yêu thích", "", auth="user", body={"product_id": "{{productId}}"}),
        e("DELETE", "/api/wishlist/{{productId}}", "Bỏ yêu thích", "", auth="user"),
    ]),
    ("8. Thanh toán và đơn hàng", [
        e("POST", "/api/coupons/validate", "Kiểm tra mã giảm giá", "Trả về số tiền giảm hoặc lý do không hợp lệ.", auth="user", body={"code": "MELA5", "subtotal": 10000000}),
        e("POST", "/api/checkout/preview", "Tính trước tổng tiền", "Tạm tính, giảm giá, phí giao hàng và tổng từ giỏ hàng.", auth="user", body={"coupon_code": "MELA5"}),
        e("POST", "/api/orders", "Đặt hàng (COD)", "Kiểm tra tồn kho, trừ kho, áp mã, tạo mã đơn và xóa giỏ trong một transaction.", auth="user", body={"address": ADDRESS, "note": "Giao giờ hành chính", "coupon_code": "MELA5", "save_address": True}, test=save("orderCode", "json.data.code")),
        e("GET", "/api/orders?q=&status=&per_page=10", "Lịch sử đơn hàng", "Tìm theo mã, lọc theo trạng thái, phân trang.", auth="user"),
        e("GET", "/api/orders/{{orderCode}}", "Chi tiết đơn hàng", "Kèm lịch sử cập nhật trạng thái.", auth="user"),
        e("POST", "/api/orders/{{orderCode}}/cancel", "Hủy đơn", "Chỉ khi đang chờ xác nhận; bắt buộc có lý do; hoàn tồn kho.", auth="user", body={"reason": "Đặt nhầm kích thước"}),
    ]),
    ("9. Đánh giá của khách", [
        e("GET", "/api/reviews/eligible", "Sản phẩm có thể đánh giá", "Dòng đơn hàng đã hoàn tất và chưa đánh giá.", auth="user"),
        e("GET", "/api/reviews/mine", "Đánh giá của tôi", "", auth="user"),
        e("POST", "/api/reviews", "Viết đánh giá", "Mỗi sản phẩm trong một đơn một đánh giá.", auth="user", body={"order_item_id": 1, "rating": 5, "comment": "Rất đẹp"}, test=save("reviewId", "json.data.id")),
        e("PUT", "/api/reviews/{{reviewId}}", "Sửa đánh giá", "", auth="user", body={"rating": 4, "comment": "Đã chỉnh lại nhận xét"}),
        e("DELETE", "/api/reviews/{{reviewId}}", "Xóa đánh giá", "", auth="user"),
    ]),
    ("10. Quản trị: tổng quan và báo cáo", [
        e("GET", "/api/admin/dashboard?from=&to=", "Dashboard", "Số khách, sản phẩm, đơn mới, đơn chờ, doanh thu, biểu đồ theo ngày, đơn gần nhất, hàng sắp hết.", auth="admin"),
        e("GET", "/api/admin/reports?from=&to=", "Báo cáo thống kê", "Doanh thu, đơn theo trạng thái, sản phẩm bán chạy, khách mua nhiều, tồn kho.", auth="admin"),
        e("GET", "/api/admin/reports/export?type=orders&from=&to=", "Xuất CSV", "type: orders, products, customers, revenue.", auth="admin"),
    ]),
    ("11. Quản trị: sản phẩm và tồn kho", [
        e("GET", "/api/admin/products?q=&status=&category=&per_page=15", "Danh sách sản phẩm", "Gồm sản phẩm ẩn và ngừng bán.", auth="admin"),
        e("POST", "/api/admin/products", "Tạo sản phẩm", "Có thể tạo kèm thông số kỹ thuật (specs), điểm nổi bật (highlights) và các phiên bản (cấu hình × màu).", auth="admin", body={"name": "iPhone 17e", "tagline": "Hiệu năng quen thuộc, giá dễ chịu.", "price": 17990000, "compare_at_price": 18990000, "category_id": 2, "brand_id": 1, "option_label": "Dung lượng", "highlights": ["Chip A19", "Camera Fusion 48MP"], "specs": [{"label": "Màn hình", "value": "6,1 inch OLED"}, {"label": "Chip xử lý", "value": "A19"}], "in_the_box": "iPhone, cáp USB-C", "warranty": "Bảo hành chính hãng 12 tháng", "collections": ["student"], "is_new": True, "variants": [{"sku": "IP17E-128-BLK", "configuration": "128GB", "color": "Đen", "color_hex": "#1c1b18", "stock": 10}]}, test=save("adminProductId", "json.data.id")),
        e("GET", "/api/admin/products/{{adminProductId}}", "Chi tiết sản phẩm", "", auth="admin"),
        e("PUT", "/api/admin/products/{{adminProductId}}", "Cập nhật sản phẩm", "", auth="admin", body={"name": "iPhone 17e", "price": 16990000, "tagline": "Giá tốt hơn cho người dùng mới."}),
        e("PATCH", "/api/admin/products/{{adminProductId}}/status", "Đổi trạng thái", "active, hidden, discontinued.", auth="admin", body={"status": "hidden"}),
        e("POST", "/api/admin/products/{{adminProductId}}/thumbnail", "Tải ảnh đại diện", "", auth="admin", form=IMAGE),
        e("POST", "/api/admin/products/{{adminProductId}}/images", "Thêm ảnh chi tiết", "", auth="admin", form=IMAGE),
        e("DELETE", "/api/admin/products/{{adminProductId}}/images/1", "Xóa ảnh chi tiết", "", auth="admin"),
        e("DELETE", "/api/admin/products/{{adminProductId}}", "Xóa sản phẩm", "Từ chối (409) nếu sản phẩm đã có trong đơn hàng.", auth="admin"),
        e("POST", "/api/admin/products/{{adminProductId}}/variants", "Thêm phiên bản (cấu hình × màu)", "", auth="admin", body={"sku": "IP17E-256-BLK", "configuration": "256GB", "color": "Đen", "color_hex": "#1c1b18", "price": 19990000, "stock": 5}, test=save("variantAdminId", "json.data.id")),
        e("PUT", "/api/admin/variants/{{variantAdminId}}", "Sửa phiên bản", "", auth="admin", body={"price": 18990000, "is_active": True}),
        e("POST", "/api/admin/variants/{{variantAdminId}}/image", "Tải ảnh phiên bản", "", auth="admin", form=IMAGE),
        e("DELETE", "/api/admin/variants/{{variantAdminId}}", "Xóa phiên bản", "Từ chối (409) nếu đã có trong đơn hàng.", auth="admin"),
        e("GET", "/api/admin/inventory?q=&stock_status=low&per_page=20", "Tồn kho", "stock_status: low hoặc out.", auth="admin"),
        e("PATCH", "/api/admin/inventory/{{variantAdminId}}", "Cập nhật tồn kho", "Tồn kho không được âm.", auth="admin", body={"stock": 25}),
    ]),
    ("12. Quản trị: danh mục, thương hiệu, nội dung", [
        e("GET", "/api/admin/categories?q=&parent_id=", "Danh sách danh mục", "", auth="admin"),
        e("POST", "/api/admin/categories", "Tạo danh mục", "Chỉ hai cấp cha - con.", auth="admin", body={"name": "Máy tính bảng cũ", "sort_order": 9}, test=save("categoryId", "json.data.id")),
        e("GET", "/api/admin/categories/{{categoryId}}", "Chi tiết danh mục", "", auth="admin"),
        e("PUT", "/api/admin/categories/{{categoryId}}", "Sửa danh mục", "", auth="admin", body={"is_active": True}),
        e("POST", "/api/admin/categories/{{categoryId}}/image", "Tải ảnh danh mục", "", auth="admin", form=IMAGE),
        e("DELETE", "/api/admin/categories/{{categoryId}}", "Xóa danh mục", "Từ chối (409) nếu còn sản phẩm hoặc danh mục con.", auth="admin"),
        e("GET", "/api/admin/brands?q=", "Danh sách thương hiệu", "", auth="admin"),
        e("POST", "/api/admin/brands", "Tạo thương hiệu", "", auth="admin", body={"name": "Nomad"}, test=save("brandId", "json.data.id")),
        e("GET", "/api/admin/brands/{{brandId}}", "Chi tiết thương hiệu", "", auth="admin"),
        e("PUT", "/api/admin/brands/{{brandId}}", "Sửa thương hiệu", "", auth="admin", body={"description": "Phụ kiện sạc và bảo vệ thiết bị"}),
        e("POST", "/api/admin/brands/{{brandId}}/image", "Tải ảnh thương hiệu", "", auth="admin", form=IMAGE),
        e("DELETE", "/api/admin/brands/{{brandId}}", "Xóa thương hiệu", "Từ chối (409) nếu còn sản phẩm.", auth="admin"),
        e("GET", "/api/admin/banners", "Danh sách banner", "", auth="admin"),
        e("POST", "/api/admin/banners", "Tạo banner", "", auth="admin", body={"title": "Bộ sưu tập thu", "link": "/products", "sort_order": 1}, test=save("bannerId", "json.data.id")),
        e("GET", "/api/admin/banners/{{bannerId}}", "Chi tiết banner", "", auth="admin"),
        e("PUT", "/api/admin/banners/{{bannerId}}", "Sửa banner", "", auth="admin", body={"is_active": True}),
        e("POST", "/api/admin/banners/{{bannerId}}/image", "Tải ảnh banner", "", auth="admin", form=IMAGE),
        e("DELETE", "/api/admin/banners/{{bannerId}}", "Xóa banner", "", auth="admin"),
        e("GET", "/api/admin/posts?q=", "Danh sách bài viết", "", auth="admin"),
        e("POST", "/api/admin/posts", "Tạo bài viết", "Bỏ trống slug thì tự tạo từ tiêu đề.", auth="admin", body={"title": "Gợi ý phối đồ mùa thu", "excerpt": "Ba cách phối dễ làm", "content": "Nội dung bài viết"}, test=save("postId", "json.data.id")),
        e("GET", "/api/admin/posts/{{postId}}", "Chi tiết bài viết", "", auth="admin"),
        e("PUT", "/api/admin/posts/{{postId}}", "Sửa bài viết", "", auth="admin", body={"is_published": True}),
        e("POST", "/api/admin/posts/{{postId}}/image", "Tải ảnh bài viết", "", auth="admin", form=IMAGE),
        e("DELETE", "/api/admin/posts/{{postId}}", "Xóa bài viết", "", auth="admin"),
        e("GET", "/api/admin/newsletter-subscribers?q=", "Danh sách đăng ký nhận tin", "", auth="admin"),
        e("DELETE", "/api/admin/newsletter-subscribers/1", "Xóa email nhận tin", "", auth="admin"),
        e("GET", "/api/admin/settings", "Xem cấu hình cửa hàng", "", auth="admin"),
        e("PUT", "/api/admin/settings", "Cập nhật cấu hình", "Liên hệ, giới thiệu, phí giao hàng, ngưỡng miễn phí, ngưỡng cảnh báo tồn kho.", auth="admin", body={"contact_phone": "0901 234 567", "shipping_fee": 30000, "free_shipping_threshold": 1000000, "low_stock_threshold": 5}),
        e("GET", "/api/admin/pages", "Danh sách trang nội dung", "", auth="admin"),
        e("GET", "/api/admin/pages/shipping-policy", "Xem trang nội dung", "", auth="admin"),
        e("PUT", "/api/admin/pages/shipping-policy", "Cập nhật trang nội dung", "", auth="admin", body={"title": "Chính sách giao hàng", "content": "Giao hàng trong 2-5 ngày.", "is_published": True}),
    ]),
    ("13. Quản trị: đơn hàng", [
        e("GET", "/api/admin/orders?q=&status=&payment_status=&from=&to=&per_page=15", "Danh sách đơn", "Tìm theo mã, khách; lọc theo ngày và trạng thái.", auth="admin", test=save("orderId", "json.data[0] && json.data[0].id")),
        e("GET", "/api/admin/orders/{{orderId}}", "Chi tiết đơn", "Kèm khách hàng, lịch sử và ghi chú nội bộ.", auth="admin"),
        e("PATCH", "/api/admin/orders/{{orderId}}/status", "Đổi trạng thái đơn", "pending → confirmed → shipping → completed; hủy cần lý do và hoàn tồn.", auth="admin", body={"status": "confirmed", "note": "Đã gọi xác nhận"}),
        e("PATCH", "/api/admin/orders/{{orderId}}/note", "Ghi chú nội bộ", "", auth="admin", body={"admin_note": "Khách VIP"}),
        e("PATCH", "/api/admin/orders/{{orderId}}/payment", "Ghi nhận đã thu tiền COD", "Khi đơn đang giao hoặc hoàn tất.", auth="admin"),
    ]),
    ("14. Quản trị: khách hàng, đánh giá, khuyến mãi, liên hệ", [
        e("GET", "/api/admin/users?q=&role=&is_active=", "Danh sách tài khoản", "Tìm theo tên, email, số điện thoại.", auth="admin", test=save("userId", "json.data[0] && json.data[0].id")),
        e("GET", "/api/admin/users/{{userId}}", "Hồ sơ khách và lịch sử mua", "", auth="admin"),
        e("PATCH", "/api/admin/users/{{userId}}/status", "Khóa / mở khóa tài khoản", "Khóa sẽ thu hồi mọi token.", auth="admin", body={"is_active": False}),
        e("PATCH", "/api/admin/users/{{userId}}/role", "Đổi vai trò", "user hoặc admin.", auth="admin", body={"role": "user"}),
        e("GET", "/api/admin/reviews?q=&rating=&is_visible=&product_id=", "Danh sách đánh giá", "", auth="admin", test=save("reviewAdminId", "json.data[0] && json.data[0].id")),
        e("PATCH", "/api/admin/reviews/{{reviewAdminId}}/visibility", "Ẩn / hiện đánh giá", "", auth="admin", body={"is_visible": False}),
        e("POST", "/api/admin/reviews/{{reviewAdminId}}/reply", "Trả lời đánh giá", "", auth="admin", body={"reply": "Cảm ơn bạn đã góp ý."}),
        e("GET", "/api/admin/coupons?q=&is_active=", "Danh sách mã giảm giá", "", auth="admin"),
        e("POST", "/api/admin/coupons", "Tạo mã giảm giá", "type: percent hoặc fixed.", auth="admin", body={"code": "THU2026", "description": "Giảm mùa thu", "type": "percent", "value": 15, "min_order_amount": 500000, "max_discount": 100000, "usage_limit": 50, "expires_at": "2026-12-31"}, test=save("couponId", "json.data.id")),
        e("GET", "/api/admin/coupons/{{couponId}}", "Chi tiết mã giảm giá", "", auth="admin"),
        e("PUT", "/api/admin/coupons/{{couponId}}", "Sửa / bật tắt mã", "", auth="admin", body={"is_active": False}),
        e("DELETE", "/api/admin/coupons/{{couponId}}", "Xóa mã giảm giá", "Từ chối (409) nếu đã được dùng.", auth="admin"),
        e("GET", "/api/admin/contact-requests?q=&status=", "Danh sách yêu cầu liên hệ", "", auth="admin", test=save("contactId", "json.data[0] && json.data[0].id")),
        e("GET", "/api/admin/contact-requests/{{contactId}}", "Chi tiết yêu cầu liên hệ", "", auth="admin"),
        e("PATCH", "/api/admin/contact-requests/{{contactId}}", "Cập nhật yêu cầu liên hệ", "status: new, processing, resolved.", auth="admin", body={"status": "resolved", "admin_note": "Đã gọi lại khách"}),
    ]),
]


def build_item(entry):
    raw_path = entry["path"]
    path, _, query = raw_path.partition("?")
    headers = [{"key": "Accept", "value": "application/json"}]
    request = {
        "method": entry["method"],
        "header": headers,
        "description": entry["desc"],
        "url": {
            "raw": "{{baseUrl}}" + raw_path,
            "host": ["{{baseUrl}}"],
            "path": [part for part in path.split("/") if part],
        },
    }
    if query:
        request["url"]["query"] = [{"key": pair.split("=")[0], "value": pair.split("=", 1)[1], "disabled": pair.split("=", 1)[1] == ""} for pair in query.split("&")]
    if entry["body"] is not None:
        headers.append({"key": "Content-Type", "value": "application/json"})
        request["body"] = {"mode": "raw", "raw": json.dumps(entry["body"], ensure_ascii=False, indent=2), "options": {"raw": {"language": "json"}}}
    if entry["form"]:
        request["body"] = {"mode": "formdata", "formdata": [{"key": "image", "type": "file", "src": []}]}
    if entry["auth"] != "none":
        variable = "{{adminToken}}" if entry["auth"] == "admin" else "{{token}}"
        request["auth"] = {"type": "bearer", "bearer": [{"key": "token", "value": variable, "type": "string"}]}
    item = {"name": entry["name"], "request": request}
    if entry["test"]:
        item["event"] = [{"listen": "test", "script": {"type": "text/javascript", "exec": entry["test"]}}]
    return item


def build_collection():
    return {
        "info": {
            "name": "Mela - Apple Store API",
            "description": "REST API của website bán sản phẩm Apple Mela (Laravel + Sanctum). Chạy Đăng nhập (khách) hoặc Đăng nhập (quản trị) trước để lưu token vào biến collection.",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        "variable": [{"key": key, "value": value} for key, value in [
            ("baseUrl", "http://localhost:8000"), ("token", ""), ("adminToken", ""), ("productId", "1"), ("variantId", "1"),
            ("itemId", "1"), ("addressId", "1"), ("orderCode", ""), ("orderId", "1"), ("reviewId", "1"), ("userId", "2"),
            ("adminProductId", "1"), ("variantAdminId", "1"), ("categoryId", "1"), ("brandId", "1"), ("bannerId", "1"),
            ("couponId", "1"), ("contactId", "1"), ("reviewAdminId", "1"),
        ]],
        "item": [{"name": folder, "item": [build_item(entry) for entry in entries]} for folder, entries in SPEC],
    }


def build_markdown():
    lines = ["# Danh sách API", "", "Tự sinh bởi `scripts/generate_api_docs.py`. Mọi phản hồi là JSON; lỗi có dạng `{\"message\": \"...\", \"data\": null}` (422 kèm `errors`).", "",
             "Xác thực: **Bearer token** (Laravel Sanctum) — cột *Quyền*: `Công khai`, `Khách` (đã đăng nhập), `Admin`.", ""]
    total = 0
    for folder, entries in SPEC:
        lines += [f"## {folder}", "", "| Method | Endpoint | Quyền | Mô tả |", "|---|---|---|---|"]
        for entry in entries:
            right = {"none": "Công khai", "user": "Khách", "admin": "Admin"}[entry["auth"]]
            path = entry["path"].split("?")[0]
            lines.append(f"| `{entry['method']}` | `{path}` | {right} | {entry['name']}. {entry['desc']} |")
            total += 1
        lines.append("")
    lines.insert(2, f"Tổng cộng **{total}** endpoint được ghi lại.")
    lines.insert(3, "")
    return "\n".join(lines)


def main():
    collection_path = os.path.join(ROOT, "docs", "postman", "MelaStore.postman_collection.json")
    with io.open(collection_path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(build_collection(), f, ensure_ascii=False, indent=2)
    with io.open(os.path.join(ROOT, "docs", "api-endpoints.md"), "w", encoding="utf-8", newline="\n") as f:
        f.write(build_markdown() + "\n")
    print("Generated", collection_path)


if __name__ == "__main__":
    main()
