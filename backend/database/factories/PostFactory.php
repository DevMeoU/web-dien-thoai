<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PostFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->unique()->sentence(5),
            'slug' => fake()->unique()->slug(4),
            'excerpt' => fake()->sentence(12),
            'content' => fake()->paragraphs(3, true),
            'is_published' => true,
            'published_at' => now()->subDay(),
        ];
    }
}
