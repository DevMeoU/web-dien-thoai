<?php

namespace Tests\Feature;

use App\Models\Coupon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesShopData;
use Tests\TestCase;

class AdminCouponTest extends TestCase
{
    use CreatesShopData, RefreshDatabase;

    public function test_admin_can_create_update_toggle_and_search_coupons(): void
    {
        $this->actingAsAdmin();

        $id = $this->postJson('/api/admin/coupons', [
            'code' => 'thu2026', 'description' => 'Giảm mùa thu', 'type' => 'percent', 'value' => 15,
            'min_order_amount' => 500000, 'max_discount' => 100000, 'usage_limit' => 50,
            'starts_at' => now()->toDateString(), 'expires_at' => now()->addMonth()->toDateString(),
        ])->assertCreated()->assertJsonPath('data.code', 'THU2026')->assertJsonPath('data.used_count', 0)->json('data.id');

        $this->putJson("/api/admin/coupons/{$id}", ['is_active' => false])->assertOk()->assertJsonPath('data.is_active', false);
        $this->getJson('/api/admin/coupons?q=thu')->assertJsonCount(1, 'data');
        $this->getJson('/api/admin/coupons?is_active=false')->assertJsonCount(1, 'data');
        $this->getJson('/api/admin/coupons?is_active=true')->assertJsonCount(0, 'data');
    }

    public function test_expiry_date_without_time_lasts_until_the_end_of_that_day(): void
    {
        $this->actingAsAdmin();
        $today = now()->toDateString();

        $this->postJson('/api/admin/coupons', ['code' => 'TODAY', 'type' => 'fixed', 'value' => 10000, 'expires_at' => $today])->assertCreated();
        $this->assertTrue(Coupon::query()->where('code', 'TODAY')->first()->expires_at->isSameDay(now()));

        // Mã hết hạn hôm nay vẫn dùng được trong ngày.
        $this->actingAsCustomer();
        $this->postJson('/api/coupons/validate', ['code' => 'TODAY', 'subtotal' => 100000])->assertOk()->assertJsonPath('data.discount_amount', 10000);
    }

    public function test_coupon_validation_rules(): void
    {
        $this->actingAsAdmin();
        Coupon::factory()->create(['code' => 'EXISTS']);

        $this->postJson('/api/admin/coupons', [])->assertUnprocessable()->assertJsonValidationErrors(['code', 'type', 'value']);
        $this->postJson('/api/admin/coupons', ['code' => 'EXISTS', 'type' => 'fixed', 'value' => 1000])->assertUnprocessable()->assertJsonValidationErrors('code');
        $this->postJson('/api/admin/coupons', ['code' => 'OVER', 'type' => 'percent', 'value' => 150])->assertUnprocessable()->assertJsonValidationErrors('value');
        $this->postJson('/api/admin/coupons', ['code' => 'ZERO', 'type' => 'fixed', 'value' => 0])->assertUnprocessable()->assertJsonValidationErrors('value');
        $this->postJson('/api/admin/coupons', ['code' => 'BAD', 'type' => 'weird', 'value' => 5])->assertUnprocessable()->assertJsonValidationErrors('type');
        $this->postJson('/api/admin/coupons', ['code' => 'DATE', 'type' => 'fixed', 'value' => 5, 'starts_at' => '2026-12-01', 'expires_at' => '2026-11-01'])
            ->assertUnprocessable()->assertJsonValidationErrors('expires_at');
    }

    public function test_used_coupon_cannot_be_deleted_but_unused_can(): void
    {
        $this->actingAsAdmin();
        $used = Coupon::factory()->create(['used_count' => 3]);
        $unused = Coupon::factory()->create();

        $this->deleteJson("/api/admin/coupons/{$used->id}")->assertStatus(409);
        $this->deleteJson("/api/admin/coupons/{$unused->id}")->assertOk();
        $this->assertDatabaseHas('coupons', ['id' => $used->id]);
        $this->assertDatabaseMissing('coupons', ['id' => $unused->id]);
    }

    public function test_coupon_management_requires_admin(): void
    {
        $this->actingAsCustomer();
        $this->getJson('/api/admin/coupons')->assertForbidden();
        $this->postJson('/api/admin/coupons', ['code' => 'X', 'type' => 'fixed', 'value' => 1])->assertForbidden();
    }

    public function test_customers_can_check_a_coupon_against_a_subtotal(): void
    {
        $this->actingAsCustomer();
        Coupon::factory()->create(['code' => 'SAVE', 'value' => 20, 'min_order_amount' => 100000]);

        $this->postJson('/api/coupons/validate', ['code' => 'SAVE', 'subtotal' => 200000])->assertOk()->assertJsonPath('data.discount_amount', 40000);
        $this->postJson('/api/coupons/validate', ['code' => 'SAVE', 'subtotal' => 50000])->assertUnprocessable();
    }
}
