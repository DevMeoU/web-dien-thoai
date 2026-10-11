<?php

namespace Database\Factories;

use App\Models\ContactRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContactRequestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => '09'.fake()->numerify('########'),
            'message' => fake()->sentence(),
            'status' => ContactRequest::STATUS_NEW,
        ];
    }
}
