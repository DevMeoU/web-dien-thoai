<?php

namespace Database\Seeders;

use App\Models\ContentPage;
use Illuminate\Database\Seeder;

class ContentPageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            'about' => ['Giới thiệu', "Mela ra đời với mong muốn mang sản phẩm Apple chính hãng đến gần hơn với mọi người, kèm sự tư vấn trung thực và dịch vụ hậu mãi chu đáo.\n\nChúng tôi chỉ bán hàng chính hãng, nguyên seal, đầy đủ hóa đơn và bảo hành. Mỗi sản phẩm đều được kiểm tra trước khi giao để bạn yên tâm từ lần mở hộp đầu tiên."],
            'shopping-guide' => ['Hướng dẫn mua hàng', "1. Chọn sản phẩm, dung lượng hoặc cấu hình và màu sắc rồi thêm vào giỏ hàng.\n2. Đăng nhập hoặc đăng ký tài khoản để tiếp tục.\n3. Vào giỏ hàng, kiểm tra số lượng và nhập mã giảm giá nếu có.\n4. Chọn địa chỉ nhận hàng và xác nhận đặt hàng (thanh toán khi nhận hàng).\n5. Theo dõi trạng thái đơn tại mục Đơn hàng của tôi."],
            'shipping-policy' => ['Chính sách giao hàng', "Đơn hàng được xử lý trong 24 giờ làm việc và giao trong 1–4 ngày tùy khu vực. Sản phẩm được đóng gói chống sốc và niêm phong.\n\nPhí giao hàng cố định theo cấu hình của cửa hàng; đơn đạt giá trị tối thiểu được miễn phí giao hàng. Bạn được kiểm tra ngoại quan sản phẩm khi nhận và thanh toán tiền mặt cho nhân viên giao hàng."],
            'return-policy' => ['Chính sách đổi trả', "Sản phẩm lỗi do nhà sản xuất được đổi mới trong 30 ngày kể từ ngày nhận hàng, với điều kiện còn đủ hộp, phụ kiện và không có dấu hiệu rơi vỡ, vào nước hay can thiệp phần cứng.\n\nVui lòng gửi yêu cầu qua trang Liên hệ kèm mã đơn hàng để được hỗ trợ nhanh nhất. Chúng tôi hoàn tiền trong 3–5 ngày làm việc sau khi nhận lại và kiểm tra sản phẩm."],
            'warranty-policy' => ['Chính sách bảo hành', "Tất cả sản phẩm Apple chính hãng được bảo hành 12 tháng theo chính sách của nhà sản xuất tại các trung tâm bảo hành ủy quyền. Phụ kiện của hãng khác bảo hành theo thời hạn ghi trên trang sản phẩm.\n\nBảo hành không áp dụng với hư hỏng do rơi vỡ, vào nước, tự ý sửa chữa hoặc sử dụng sai hướng dẫn. Hãy giữ hóa đơn và hộp sản phẩm; bạn có thể gửi yêu cầu hỗ trợ qua trang Liên hệ kèm mã đơn hàng."],
            'privacy-policy' => ['Chính sách bảo mật', "Chúng tôi chỉ thu thập thông tin cần thiết để xử lý đơn hàng và chăm sóc khách hàng: họ tên, email, số điện thoại và địa chỉ nhận hàng.\n\nThông tin không được chia sẻ cho bên thứ ba ngoài đơn vị vận chuyển. Mật khẩu được mã hóa và bạn có thể yêu cầu chỉnh sửa hoặc xóa dữ liệu bất cứ lúc nào."],
        ];

        foreach ($pages as $slug => [$title, $content]) {
            ContentPage::query()->updateOrCreate(['slug' => $slug], ['title' => $title, 'content' => $content, 'is_published' => true]);
        }
    }
}
