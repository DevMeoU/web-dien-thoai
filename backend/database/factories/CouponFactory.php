<?php

namespace Database\Factories;

use App\Models\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;

class CouponFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->bothify('SALE??##')),
            'type' => Coupon::TYPE_PERCENT,
            'value' => 10,
            'min_order_amount' => 0,
            'is_active' => true,
        ];
    }
}
