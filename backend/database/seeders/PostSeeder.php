<?php

namespace Database\Seeders;

use App\Models\Post;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $posts = [
            [
                'iPhone 17 Pro Max hay iPhone 17: chọn máy nào cho bạn?',
                'So sánh nhanh hai dòng iPhone mới theo nhu cầu sử dụng và ngân sách.',
                "Cả hai đều dùng màn hình ProMotion 120Hz và camera 48MP, nhưng được thiết kế cho những nhóm người dùng khác nhau.\n\niPhone 17 Pro Max dành cho người cần hiệu năng liên tục: quay video dài, chỉnh ảnh, chơi game đồ họa nặng. Khung nhôm nguyên khối cùng buồng tản nhiệt giúp máy giữ hiệu năng ổn định, và hệ thống ba camera có thêm ống kính tele để zoom xa.\n\niPhone 17 phù hợp với phần lớn nhu cầu hằng ngày: nhắn tin, chụp ảnh, xem phim, làm việc. Bộ nhớ khởi điểm 256GB và nhiều màu sắc tươi sáng là điểm cộng.\n\nNếu bạn thường xuyên cần zoom xa và pin dùng cả ngày dài, hãy chọn Pro Max. Nếu ưu tiên giá và sự gọn nhẹ, iPhone 17 là lựa chọn hợp lý.",
                '/images/home/post-iphone.png', 5,
            ],
            [
                'MacBook Air M4 hay MacBook Pro M4: chọn theo nhu cầu',
                'Hai dòng MacBook đều dùng chip M4 nhưng khác nhau ở màn hình, cổng kết nối và khả năng duy trì hiệu năng.',
                "MacBook Air M4 mỏng nhẹ, không quạt và có pin dùng cả ngày. Đây là lựa chọn lý tưởng cho sinh viên, nhân viên văn phòng, người làm nội dung nhẹ nhàng.\n\nMacBook Pro 14 inch M4 có màn hình Liquid Retina XDR sáng và mượt hơn, nhiều cổng kết nối (Thunderbolt 4, HDMI, khe thẻ SDXC) và hệ thống tản nhiệt có quạt để giữ hiệu năng khi tải nặng như dựng video hay biên dịch dự án lớn.\n\nGợi ý nhanh: học tập, văn phòng chọn Air; dựng phim, thiết kế đồ họa, lập trình nặng chọn Pro. Dù chọn máy nào, hãy ưu tiên RAM 16GB trở lên để dùng bền theo thời gian.",
                '/images/home/post-macbook.png', 4,
            ],
            [
                'AirPods Pro 3 và AirPods 4: khác biệt ở đâu?',
                'Chống ồn, độ vừa tai và hộp sạc là ba điểm nên cân nhắc khi chọn tai nghe Apple.',
                "AirPods Pro 3 có nút tai silicone ôm kín ống tai nên chống ồn chủ động hiệu quả hơn, phù hợp khi đi tàu xe, làm việc ở nơi ồn ào. Hộp sạc hỗ trợ MagSafe và chuẩn chống nước, bụi cao hơn.\n\nAirPods 4 có thiết kế mở, đeo nhẹ và thoải mái trong thời gian dài. Phiên bản chống ồn chủ động bổ sung chế độ xuyên âm thích ứng với mức giá dễ tiếp cận hơn.\n\nNếu bạn cần cách âm tốt và hay di chuyển, chọn AirPods Pro 3. Nếu thích cảm giác thoáng, ít bị bí tai, AirPods 4 là lựa chọn đáng cân nhắc.",
                '/images/home/post-airpods.svg', 3,
            ],
            [
                'Chọn iPad cho sinh viên: iPad Air hay iPad (A16)?',
                'Gợi ý chọn máy tính bảng theo cách học, ghi chú và ngân sách của bạn.',
                "iPad (A16) có giá dễ chịu, đủ mạnh để ghi chú, đọc tài liệu, học trực tuyến và xem phim. Máy hỗ trợ Apple Pencil (USB-C), phù hợp khi bạn chỉ cần một thiết bị học tập cơ bản.\n\niPad Air M3 mạnh hơn, hỗ trợ Apple Pencil Pro và Magic Keyboard nên có thể thay thế laptop nhẹ cho nhiều tác vụ. Nếu bạn học thiết kế, vẽ minh họa hoặc cần đa nhiệm nhiều ứng dụng, đây là lựa chọn nên cân nhắc.\n\nDù chọn máy nào, đừng quên chọn dung lượng đủ rộng: 128GB là mức tối thiểu, 256GB sẽ thoải mái hơn nếu bạn lưu nhiều tài liệu và video bài giảng.",
                '/images/home/post-ipad.png', 2,
            ],
            [
                'Mẹo dùng Apple Watch theo dõi giấc ngủ và vận động',
                'Vài thiết lập đơn giản giúp Apple Watch trở thành người bạn đồng hành mỗi ngày.',
                "Hãy đeo đồng hồ vừa khít nhưng không siết, để cảm biến nhịp tim đọc chính xác. Bật chế độ Giấc ngủ trong ứng dụng Sức khỏe và đặt giờ đi ngủ cố định để theo dõi thói quen ổn định.\n\nSạc đồng hồ vào lúc bạn chuẩn bị đi tắm hoặc ăn sáng, nhờ khả năng sạc nhanh chỉ cần khoảng 30 phút để đầy phần lớn pin. Đặt mục tiêu vận động nhỏ và tăng dần: đứng dậy mỗi giờ, đi bộ 30 phút mỗi ngày.\n\nCác số liệu trên đồng hồ chỉ mang tính tham khảo, không thay thế tư vấn của bác sĩ.",
                '/images/home/post-watch.png', 1,
            ],
        ];

        foreach ($posts as [$title, $excerpt, $content, $image, $daysAgo]) {
            Post::query()->updateOrCreate(['slug' => Str::slug($title)], [
                'title' => $title, 'excerpt' => $excerpt, 'content' => $content, 'image' => $image,
                'is_published' => true, 'published_at' => now()->subDays($daysAgo),
            ]);
        }
    }
}
