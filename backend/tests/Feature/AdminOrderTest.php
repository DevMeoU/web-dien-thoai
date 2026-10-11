<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesShopData;
use Tests\TestCase;

class AdminOrderTest extends TestCase
{
    use CreatesShopData, RefreshDatabase;

    /** Khách đặt một đơn rồi chuyển sang đăng nhập admin; trả về [mã đơn, id đơn, variant]. */
    private function customerOrder(int $quantity = 2): array
    {
        $customer = $this->actingAsCustomer();
        $variant = $this->makeVariant(10, 200000);
        $this->addToCart($variant, $quantity);
        $code = $this->placeOrder();
        $this->actingAsAdmin();

        return [$code, Order::query()->where('code', $code)->value('id'), $variant, $customer];
    }

    public function test_order_management_is_restricted_to_admins(): void
    {
        [$code, $id] = $this->customerOrder();

        $this->actingAsCustomer();
        $this->getJson('/api/admin/orders')->assertForbidden();
        $this->patchJson("/api/admin/orders/{$id}/status", ['status' => 'confirmed'])->assertForbidden();
        $this->assertSame('pending', Order::query()->where('code', $code)->first()->status->value);
    }

    public function test_admin_can_search_filter_and_view_order_details_with_customer(): void
    {
        [$code, $id, , $customer] = $this->customerOrder();

        $this->getJson('/api/admin/orders?q='.$code)->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/admin/orders?q='.urlencode($customer->email))->assertJsonCount(1, 'data');
        $this->getJson('/api/admin/orders?status=completed')->assertJsonCount(0, 'data');
        $this->getJson('/api/admin/orders?from='.now()->toDateString().'&to='.now()->toDateString())->assertJsonCount(1, 'data');
        $this->getJson('/api/admin/orders?from='.now()->addDay()->toDateString())->assertJsonCount(0, 'data');
        $this->getJson("/api/admin/orders/{$id}")->assertOk()
            ->assertJsonPath('data.code', $code)->assertJsonPath('data.customer.email', $customer->email)
            ->assertJsonStructure(['data' => ['items', 'histories', 'admin_note', 'total']]);
    }

    public function test_order_moves_through_the_workflow_and_every_change_is_logged(): void
    {
        [, $id] = $this->customerOrder();

        $this->patchJson("/api/admin/orders/{$id}/status", ['status' => 'confirmed', 'note' => 'Đã gọi xác nhận'])->assertOk()->assertJsonPath('data.status', 'confirmed');
        $this->patchJson("/api/admin/orders/{$id}/status", ['status' => 'shipping'])->assertOk();
        $done = $this->patchJson("/api/admin/orders/{$id}/status", ['status' => 'completed'])->assertOk()
            ->assertJsonPath('data.status', 'completed')->assertJsonPath('data.payment_status', 'paid');

        $this->assertNotNull($done->json('data.completed_at'));
        $this->assertSame(['pending', 'confirmed', 'shipping', 'completed'], array_column($done->json('data.histories'), 'to_status'));
        $this->assertSame('Đã gọi xác nhận', $done->json('data.histories.1.note'));
    }

    public function test_invalid_transitions_are_rejected_and_final_states_are_locked(): void
    {
        [, $id] = $this->customerOrder();

        $this->patchJson("/api/admin/orders/{$id}/status", ['status' => 'completed'])->assertUnprocessable();
        $this->patchJson("/api/admin/orders/{$id}/status", ['status' => 'shipping'])->assertUnprocessable();
        $this->patchJson("/api/admin/orders/{$id}/status", ['status' => 'unknown'])->assertUnprocessable()->assertJsonValidationErrors('status');

        $this->patchJson("/api/admin/orders/{$id}/status", ['status' => 'cancelled', 'note' => 'Khách đổi ý'])->assertOk();
        $this->patchJson("/api/admin/orders/{$id}/status", ['status' => 'confirmed'])->assertUnprocessable();
        $this->assertSame('cancelled', Order::query()->find($id)->status->value);
    }

    public function test_cancelling_requires_a_reason_and_restores_stock_and_coupon_usage(): void
    {
        $this->actingAsCustomer();
        $coupon = Coupon::factory()->create(['code' => 'SALE10']);
        $variant = $this->makeVariant(10, 100000);
        $this->addToCart($variant, 3);
        $id = Order::query()->where('code', $this->placeOrder(['coupon_code' => 'SALE10']))->value('id');
        $this->actingAsAdmin();
        $this->patchJson("/api/admin/orders/{$id}/status", ['status' => 'confirmed'])->assertOk();

        $this->patchJson("/api/admin/orders/{$id}/status", ['status' => 'cancelled'])->assertUnprocessable()->assertJsonPath('message', 'Vui lòng nhập lý do hủy đơn.');
        $this->assertSame(7, $variant->fresh()->stock);

        $this->patchJson("/api/admin/orders/{$id}/status", ['status' => 'cancelled', 'note' => 'Hết hàng thực tế'])
            ->assertOk()->assertJsonPath('data.cancel_reason', 'Hết hàng thực tế');
        $this->assertSame(10, $variant->fresh()->stock);
        $this->assertSame(0, $coupon->fresh()->used_count);
    }

    public function test_admin_can_record_internal_note_and_cod_payment(): void
    {
        [, $id] = $this->customerOrder();

        $this->patchJson("/api/admin/orders/{$id}/note", ['admin_note' => 'Khách VIP'])->assertOk()->assertJsonPath('data.admin_note', 'Khách VIP');
        $this->patchJson("/api/admin/orders/{$id}/payment")->assertUnprocessable();

        $this->patchJson("/api/admin/orders/{$id}/status", ['status' => 'confirmed']);
        $this->patchJson("/api/admin/orders/{$id}/status", ['status' => 'shipping']);
        $this->patchJson("/api/admin/orders/{$id}/payment")->assertOk()->assertJsonPath('data.payment_status', 'paid');
        $this->patchJson("/api/admin/orders/{$id}/payment")->assertUnprocessable();
    }

    public function test_customers_never_see_the_internal_note(): void
    {
        [$code, $id, , $customer] = $this->customerOrder();
        $this->patchJson("/api/admin/orders/{$id}/note", ['admin_note' => 'Chỉ nội bộ'])->assertOk();

        $this->actingAsCustomer($customer);
        $this->getJson("/api/orders/{$code}")->assertOk()->assertJsonMissingPath('data.admin_note')->assertJsonMissingPath('data.customer');
    }

    public function test_unknown_order_returns_404(): void
    {
        $this->actingAsAdmin();
        $this->getJson('/api/admin/orders/999999')->assertNotFound();
        $this->patchJson('/api/admin/orders/999999/status', ['status' => 'confirmed'])->assertNotFound();
    }
}
