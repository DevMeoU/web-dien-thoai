<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesShopData;
use Tests\TestCase;

class OrderFlowTest extends TestCase
{
    use CreatesShopData, RefreshDatabase;

    public function test_checkout_preview_applies_shipping_fee_below_threshold_and_free_shipping_above(): void
    {
        $this->actingAsCustomer();
        $variant = $this->makeVariant(10, 400000);
        $this->addToCart($variant, 1);

        $this->postJson('/api/checkout/preview')->assertOk()
            ->assertJsonPath('data.subtotal', 400000)->assertJsonPath('data.shipping_fee', 30000)->assertJsonPath('data.total', 430000);

        $this->addToCart($variant, 2);
        $this->postJson('/api/checkout/preview')->assertJsonPath('data.subtotal', 1200000)->assertJsonPath('data.shipping_fee', 0)->assertJsonPath('data.total', 1200000);
    }

    public function test_placing_an_order_snapshots_data_reduces_stock_clears_cart_and_logs_history(): void
    {
        $user = $this->actingAsCustomer();
        $variant = $this->makeVariant(10, 200000, ['name' => 'Áo len'], ['configuration' => '256GB', 'color' => 'Xám']);
        $this->addToCart($variant, 3);

        $response = $this->postJson('/api/orders', ['address' => $this->addressPayload(), 'note' => 'Giao giờ hành chính'])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending')->assertJsonPath('data.payment_method', 'cod')->assertJsonPath('data.payment_status', 'unpaid')
            ->assertJsonPath('data.subtotal', '600000.00')->assertJsonPath('data.shipping_fee', '30000.00')->assertJsonPath('data.total', '630000.00')
            ->assertJsonPath('data.items.0.product_name', 'Áo len')->assertJsonPath('data.items.0.quantity', 3)->assertJsonPath('data.items.0.line_total', '600000.00')
            ->assertJsonPath('data.recipient.name', 'Nguyễn Văn A')->assertJsonPath('data.shipping_address.city', 'TP. Hồ Chí Minh')
            ->assertJsonPath('data.histories.0.to_status', 'pending')->assertJsonPath('data.can_cancel', true);

        $this->assertStringStartsWith('MLA', $response->json('data.code'));
        $this->assertSame(7, $variant->fresh()->stock);
        $this->getJson('/api/cart')->assertJsonCount(0, 'data.items');
        $this->assertSame(1, $user->orders()->count());
    }

    public function test_price_and_address_in_an_order_do_not_change_when_catalog_or_address_book_changes(): void
    {
        $user = $this->actingAsCustomer();
        $variant = $this->makeVariant(5, 200000, ['name' => 'Áo cũ']);
        $address = Address::factory()->create(['user_id' => $user->id, 'line' => 'Địa chỉ cũ']);
        $this->addToCart($variant, 1);
        $code = $this->postJson('/api/orders', ['address_id' => $address->id])->assertCreated()->json('data.code');

        $variant->product->update(['price' => 999999, 'name' => 'Áo mới']);
        $address->update(['line' => 'Địa chỉ mới']);

        $this->getJson("/api/orders/{$code}")->assertOk()
            ->assertJsonPath('data.items.0.unit_price', '200000.00')->assertJsonPath('data.items.0.product_name', 'Áo cũ')
            ->assertJsonPath('data.shipping_address.line', 'Địa chỉ cũ');
    }

    public function test_order_fails_without_changing_anything_when_stock_is_insufficient(): void
    {
        $user = $this->actingAsCustomer();
        $ok = $this->makeVariant(5);
        $short = $this->makeVariant(5);
        $this->addToCart($ok, 2);
        $this->addToCart($short, 4);
        $short->update(['stock' => 1]);

        $this->postJson('/api/orders', ['address' => $this->addressPayload()])
            ->assertUnprocessable()->assertJsonStructure(['message', 'errors' => ['items']]);

        $this->assertSame(0, $user->orders()->count());
        $this->assertSame(5, $ok->fresh()->stock);
        $this->assertSame(1, $short->fresh()->stock);
        $this->getJson('/api/cart')->assertJsonCount(2, 'data.items');
    }

    public function test_empty_cart_and_invalid_address_are_rejected(): void
    {
        $user = $this->actingAsCustomer();
        $this->postJson('/api/orders', ['address' => $this->addressPayload()])->assertUnprocessable()->assertJsonPath('message', 'Giỏ hàng đang trống.');

        $this->addToCart($this->makeVariant(5), 1);
        $this->postJson('/api/orders', [])->assertUnprocessable()->assertJsonValidationErrors('address');
        $this->postJson('/api/orders', ['address' => $this->addressPayload(['phone' => 'abc'])])->assertUnprocessable()->assertJsonValidationErrors('address.phone');

        $stranger = Address::factory()->create();
        $this->postJson('/api/orders', ['address_id' => $stranger->id])->assertUnprocessable();
        $this->assertSame(0, $user->orders()->count());
    }

    public function test_save_address_option_adds_it_to_the_address_book(): void
    {
        $user = $this->actingAsCustomer();
        $this->addToCart($this->makeVariant(5), 1);
        $this->placeOrder(['save_address' => true]);

        $this->assertSame(1, $user->addresses()->count());
        $this->assertTrue($user->addresses()->first()->is_default);
    }

    public function test_coupon_discount_is_applied_and_usage_is_counted(): void
    {
        $this->actingAsCustomer();
        $coupon = Coupon::factory()->create(['code' => 'SALE10', 'value' => 10, 'max_discount' => 50000, 'usage_limit' => 5]);
        $this->addToCart($this->makeVariant(5, 1000000), 1);

        $this->postJson('/api/checkout/preview', ['coupon_code' => 'sale10'])->assertOk()
            ->assertJsonPath('data.discount_amount', 50000)->assertJsonPath('data.total', 950000);
        $this->postJson('/api/orders', ['address' => $this->addressPayload(), 'coupon_code' => 'SALE10'])->assertCreated()
            ->assertJsonPath('data.discount_amount', '50000.00')->assertJsonPath('data.coupon_code', 'SALE10')->assertJsonPath('data.total', '950000.00');

        $this->assertSame(1, $coupon->fresh()->used_count);
    }

    public function test_invalid_coupons_are_rejected_with_a_reason(): void
    {
        $this->actingAsCustomer();
        $this->addToCart($this->makeVariant(5, 100000), 1);
        $expired = Coupon::factory()->create(['code' => 'OLD', 'expires_at' => now()->subDay()]);
        Coupon::factory()->create(['code' => 'SOON', 'starts_at' => now()->addDay()]);
        Coupon::factory()->create(['code' => 'OFF', 'is_active' => false]);
        Coupon::factory()->create(['code' => 'USED', 'usage_limit' => 1, 'used_count' => 1]);
        Coupon::factory()->create(['code' => 'BIG', 'min_order_amount' => 5000000]);

        $messages = [
            'NOPE' => 'không hợp lệ', 'OLD' => 'hết hạn', 'SOON' => 'chưa đến thời gian', 'OFF' => 'không hoạt động',
            'USED' => 'hết lượt', 'BIG' => 'giá trị tối thiểu',
        ];
        foreach ($messages as $code => $fragment) {
            $this->postJson('/api/checkout/preview', ['coupon_code' => $code])->assertUnprocessable();
            $this->assertStringContainsString($fragment, $this->postJson('/api/coupons/validate', ['code' => $code, 'subtotal' => 100000])->json('message'));
        }
        $this->postJson('/api/orders', ['address' => $this->addressPayload(), 'coupon_code' => 'OLD'])->assertUnprocessable();
        $this->assertSame(0, Order::query()->count());
        $this->assertSame(0, $expired->fresh()->used_count);
    }

    public function test_fixed_coupon_never_exceeds_subtotal(): void
    {
        $this->actingAsCustomer();
        Coupon::factory()->create(['code' => 'FIX', 'type' => Coupon::TYPE_FIXED, 'value' => 500000]);

        $this->postJson('/api/coupons/validate', ['code' => 'FIX', 'subtotal' => 120000])
            ->assertOk()->assertJsonPath('data.discount_amount', 120000);
    }

    public function test_customer_can_cancel_pending_order_with_reason_and_stock_and_coupon_are_restored(): void
    {
        $this->actingAsCustomer();
        $coupon = Coupon::factory()->create(['code' => 'SALE10']);
        $variant = $this->makeVariant(10, 100000);
        $this->addToCart($variant, 4);
        $code = $this->placeOrder(['coupon_code' => 'SALE10']);
        $this->assertSame(6, $variant->fresh()->stock);

        $this->postJson("/api/orders/{$code}/cancel", [])->assertUnprocessable()->assertJsonValidationErrors('reason');
        $this->postJson("/api/orders/{$code}/cancel", ['reason' => 'Đặt nhầm dung lượng'])
            ->assertOk()->assertJsonPath('data.status', 'cancelled')->assertJsonPath('data.cancel_reason', 'Đặt nhầm dung lượng')
            ->assertJsonPath('data.histories.1.to_status', 'cancelled');

        $this->assertSame(10, $variant->fresh()->stock);
        $this->assertSame(0, $coupon->fresh()->used_count);
        $this->postJson("/api/orders/{$code}/cancel", ['reason' => 'Lại hủy'])->assertUnprocessable();
    }

    public function test_confirmed_orders_cannot_be_cancelled_by_the_customer(): void
    {
        $this->actingAsCustomer();
        $this->addToCart($this->makeVariant(5), 1);
        $code = $this->placeOrder();
        Order::query()->where('code', $code)->update(['status' => 'confirmed']);

        $this->postJson("/api/orders/{$code}/cancel", ['reason' => 'Muộn rồi'])->assertUnprocessable();
    }

    public function test_order_history_supports_search_status_filter_and_pagination_and_is_private(): void
    {
        $user = $this->actingAsCustomer();
        $variant = $this->makeVariant(50, 100000);
        $codes = [];
        foreach (range(1, 3) as $ignored) {
            $this->addToCart($variant, 1);
            $codes[] = $this->placeOrder();
        }
        Order::query()->where('code', $codes[0])->update(['status' => 'completed']);

        $this->getJson('/api/orders')->assertOk()->assertJsonCount(3, 'data')->assertJsonPath('data.0.code', $codes[2]);
        $this->getJson('/api/orders?per_page=2')->assertJsonCount(2, 'data')->assertJsonPath('meta.total', 3);
        $this->getJson('/api/orders?status=completed')->assertJsonCount(1, 'data')->assertJsonPath('data.0.code', $codes[0]);
        $this->getJson('/api/orders?q='.$codes[1])->assertJsonCount(1, 'data');

        $this->actingAsCustomer(User::factory()->create());
        $this->getJson('/api/orders')->assertJsonCount(0, 'data');
        $this->getJson("/api/orders/{$codes[0]}")->assertNotFound();
        $this->postJson("/api/orders/{$codes[0]}/cancel", ['reason' => 'Thử xem'])->assertNotFound();
    }

    public function test_two_customers_cannot_buy_the_last_item_twice(): void
    {
        $variant = $this->makeVariant(1);
        $first = User::factory()->create();
        $second = User::factory()->create();

        $this->actingAsCustomer($first);
        $this->addToCart($variant, 1);
        $this->actingAsCustomer($second);
        $this->addToCart($variant, 1);

        $this->actingAsCustomer($first);
        $this->placeOrder();
        $this->actingAsCustomer($second);
        $this->postJson('/api/orders', ['address' => $this->addressPayload()])->assertUnprocessable();

        $this->assertSame(0, $variant->fresh()->stock);
        $this->assertSame(1, Order::query()->count());
    }
}
