<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private function registerPayload(array $overrides = []): array
    {
        return ['name' => 'Lan Anh', 'email' => 'lan@example.com', 'password' => 'secret123', 'password_confirmation' => 'secret123', ...$overrides];
    }

    public function test_user_can_register_and_gets_customer_role_with_token(): void
    {
        $this->postJson('/api/auth/register', $this->registerPayload(['role' => 'admin']))
            ->assertCreated()
            ->assertJsonPath('data.user.role', 'user')
            ->assertJsonPath('data.user.email', 'lan@example.com')
            ->assertJsonStructure(['data' => ['token']])
            ->assertJsonMissingPath('data.user.password');

        $this->assertDatabaseHas('users', ['email' => 'lan@example.com', 'role' => 'user', 'is_active' => true]);
    }

    public function test_register_validates_input_and_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'lan@example.com']);

        $this->postJson('/api/auth/register', $this->registerPayload())->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->postJson('/api/auth/register', $this->registerPayload(['email' => 'new@example.com', 'password_confirmation' => 'x']))
            ->assertUnprocessable()->assertJsonValidationErrors('password');
        $this->postJson('/api/auth/register', $this->registerPayload(['email' => 'new@example.com', 'phone' => '123']))
            ->assertUnprocessable()->assertJsonValidationErrors('phone');
    }

    public function test_login_returns_token_and_wrong_credentials_are_rejected(): void
    {
        User::factory()->create(['email' => 'lan@example.com', 'password' => 'secret123']);

        $this->postJson('/api/auth/login', ['email' => 'lan@example.com', 'password' => 'secret123'])
            ->assertOk()->assertJsonStructure(['data' => ['token', 'user' => ['id', 'role']]]);
        $this->postJson('/api/auth/login', ['email' => 'lan@example.com', 'password' => 'wrong'])->assertUnauthorized();
        $this->postJson('/api/auth/login', ['email' => 'nobody@example.com', 'password' => 'secret123'])->assertUnauthorized();
    }

    public function test_locked_account_cannot_login_or_use_existing_token(): void
    {
        $user = User::factory()->inactive()->create(['email' => 'lan@example.com', 'password' => 'secret123']);

        $this->postJson('/api/auth/login', ['email' => 'lan@example.com', 'password' => 'secret123'])->assertForbidden();

        Sanctum::actingAs($user);
        $this->getJson('/api/me')->assertForbidden();
    }

    public function test_token_authenticates_requests_and_logout_revokes_it(): void
    {
        User::factory()->create(['email' => 'lan@example.com', 'password' => 'secret123']);
        $token = $this->postJson('/api/auth/login', ['email' => 'lan@example.com', 'password' => 'secret123'])->json('data.token');

        $this->withToken($token)->getJson('/api/me')->assertOk()->assertJsonPath('data.email', 'lan@example.com');
        $this->withToken($token)->postJson('/api/auth/logout')->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);

        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/me')->assertUnauthorized();
    }

    public function test_protected_routes_require_authentication(): void
    {
        $this->getJson('/api/me')->assertUnauthorized()->assertJsonStructure(['message']);
        $this->getJson('/api/cart')->assertUnauthorized();
        $this->getJson('/api/orders')->assertUnauthorized();
    }

    public function test_forgot_password_does_not_reveal_whether_email_exists_and_sends_link(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'lan@example.com']);

        $existing = $this->postJson('/api/auth/forgot-password', ['email' => 'lan@example.com'])->assertOk()->json('message');
        $missing = $this->postJson('/api/auth/forgot-password', ['email' => 'nobody@example.com'])->assertOk()->json('message');

        $this->assertSame($existing, $missing);
        Notification::assertSentTo($user, ResetPassword::class);
        Notification::assertCount(1);
    }

    public function test_password_can_be_reset_with_valid_token_only(): void
    {
        $user = User::factory()->create(['email' => 'lan@example.com']);
        $user->createToken('web');
        $token = Password::createToken($user);
        $payload = ['email' => 'lan@example.com', 'token' => $token, 'password' => 'newsecret123', 'password_confirmation' => 'newsecret123'];

        $this->postJson('/api/auth/reset-password', [...$payload, 'token' => 'invalid'])->assertUnprocessable();
        $this->postJson('/api/auth/reset-password', $payload)->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->postJson('/api/auth/login', ['email' => 'lan@example.com', 'password' => 'newsecret123'])->assertOk();
    }
}
