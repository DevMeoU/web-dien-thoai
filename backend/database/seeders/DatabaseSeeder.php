<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /** Dữ liệu cốt lõi luôn được nạp; dữ liệu mẫu (khách, đơn hàng, đánh giá) chỉ nạp ngoài môi trường production. */
    public function run(): void
    {
        $this->call([
            SettingSeeder::class,
            ContentPageSeeder::class,
            CatalogSeeder::class,
            MarketingSeeder::class,
            PostSeeder::class,
            UserSeeder::class,
        ]);

        if (! app()->environment('production')) {
            $this->call(DemoDataSeeder::class);
        }
    }
}
