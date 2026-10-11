<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductVariantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'sku' => strtoupper(fake()->unique()->bothify('SKU-????-####')),
            'configuration' => fake()->randomElement(['128GB', '256GB', '512GB', '1TB']),
            'color' => fake()->randomElement(['Titan Tự Nhiên', 'Xanh Dương', 'Bạc']),
            'stock' => 10,
            'is_active' => true,
        ];
    }
}
