<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'slug' => fake()->unique()->slug(),
            'description' => fake()->sentence(),
            'price' => fake()->numberBetween(100000, 1000000),
            'status' => Product::STATUS_ACTIVE,
        ];
    }

    public function hidden(): static
    {
        return $this->state(['status' => Product::STATUS_HIDDEN]);
    }

    public function discontinued(): static
    {
        return $this->state(['status' => Product::STATUS_DISCONTINUED]);
    }
}
