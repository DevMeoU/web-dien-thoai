<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Coupon;
use Illuminate\Database\Seeder;

class MarketingSeeder extends Seeder
{
    public function run(): void
    {
        // position: hero là banner đầu trang chủ; collection là các thẻ nhu cầu (thẻ đầu tiên là thẻ lớn).
        $banners = [
            ['Sự tinh giản trong từng chi tiết', 'Khám phá iPhone 17 Pro Max', '/images/home/hero-wide.png', '/products/iphone-17-pro-max', 'hero', 1],
            ['Làm việc', 'MacBook cho mọi ý tưởng', '/images/home/collection-work.png', '/products?collection=work', 'collection', 1],
            ['Học tập', 'iPad và Apple Pencil cho lớp học', '/images/home/collection-student.png', '/products?collection=student', 'collection', 2],
            ['Sáng tạo', 'Âm thanh và hình ảnh trọn vẹn', '/images/home/collection-creative.png', '/products?collection=creative', 'collection', 3],
        ];
        foreach ($banners as [$title, $subtitle, $image, $link, $position, $order]) {
            Banner::query()->updateOrCreate(['title' => $title], ['subtitle' => $subtitle, 'image' => $image, 'link' => $link, 'position' => $position, 'sort_order' => $order, 'is_active' => true]);
        }

        $coupons = [
            ['MELA5', 'Giảm 5% cho đơn từ 5.000.000 ₫ (tối đa 2.000.000 ₫)', Coupon::TYPE_PERCENT, 5, 5000000, 2000000, 100, null, now()->addMonths(3)],
            ['WELCOME500K', 'Giảm 500.000 ₫ cho đơn đầu tiên từ 10.000.000 ₫', Coupon::TYPE_FIXED, 500000, 10000000, null, null, null, now()->addMonths(6)],
            ['HETHAN', 'Mã đã hết hạn (dùng để thử)', Coupon::TYPE_PERCENT, 10, 0, null, null, now()->subMonths(2), now()->subMonth()],
        ];
        foreach ($coupons as [$code, $description, $type, $value, $min, $max, $limit, $starts, $expires]) {
            Coupon::query()->updateOrCreate(['code' => $code], [
                'description' => $description, 'type' => $type, 'value' => $value, 'min_order_amount' => $min,
                'max_discount' => $max, 'usage_limit' => $limit, 'starts_at' => $starts, 'expires_at' => $expires, 'is_active' => true,
            ]);
        }
    }
}
