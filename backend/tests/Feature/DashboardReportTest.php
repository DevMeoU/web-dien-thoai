<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesShopData;
use Tests\TestCase;

class DashboardReportTest extends TestCase
{
    use CreatesShopData, RefreshDatabase;

    /** Dựng dữ liệu: 2 đơn hoàn tất (400k + 100k), 1 đơn chờ, 1 đơn hủy. */
    private function seedOrders(): void
    {
        $buyer = User::factory()->create(['name' => 'Khách VIP']);
        $variant = $this->makeVariant(20, 100000, ['name' => 'Áo bán chạy']);
        $this->makeVariant(2, 50000, ['name' => 'Áo sắp hết']);
        $this->actingAsCustomer($buyer);

        foreach ([[4, 'completed'], [1, 'completed'], [2, 'pending'], [1, 'cancelled']] as [$quantity, $status]) {
            $this->addToCart($variant, $quantity);
            $order = Order::query()->where('code', $this->placeOrder())->first();
            $order->update(['status' => $status, 'completed_at' => $status === 'completed' ? now() : null]);
            if ($status === 'completed') {
                $order->update(['total' => $quantity * 100000]);
            }
        }
        $this->actingAsAdmin();
    }

    public function test_dashboard_shows_counts_revenue_recent_orders_and_low_stock(): void
    {
        $this->seedOrders();

        $this->getJson('/api/admin/dashboard')->assertOk()
            ->assertJsonPath('data.customers_count', 1)->assertJsonPath('data.products_count', 2)
            ->assertJsonPath('data.new_orders_count', 4)->assertJsonPath('data.pending_orders_count', 1)
            ->assertJsonPath('data.revenue', 500000)
            ->assertJsonCount(4, 'data.recent_orders')->assertJsonCount(30, 'data.chart')
            ->assertJsonPath('data.low_stock.0.product.name', 'Áo sắp hết');
    }

    public function test_dashboard_can_be_filtered_by_date_range(): void
    {
        $this->seedOrders();
        $yesterday = now()->subDays(2)->toDateString();

        $this->getJson("/api/admin/dashboard?from={$yesterday}&to={$yesterday}")->assertOk()
            ->assertJsonPath('data.new_orders_count', 0)->assertJsonPath('data.revenue', 0)->assertJsonCount(1, 'data.chart');
        $this->getJson('/api/admin/dashboard?from=2026-12-31&to=2026-01-01')->assertUnprocessable()->assertJsonValidationErrors('to');
    }

    public function test_report_summarises_status_top_products_customers_and_inventory(): void
    {
        $this->seedOrders();

        $report = $this->getJson('/api/admin/reports')->assertOk()
            ->assertJsonPath('data.revenue', 500000)
            ->assertJsonPath('data.orders_by_status.completed', 2)->assertJsonPath('data.orders_by_status.pending', 1)
            ->assertJsonPath('data.orders_by_status.cancelled', 1)->assertJsonPath('data.orders_by_status.shipping', 0)
            ->assertJsonPath('data.top_products.0.product_name', 'Áo bán chạy')
            ->assertJsonPath('data.top_customers.0.name', 'Khách VIP');

        $this->assertEquals(5, $report->json('data.top_products.0.quantity_sold'));
        $this->assertEquals(2, $report->json('data.top_customers.0.orders_count'));
        $this->assertEquals(1, $report->json('data.inventory.low_stock'));
    }

    public function test_reports_can_be_exported_as_utf8_csv(): void
    {
        $this->seedOrders();

        foreach (['orders', 'products', 'customers', 'revenue'] as $type) {
            $response = $this->get("/api/admin/reports/export?type={$type}")->assertOk();
            $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
            $this->assertStringContainsString('attachment', $response->headers->get('Content-Disposition'));
        }

        $orders = $this->get('/api/admin/reports/export?type=orders')->streamedContent();
        $this->assertStringStartsWith("\xEF\xBB\xBF", $orders);
        $this->assertStringContainsString('Mã đơn', $orders);
        $this->assertSame(5, substr_count(trim($orders), "\n") + 1);

        $this->getJson('/api/admin/reports/export?type=unknown')->assertUnprocessable()->assertJsonValidationErrors('type');
    }

    public function test_dashboard_and_reports_require_admin(): void
    {
        $this->getJson('/api/admin/dashboard')->assertUnauthorized();
        $this->actingAsCustomer();
        $this->getJson('/api/admin/dashboard')->assertForbidden();
        $this->getJson('/api/admin/reports')->assertForbidden();
        $this->getJson('/api/admin/reports/export')->assertForbidden();
    }
}
