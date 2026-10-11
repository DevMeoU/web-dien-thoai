<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesShopData;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use CreatesShopData, RefreshDatabase;

    public function test_admin_can_search_filter_and_view_customers_without_passwords(): void
    {
        $this->actingAsAdmin();
        $lan = User::factory()->create(['name' => 'Lan Anh', 'email' => 'lan@example.com', 'phone' => '0911111111']);
        User::factory()->create(['name' => 'Minh', 'email' => 'minh@example.com']);
        User::factory()->inactive()->create();

        $this->getJson('/api/admin/users?q=lan')->assertJsonCount(1, 'data')->assertJsonMissingPath('data.0.password');
        $this->getJson('/api/admin/users?q=0911111111')->assertJsonCount(1, 'data');
        $this->getJson('/api/admin/users?role=admin')->assertJsonCount(1, 'data');
        $this->getJson('/api/admin/users?is_active=false')->assertJsonCount(1, 'data');
        $this->getJson("/api/admin/users/{$lan->id}")->assertOk()->assertJsonPath('data.user.email', 'lan@example.com')->assertJsonMissingPath('data.user.password');
    }

    public function test_user_detail_includes_purchase_history(): void
    {
        $customer = $this->actingAsCustomer();
        $this->addToCart($this->makeVariant(5), 1);
        $this->placeOrder();
        $this->actingAsAdmin();

        $this->getJson("/api/admin/users/{$customer->id}")->assertOk()
            ->assertJsonPath('data.user.orders_count', 1)->assertJsonCount(1, 'data.recent_orders');
    }

    public function test_locking_an_account_revokes_tokens_and_blocks_login(): void
    {
        $customer = User::factory()->create(['email' => 'lan@example.com', 'password' => 'secret123']);
        $this->postJson('/api/auth/login', ['email' => 'lan@example.com', 'password' => 'secret123'])->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 1);
        $this->actingAsAdmin();

        $this->patchJson("/api/admin/users/{$customer->id}/status", ['is_active' => false])->assertOk()->assertJsonPath('data.is_active', false);
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->postJson('/api/auth/login', ['email' => 'lan@example.com', 'password' => 'secret123'])->assertForbidden();

        $this->patchJson("/api/admin/users/{$customer->id}/status", ['is_active' => true])->assertOk();
        $this->postJson('/api/auth/login', ['email' => 'lan@example.com', 'password' => 'secret123'])->assertOk();
    }

    public function test_admin_cannot_lock_or_demote_themselves_or_the_last_admin(): void
    {
        $admin = $this->actingAsAdmin();
        $this->patchJson("/api/admin/users/{$admin->id}/status", ['is_active' => false])->assertUnprocessable();
        $this->patchJson("/api/admin/users/{$admin->id}/role", ['role' => 'user'])->assertUnprocessable();

        $other = User::factory()->admin()->create();
        $this->patchJson("/api/admin/users/{$other->id}/role", ['role' => 'user'])->assertOk()->assertJsonPath('data.role', 'user');
    }

    public function test_the_last_remaining_admin_is_protected_from_other_admins(): void
    {
        $first = User::factory()->admin()->create();
        $second = User::factory()->admin()->create();
        $this->actingAsCustomer($first);

        $this->patchJson("/api/admin/users/{$second->id}/role", ['role' => 'user'])->assertOk();
        $newAdmin = User::factory()->admin()->create();
        $this->actingAsCustomer($newAdmin);
        $this->patchJson("/api/admin/users/{$first->id}/role", ['role' => 'user'])->assertOk();
        $this->patchJson("/api/admin/users/{$newAdmin->id}/role", ['role' => 'user'])->assertUnprocessable();
    }

    public function test_role_must_be_valid_and_customers_cannot_manage_users(): void
    {
        $customer = $this->actingAsCustomer();
        $this->getJson('/api/admin/users')->assertForbidden();
        $this->patchJson("/api/admin/users/{$customer->id}/role", ['role' => 'admin'])->assertForbidden();

        $this->actingAsAdmin();
        $this->patchJson("/api/admin/users/{$customer->id}/role", ['role' => 'superuser'])->assertUnprocessable();
        $this->patchJson("/api/admin/users/{$customer->id}/role", ['role' => 'admin'])->assertOk()->assertJsonPath('data.role', 'admin');
    }
}
