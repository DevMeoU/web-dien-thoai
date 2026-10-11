<?php

namespace Database\Seeders;

use App\Interfaces\SettingRepositoryInterface;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(SettingRepositoryInterface $settings): void
    {
        $settings->setMany([
            'store_name' => 'Mela',
            'contact_email' => 'support@mela.vn',
            'contact_phone' => '0901 234 567',
            'contact_address' => '12 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
            'about_content' => 'Mela là cửa hàng chuyên các sản phẩm Apple: iPhone, MacBook, iPad, Apple Watch, AirPods và phụ kiện. Chúng tôi chọn lọc kỹ lưỡng, tư vấn đúng nhu cầu và đồng hành cùng bạn từ lúc chọn máy đến khi bảo hành.',
            'shipping_fee' => 30000,
            'free_shipping_threshold' => 2000000,
            'low_stock_threshold' => 5,
        ]);
    }
}
