<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\CreatesShopData;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use CreatesShopData, RefreshDatabase;

    public function test_customer_can_view_and_update_profile_but_not_email_or_role(): void
    {
        $user = $this->actingAsCustomer(User::factory()->create(['email' => 'lan@example.com', 'name' => 'Cũ']));

        $this->putJson('/api/profile', ['name' => 'Lan Anh', 'phone' => '0912 345 678', 'email' => 'hack@example.com', 'role' => 'admin'])
            ->assertOk()->assertJsonPath('data.name', 'Lan Anh')->assertJsonPath('data.phone', '0912345678')->assertJsonPath('data.email', 'lan@example.com');

        $this->assertSame('user', $user->fresh()->role);
        $this->getJson('/api/profile')->assertOk()->assertJsonPath('data.name', 'Lan Anh');
        $this->putJson('/api/profile', ['phone' => 'abc'])->assertUnprocessable()->assertJsonValidationErrors('phone');
        $this->putJson('/api/profile', ['name' => ''])->assertUnprocessable()->assertJsonValidationErrors('name');
    }

    public function test_password_change_requires_current_password_and_confirmation(): void
    {
        $user = User::factory()->create(['email' => 'lan@example.com', 'password' => 'oldsecret1']);
        $token = $this->postJson('/api/auth/login', ['email' => 'lan@example.com', 'password' => 'oldsecret1'])->json('data.token');
        $otherDevice = $user->createToken('phone');

        $this->withToken($token)->putJson('/api/profile/password', ['current_password' => 'nope', 'password' => 'newsecret1', 'password_confirmation' => 'newsecret1'])
            ->assertUnprocessable()->assertJsonValidationErrors('current_password');
        $this->withToken($token)->putJson('/api/profile/password', ['current_password' => 'oldsecret1', 'password' => 'newsecret1', 'password_confirmation' => 'different'])
            ->assertUnprocessable()->assertJsonValidationErrors('password');
        $this->withToken($token)->putJson('/api/profile/password', ['current_password' => 'oldsecret1', 'password' => 'oldsecret1', 'password_confirmation' => 'oldsecret1'])
            ->assertUnprocessable()->assertJsonValidationErrors('password');

        $this->withToken($token)->putJson('/api/profile/password', ['current_password' => 'oldsecret1', 'password' => 'newsecret1', 'password_confirmation' => 'newsecret1'])->assertOk();

        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $otherDevice->accessToken->id]);
        $this->assertDatabaseCount('personal_access_tokens', 1);
        $this->postJson('/api/auth/login', ['email' => 'lan@example.com', 'password' => 'oldsecret1'])->assertUnauthorized();
        $this->postJson('/api/auth/login', ['email' => 'lan@example.com', 'password' => 'newsecret1'])->assertOk();
    }

    public function test_avatar_upload_accepts_images_only(): void
    {
        Storage::fake('public');
        $this->actingAsCustomer();

        $this->postJson('/api/profile/avatar', ['image' => UploadedFile::fake()->image('me.png')])
            ->assertOk()->assertJsonStructure(['data' => ['avatar_url']]);
        Storage::disk('public')->assertExists(User::query()->first()->avatar);
        $this->postJson('/api/profile/avatar', ['image' => UploadedFile::fake()->create('cv.pdf', 5, 'application/pdf')])->assertUnprocessable();
    }
}
